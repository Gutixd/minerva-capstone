-- =============================================================================
-- MINERVA · Esquema inicial
-- Ejecutar en Supabase > SQL Editor (o `supabase db push`).
-- =============================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Administradores
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  placeholder_art text,
  position int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null default '',
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  stock integer not null default 0 check (stock >= 0),
  featured boolean not null default false,
  customizable boolean not null default true,
  active boolean not null default true,
  badge text check (badge in ('nuevo', 'mas-vendido', 'personalizable')),
  preparation_days int not null default 3,
  preview_kind text not null default 'generic' check (preview_kind in ('mug', 'notebook', 'tote', 'generic')),
  placeholder_art text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_category_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active, created_at desc);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  storage_path text,
  position int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images(product_id, position);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  price_delta integer not null default 0,
  stock integer check (stock is null or stock >= 0),
  position int not null default 0
);
create index if not exists product_variants_product_idx on public.product_variants(product_id, position);

-- ---------------------------------------------------------------------------
-- Clientes y pedidos
-- ---------------------------------------------------------------------------
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  address text not null,
  comuna text not null,
  region text not null,
  created_at timestamptz not null default now()
);
create index if not exists customers_email_idx on public.customers(lower(email));

create sequence if not exists public.order_number_seq start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('MIN-' || nextval('public.order_number_seq')),
  customer_id uuid not null references public.customers(id) on delete restrict,
  total integer not null,
  status text not null default 'pendiente'
    check (status in ('pendiente', 'confirmado', 'en_produccion', 'listo', 'entregado', 'cancelado')),
  payment_status text not null default 'pendiente'
    check (payment_status in ('pendiente', 'pagado', 'reembolsado')),
  delivery_status text not null default 'por_coordinar'
    check (delivery_status in ('por_coordinar', 'preparando', 'enviado', 'entregado')),
  payment_method text not null default 'whatsapp',
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists orders_created_idx on public.orders(created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  variant_name text,
  quantity int not null check (quantity > 0),
  unit_price integer not null,
  customization_data jsonb
);
create index if not exists order_items_order_idx on public.order_items(order_id);

create table if not exists public.customizations (
  id uuid primary key default gen_random_uuid(),
  order_item_id uuid not null references public.order_items(id) on delete cascade,
  text text,
  name text,
  image_path text,
  data jsonb,
  created_at timestamptz not null default now()
);

-- updated_at automático
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists products_touch on public.products;
create trigger products_touch before update on public.products
for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- create_order: única vía para crear pedidos desde la web.
-- Recalcula precios y valida stock en el servidor.
-- ---------------------------------------------------------------------------
create or replace function public.create_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  c jsonb := payload -> 'customer';
  item jsonb;
  p public.products%rowtype;
  v public.product_variants%rowtype;
  qty int;
  unit int;
  v_customer_id uuid;
  v_order public.orders%rowtype;
  v_item_id uuid;
  v_total int := 0;
begin
  if jsonb_typeof(payload -> 'items') <> 'array' or jsonb_array_length(payload -> 'items') = 0 then
    raise exception 'empty order';
  end if;
  if jsonb_array_length(payload -> 'items') > 50 then
    raise exception 'too many items';
  end if;
  if coalesce(trim(c ->> 'email'), '') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
    raise exception 'invalid email';
  end if;

  insert into public.customers (user_id, first_name, last_name, email, phone, address, comuna, region)
  values (
    auth.uid(),
    left(trim(c ->> 'first_name'), 80), left(trim(c ->> 'last_name'), 80),
    lower(left(trim(c ->> 'email'), 160)), left(trim(c ->> 'phone'), 30),
    left(trim(c ->> 'address'), 200), left(trim(c ->> 'comuna'), 80), left(trim(c ->> 'region'), 80)
  )
  returning id into v_customer_id;

  insert into public.orders (customer_id, total, payment_method, notes)
  values (
    v_customer_id, 0,
    coalesce(nullif(payload ->> 'payment_method', ''), 'whatsapp'),
    left(nullif(trim(c ->> 'notes'), ''), 1000)
  )
  returning * into v_order;

  for item in select * from jsonb_array_elements(payload -> 'items') loop
    qty := greatest(1, least(99, (item ->> 'quantity')::int));

    select * into p from public.products
      where id = (item ->> 'product_id')::uuid and active
      for update;
    if not found then raise exception 'product unavailable'; end if;
    if p.stock < qty then raise exception 'insufficient stock for %', p.name; end if;

    unit := p.price;
    v := null;
    if nullif(item ->> 'variant_id', '') is not null then
      select * into v from public.product_variants
        where id = (item ->> 'variant_id')::uuid and product_id = p.id;
      if not found then raise exception 'product variant unavailable'; end if;
      unit := unit + v.price_delta;
    end if;

    update public.products set stock = stock - qty where id = p.id;

    insert into public.order_items (order_id, product_id, product_name, variant_name, quantity, unit_price, customization_data)
    values (v_order.id, p.id, p.name, v.name, qty, unit, item -> 'customization')
    returning id into v_item_id;

    if jsonb_typeof(item -> 'customization') = 'object' then
      insert into public.customizations (order_item_id, text, name, image_path, data)
      values (
        v_item_id,
        left(item -> 'customization' ->> 'text', 200),
        left(item -> 'customization' ->> 'name', 80),
        left(item -> 'customization' ->> 'image_path', 300),
        item -> 'customization'
      );
    end if;

    v_total := v_total + unit * qty;
  end loop;

  update public.orders set total = v_total where id = v_order.id;

  return jsonb_build_object('id', v_order.id, 'order_number', v_order.order_number, 'total', v_total);
end $$;

revoke all on function public.create_order(jsonb) from public;
grant execute on function public.create_order(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.admins enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.customers enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.customizations enable row level security;

-- admins: cada usuario solo ve su propia fila (para saber si es admin)
drop policy if exists "admins self read" on public.admins;
create policy "admins self read" on public.admins for select to authenticated using (user_id = auth.uid());

-- Catálogo: lectura pública, escritura solo admin
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "categories admin write" on public.categories;
create policy "categories admin write" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products public read" on public.products;
create policy "products public read" on public.products for select using (active or public.is_admin());
drop policy if exists "products admin write" on public.products;
create policy "products admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_images public read" on public.product_images;
create policy "product_images public read" on public.product_images for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
);
drop policy if exists "product_images admin write" on public.product_images;
create policy "product_images admin write" on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_variants public read" on public.product_variants;
create policy "product_variants public read" on public.product_variants for select using (
  exists (select 1 from public.products p where p.id = product_id and (p.active or public.is_admin()))
);
drop policy if exists "product_variants admin write" on public.product_variants;
create policy "product_variants admin write" on public.product_variants for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Clientes / pedidos: el cliente autenticado ve lo suyo; el admin ve y gestiona todo.
-- No hay políticas de INSERT: los pedidos solo se crean mediante create_order().
drop policy if exists "customers own read" on public.customers;
create policy "customers own read" on public.customers for select to authenticated using (
  public.is_admin() or user_id = auth.uid() or lower(email) = lower(auth.jwt() ->> 'email')
);
drop policy if exists "customers admin write" on public.customers;
create policy "customers admin write" on public.customers for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders own read" on public.orders;
create policy "orders own read" on public.orders for select to authenticated using (
  public.is_admin() or exists (
    select 1 from public.customers cu where cu.id = customer_id
      and (cu.user_id = auth.uid() or lower(cu.email) = lower(auth.jwt() ->> 'email'))
  )
);
drop policy if exists "orders admin update" on public.orders;
create policy "orders admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders admin delete" on public.orders;
create policy "orders admin delete" on public.orders for delete to authenticated using (public.is_admin());

drop policy if exists "order_items own read" on public.order_items;
create policy "order_items own read" on public.order_items for select to authenticated using (
  exists (select 1 from public.orders o where o.id = order_id)  -- hereda la política de orders
);

drop policy if exists "customizations admin read" on public.customizations;
create policy "customizations admin read" on public.customizations for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  ('customer-uploads', 'customer-uploads', false, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Fotos de productos: lectura pública (bucket público), escritura solo admin
drop policy if exists "product images admin insert" on storage.objects;
create policy "product images admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin update" on storage.objects;
create policy "product images admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
drop policy if exists "product images admin delete" on storage.objects;
create policy "product images admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- Archivos de personalización: cualquiera puede subir (sin sobrescribir), solo admin puede leer/borrar
drop policy if exists "customer uploads insert" on storage.objects;
create policy "customer uploads insert" on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'customer-uploads');
drop policy if exists "customer uploads admin read" on storage.objects;
create policy "customer uploads admin read" on storage.objects for select to authenticated
  using (bucket_id = 'customer-uploads' and public.is_admin());
drop policy if exists "customer uploads admin delete" on storage.objects;
create policy "customer uploads admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'customer-uploads' and public.is_admin());

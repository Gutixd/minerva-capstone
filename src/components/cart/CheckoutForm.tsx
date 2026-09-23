"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cartTotal, useCart } from "@/lib/stores";
import { cn, formatCLP } from "@/lib/format";
import { REGIONS } from "@/lib/regions";
import { placeOrder } from "@/lib/orders";
import { paymentProviders, type PaymentMethodId } from "@/lib/payments";
import type { CheckoutCustomer } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/product/ProductImage";

type Errors = Partial<Record<keyof CheckoutCustomer, string>>;

const EMPTY: CheckoutCustomer = { first_name: "", last_name: "", email: "", phone: "", address: "", comuna: "", region: "Metropolitana de Santiago", notes: "" };
const DRAFT_KEY = "minerva-checkout-draft";

function validate(c: CheckoutCustomer): Errors {
  const e: Errors = {};
  if (!c.first_name.trim()) e.first_name = "Ingresa tu nombre.";
  if (!c.last_name.trim()) e.last_name = "Ingresa tu apellido.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email.trim())) e.email = "Ingresa un email válido.";
  if (c.phone.replace(/\D/g, "").length < 8) e.phone = "Ingresa un teléfono válido (ej: +56 9 1234 5678).";
  if (!c.address.trim()) e.address = "Ingresa tu dirección.";
  if (!c.comuna.trim()) e.comuna = "Ingresa tu comuna.";
  if (!c.region) e.region = "Selecciona tu región.";
  return e;
}

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<CheckoutCustomer>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [method, setMethod] = useState<PaymentMethodId>("whatsapp");
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [placed, setPlaced] = useState(false);

  useEffect(() => {
    // useCart se rehidrata en MotionProvider; esperamos a que termine
    const done = () => setHydrated(true);
    if (useCart.persist.hasHydrated()) done();
    const unsub = useCart.persist.onFinishHydration(done);
    try {
      const draft = localStorage.getItem(DRAFT_KEY);
      if (draft) setData({ ...EMPTY, ...JSON.parse(draft) });
    } catch {
      /* sin borrador */
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...data, notes: "" }));
    } catch {
      /* ignorar */
    }
  }, [data, hydrated]);

  const total = cartTotal(items);
  const set = (k: keyof CheckoutCustomer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setData((d) => ({ ...d, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    const errs = validate(data);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`co-${first}`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const order = await placeOrder(items, data, method);
      const provider = paymentProviders.find((p) => p.id === method)!;
      setPlaced(true);
      if (method !== "whatsapp") {
        const url = await provider.start(order);
        clear();
        window.location.href = url;
        return;
      }
      clear();
      router.push(`/pedido/${encodeURIComponent(order.order_number)}`);
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Ocurrió un error inesperado.");
      setSubmitting(false);
    }
  };

  if (!hydrated || placed) {
    return (
      <div className="mt-10 grid gap-8 lg:grid-cols-12" aria-busy="true" aria-label="Cargando checkout">
        <div className="skeleton h-[32rem] rounded-[2rem] lg:col-span-7" />
        <div className="skeleton h-80 rounded-[2rem] lg:col-span-5" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 flex flex-col items-center rounded-[2rem] bg-paper-2 px-6 py-20 text-center">
        <span className="grid size-16 place-items-center rounded-full bg-white">
          <Icon name="bag" size={26} />
        </span>
        <h2 className="display mt-5 text-3xl">Tu carrito está vacío</h2>
        <p className="mt-2 max-w-sm text-ink-soft">Agrega productos para poder finalizar tu compra.</p>
        <Link href="/productos" className="btn btn-primary mt-6">
          Ver productos <Icon name="arrow" size={18} />
        </Link>
      </div>
    );
  }

  const field = (k: keyof CheckoutCustomer, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, span = "sm:col-span-1") => (
    <div className={span}>
      <label htmlFor={`co-${k}`} className="label">
        {label}
      </label>
      <input
        id={`co-${k}`}
        className="field"
        value={data[k]}
        onChange={set(k)}
        aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `co-${k}-err` : undefined}
        {...props}
      />
      {errors[k] && (
        <p id={`co-${k}-err`} className="mt-1.5 text-sm text-m-red">
          {errors[k]}
        </p>
      )}
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-10 grid gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-8 lg:col-span-7">
        <fieldset className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <legend className="sr-only">Tus datos</legend>
          <h2 className="display text-2xl">Tus datos</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field("first_name", "Nombre", { autoComplete: "given-name" })}
            {field("last_name", "Apellido", { autoComplete: "family-name" })}
            {field("email", "Email", { type: "email", autoComplete: "email", inputMode: "email" })}
            {field("phone", "Teléfono", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "+56 9 1234 5678" })}
          </div>
        </fieldset>

        <fieldset className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <legend className="sr-only">Entrega</legend>
          <h2 className="display text-2xl">Entrega</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {field("address", "Dirección", { autoComplete: "street-address", placeholder: "Calle, número, depto." }, "sm:col-span-2")}
            {field("comuna", "Comuna", { autoComplete: "address-level2" })}
            <div>
              <label htmlFor="co-region" className="label">
                Región
              </label>
              <select id="co-region" className="field" value={data.region} onChange={set("region")} autoComplete="address-level1">
                {REGIONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-notes" className="label">
                Notas <span className="font-normal text-ink-soft">(opcional)</span>
              </label>
              <textarea
                id="co-notes"
                className="field resize-none"
                rows={3}
                maxLength={1000}
                value={data.notes}
                onChange={set("notes")}
                placeholder="Fecha especial, indicaciones de entrega, detalles del diseño…"
              />
            </div>
          </div>
        </fieldset>

        <fieldset className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8">
          <legend className="sr-only">Pago</legend>
          <h2 className="display text-2xl">Pago</h2>
          <div className="mt-6 space-y-3" role="radiogroup" aria-label="Método de pago">
            {paymentProviders.map((p) => (
              <label
                key={p.id}
                className={cn(
                  "flex items-start gap-4 rounded-2xl border p-4 transition-colors",
                  !p.enabled ? "cursor-not-allowed border-line opacity-55" : method === p.id ? "cursor-pointer border-ink bg-paper" : "cursor-pointer border-line hover:border-ink/40",
                )}
              >
                <input
                  type="radio"
                  name="payment"
                  value={p.id}
                  checked={method === p.id}
                  disabled={!p.enabled}
                  onChange={() => setMethod(p.id)}
                  className="mt-1 size-4 accent-[var(--color-ink)]"
                />
                <span className="flex-1">
                  <span className="flex items-center gap-2 font-semibold">
                    {p.label}
                    {!p.enabled && <span className="rounded-full bg-paper-2 px-2 py-0.5 text-xs font-medium text-ink-soft">Próximamente</span>}
                  </span>
                  <span className="mt-0.5 block text-sm text-ink-soft">{p.description}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <aside className="lg:col-span-5">
        <div className="rounded-[2rem] bg-white p-6 shadow-[var(--shadow-soft)] sm:p-8 lg:sticky lg:top-28">
          <h2 className="display text-2xl">Tu pedido</h2>
          <ul className="mt-6 max-h-80 space-y-4 overflow-y-auto pr-1">
            {items.map((i) => (
              <li key={i.key} className="flex gap-3">
                <span className="relative aspect-square w-16 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                  <ProductImage src={i.image} art={i.art} alt="" sizes="64px" />
                  <span className="absolute right-1 top-1 grid min-w-5 place-items-center rounded-full bg-ink px-1 text-[0.65rem] font-bold leading-5 text-white">{i.quantity}</span>
                </span>
                <span className="min-w-0 flex-1 text-sm">
                  <span className="line-clamp-2 font-medium">{i.name}</span>
                  {i.variantName && <span className="block text-ink-soft">{i.variantName}</span>}
                  {i.customization && <span className="block text-m-violet">Personalizado</span>}
                </span>
                <span className="text-sm font-semibold tabular-nums">{formatCLP(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="tabular-nums">{formatCLP(total)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-soft">Envío</dt>
              <dd>Se coordina por WhatsApp</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-3">
              <dt className="font-semibold">Total productos</dt>
              <dd className="display text-2xl tabular-nums">{formatCLP(total)}</dd>
            </div>
          </dl>

          {serverError && (
            <p role="alert" className="mt-5 rounded-2xl bg-m-red/10 p-4 text-sm text-m-red">
              {serverError}
            </p>
          )}

          <button type="submit" disabled={submitting} className="btn btn-primary mt-6 h-14 w-full text-base">
            {submitting ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Registrando pedido…
              </>
            ) : (
              <>
                Confirmar pedido <Icon name="arrow" size={18} />
              </>
            )}
          </button>
          <p className="mt-3 text-center text-xs text-ink-soft">
            Al confirmar registramos tu pedido y te llevamos a coordinar el pago y envío por WhatsApp.
          </p>
        </div>
      </aside>
    </form>
  );
}

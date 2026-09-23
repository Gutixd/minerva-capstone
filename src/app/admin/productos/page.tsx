"use client";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { adminDb, errorMessage, removePublicImage, revalidateStore } from "@/lib/admin";
import { normalizeProduct, PRODUCT_SELECT } from "@/lib/product-utils";
import { cn, formatCLP } from "@/lib/format";
import { toast } from "@/lib/stores";
import type { Product } from "@/lib/types";
import { AdminHeader } from "@/components/admin/AdminShell";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/product/ProductImage";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-ink" : "bg-line")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5.5" : "translate-x-0.5")} />
    </button>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [q, setQ] = useState("");
  const [toDelete, setToDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await adminDb().from("products").select(PRODUCT_SELECT).order("created_at", { ascending: false });
    if (error) toast({ title: "Error al cargar productos", description: error.message, tone: "error" });
    setProducts((data ?? []).map(normalizeProduct));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const t = q.toLowerCase().trim();
    return (products ?? []).filter((p) => !t || p.name.toLowerCase().includes(t) || p.category?.name.toLowerCase().includes(t));
  }, [products, q]);

  const patch = async (p: Product, values: Partial<Pick<Product, "active" | "featured" | "stock" | "price">>) => {
    setProducts((list) => list?.map((x) => (x.id === p.id ? { ...x, ...values } : x)) ?? null);
    const { error } = await adminDb().from("products").update(values).eq("id", p.id);
    if (error) {
      toast({ title: "No se pudo guardar", description: errorMessage(error), tone: "error" });
      void load();
    } else {
      void revalidateStore();
    }
  };

  const remove = async () => {
    if (!toDelete) return;
    setDeleting(true);
    const sb = adminDb();
    const { data: imgs } = await sb.from("product_images").select("storage_path").eq("product_id", toDelete.id);
    const { error } = await sb.from("products").delete().eq("id", toDelete.id);
    setDeleting(false);
    if (error) {
      toast({ title: "No se pudo eliminar", description: errorMessage(error), tone: "error" });
      return;
    }
    await Promise.all((imgs ?? []).map((i) => removePublicImage(i.storage_path)));
    toast({ title: "Producto eliminado" });
    setToDelete(null);
    void revalidateStore();
    void load();
  };

  return (
    <>
      <AdminHeader
        title="Productos"
        description={products ? `${products.length} productos en total` : undefined}
        action={
          <Link href="/admin/productos/nuevo" className="btn btn-primary">
            <Icon name="plus" size={18} /> Nuevo producto
          </Link>
        }
      />
      <label className="relative mb-4 block max-w-sm">
        <span className="sr-only">Buscar productos</span>
        <Icon name="search" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-soft" />
        <input className="field pl-10" placeholder="Buscar por nombre o categoría" value={q} onChange={(e) => setQ(e.target.value)} />
      </label>

      <div className="overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-soft)]">
        {products === null ? (
          <div className="space-y-2 p-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-16 rounded-2xl" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="display text-2xl">{products.length ? "Sin resultados" : "Aún no hay productos"}</p>
            {!products.length && (
              <Link href="/admin/productos/nuevo" className="btn btn-primary mt-4">
                Crear el primero
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead className="border-b border-line text-left text-xs uppercase tracking-wider text-ink-soft">
                <tr>
                  <th className="px-4 py-3 font-semibold">Producto</th>
                  <th className="px-4 py-3 font-semibold">Precio</th>
                  <th className="px-4 py-3 font-semibold">Stock</th>
                  <th className="px-4 py-3 font-semibold">Destacado</th>
                  <th className="px-4 py-3 font-semibold">Activo</th>
                  <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {filtered.map((p) => (
                  <tr key={p.id} className={cn(!p.active && "opacity-60")}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <span className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                          <ProductImage src={p.images[0]?.image_url} art={p.placeholder_art} alt="" sizes="48px" />
                        </span>
                        <span className="min-w-0">
                          <Link href={`/admin/productos/${p.id}`} className="block truncate font-semibold hover:underline">
                            {p.name}
                          </Link>
                          <span className="text-ink-soft">{p.category?.name ?? "Sin categoría"}</span>
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 tabular-nums">{formatCLP(p.price)}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min={0}
                        defaultValue={p.stock}
                        aria-label={`Stock de ${p.name}`}
                        className={cn("field !min-h-9 w-20 !rounded-lg !px-2 !py-1 tabular-nums", p.stock === 0 && "!border-m-red")}
                        onBlur={(e) => {
                          const v = Math.max(0, Math.floor(Number(e.target.value)));
                          if (Number.isFinite(v) && v !== p.stock) void patch(p, { stock: v });
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle checked={p.featured} onChange={(v) => patch(p, { featured: v })} label={`Destacar ${p.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <Toggle checked={p.active} onChange={(v) => patch(p, { active: v })} label={`Activar ${p.name}`} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link href={`/admin/productos/${p.id}`} className="grid size-9 place-items-center rounded-full hover:bg-paper" aria-label={`Editar ${p.name}`}>
                          <Icon name="edit" size={17} />
                        </Link>
                        <button type="button" onClick={() => setToDelete(p)} className="grid size-9 place-items-center rounded-full hover:bg-m-red/10 hover:text-m-red" aria-label={`Eliminar ${p.name}`}>
                          <Icon name="trash" size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="¿Eliminar producto?"
        description={`“${toDelete?.name}” y sus fotos se eliminarán permanentemente. Los pedidos existentes conservan su detalle.`}
        onCancel={() => setToDelete(null)}
        onConfirm={remove}
        busy={deleting}
      />
    </>
  );
}

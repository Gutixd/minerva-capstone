"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { adminDb } from "@/lib/admin";
import { formatCLP } from "@/lib/format";
import { orderStatusLabel } from "@/lib/order-status";
import { AdminHeader } from "@/components/admin/AdminShell";
import { Icon } from "@/components/ui/Icon";

interface Stats {
  activeProducts: number;
  pendingOrders: number;
  monthRevenue: number;
  lowStock: { id: string; name: string; stock: number }[];
  recent: { id: string; order_number: string; total: number; status: string; created_at: string; customer: { first_name: string; last_name: string } | null }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sb = adminDb();
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    Promise.all([
      sb.from("products").select("id", { count: "exact", head: true }).eq("active", true),
      sb.from("orders").select("id", { count: "exact", head: true }).eq("status", "pendiente"),
      sb.from("orders").select("total").gte("created_at", monthStart).neq("status", "cancelado"),
      sb.from("products").select("id, name, stock").lte("stock", 5).eq("active", true).order("stock"),
      sb.from("orders").select("id, order_number, total, status, created_at, customer:customers(first_name,last_name)").order("created_at", { ascending: false }).limit(6),
    ]).then(([a, p, m, l, r]) => {
      const err = [a, p, m, l, r].find((x) => x.error)?.error;
      if (err) return setError(err.message);
      setStats({
        activeProducts: a.count ?? 0,
        pendingOrders: p.count ?? 0,
        monthRevenue: (m.data ?? []).reduce((n, o) => n + Number(o.total), 0),
        lowStock: (l.data ?? []) as Stats["lowStock"],
        recent: (r.data ?? []) as unknown as Stats["recent"],
      });
    });
  }, []);

  return (
    <>
      <AdminHeader
        title="Resumen"
        description="El estado de tu tienda de un vistazo."
        action={
          <Link href="/admin/productos/nuevo" className="btn btn-primary">
            <Icon name="plus" size={18} /> Nuevo producto
          </Link>
        }
      />
      {error && <p className="rounded-2xl bg-m-red/10 p-4 text-m-red">{error}</p>}
      {!stats && !error ? (
        <div className="grid gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-32 rounded-3xl" />
          ))}
        </div>
      ) : stats ? (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Productos activos", value: String(stats.activeProducts), href: "/admin/productos" },
              { label: "Pedidos pendientes", value: String(stats.pendingOrders), href: "/admin/pedidos" },
              { label: "Ventas del mes", value: formatCLP(stats.monthRevenue), href: "/admin/pedidos" },
            ].map((s) => (
              <Link key={s.label} href={s.href} className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-lift)]">
                <p className="text-sm text-ink-soft">{s.label}</p>
                <p className="display mt-2 text-4xl tabular-nums">{s.value}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <section className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="display text-xl">Pedidos recientes</h2>
              {stats.recent.length === 0 ? (
                <p className="mt-4 text-ink-soft">Aún no hay pedidos.</p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {stats.recent.map((o) => (
                    <li key={o.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <span>
                        <span className="font-semibold">{o.order_number}</span>
                        <span className="block text-ink-soft">
                          {o.customer ? `${o.customer.first_name} ${o.customer.last_name}` : "—"} · {new Date(o.created_at).toLocaleDateString("es-CL")}
                        </span>
                      </span>
                      <span className="text-right">
                        <span className="block font-semibold tabular-nums">{formatCLP(o.total)}</span>
                        <span className="text-xs text-ink-soft">{orderStatusLabel.status[o.status as keyof typeof orderStatusLabel.status]}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
            <section className="rounded-3xl bg-white p-6 shadow-[var(--shadow-soft)]">
              <h2 className="display text-xl">Stock bajo</h2>
              {stats.lowStock.length === 0 ? (
                <p className="mt-4 text-ink-soft">Todo el stock está en orden. ✨</p>
              ) : (
                <ul className="mt-4 divide-y divide-line">
                  {stats.lowStock.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                      <Link href={`/admin/productos/${p.id}`} className="font-medium hover:underline">
                        {p.name}
                      </Link>
                      <span className={p.stock === 0 ? "font-semibold text-m-red" : "font-semibold text-[#b8481f]"}>{p.stock} u.</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>
        </>
      ) : null}
    </>
  );
}

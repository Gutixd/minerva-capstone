const clp = new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 });

export const formatCLP = (value: number) => clp.format(Math.round(value));

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function stockLabel(stock: number) {
  if (stock <= 0) return { label: "Agotado", tone: "out" as const };
  if (stock <= 5) return { label: `Últimas ${stock} unidades`, tone: "low" as const };
  return { label: "Disponible", tone: "ok" as const };
}

export const badgeLabel = { nuevo: "Nuevo", "mas-vendido": "Más vendido", personalizable: "Personalizable" } as const;

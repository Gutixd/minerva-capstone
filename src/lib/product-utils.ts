import type { Product } from "./types";

export const PRODUCT_SELECT =
  "*, category:categories(id,name,slug), images:product_images(*), variants:product_variants(*)";

export function normalizeProduct(row: Record<string, unknown>): Product {
  const p = row as unknown as Product;
  return {
    ...p,
    price: Number(p.price),
    compare_at_price: p.compare_at_price == null ? null : Number(p.compare_at_price),
    images: [...(p.images ?? [])].sort((a, b) => a.position - b.position),
    variants: [...(p.variants ?? [])].sort((a, b) => a.position - b.position),
  };
}

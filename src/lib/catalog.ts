import "server-only";
import { cache } from "react";
import { demoCategories, demoProducts } from "./demo-data";
import { getServerSupabase } from "./supabase/server";
import { normalizeProduct, PRODUCT_SELECT } from "./product-utils";
import type { Category, Product } from "./types";

export const getCategories = cache(async (): Promise<Category[]> => {
  const sb = getServerSupabase();
  if (!sb) return demoCategories;
  const { data, error } = await sb.from("categories").select("*").order("position");
  if (error) {
    console.error("[catalog] categories", error.message);
    return [];
  }
  return data as Category[];
});

export const getProducts = cache(async (): Promise<Product[]> => {
  const sb = getServerSupabase();
  if (!sb) return demoProducts;
  const { data, error } = await sb
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("active", true)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("[catalog] products", error.message);
    return [];
  }
  return data.map(normalizeProduct);
});

export const getProduct = cache(async (slug: string): Promise<Product | null> => {
  const products = await getProducts();
  return products.find((p) => p.slug === slug) ?? null;
});

export type SearchEntry = Pick<Product, "id" | "name" | "slug" | "price" | "placeholder_art"> & {
  category: string | null;
  image: string | null;
};

export const getSearchIndex = cache(async (): Promise<SearchEntry[]> =>
  (await getProducts()).map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    placeholder_art: p.placeholder_art,
    category: p.category?.name ?? null,
    image: p.images[0]?.image_url ?? null,
  })),
);

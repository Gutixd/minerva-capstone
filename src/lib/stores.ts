"use client";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { CartItem, Customization } from "./types";

/* ---------------------------------- Carrito --------------------------------- */

type AddInput = Omit<CartItem, "key" | "quantity"> & { quantity?: number };

interface CartState {
  items: CartItem[];
  add: (item: AddInput) => void;
  setQuantity: (key: string, quantity: number) => void;
  remove: (key: string) => void;
  clear: () => void;
}

const hash = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
};

const itemKey = (productId: string, variantId: string | null, c: Customization | null) =>
  `${productId}:${variantId ?? "-"}:${c ? hash(JSON.stringify(c)) : "-"}`;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: ({ quantity = 1, ...input }) =>
        set((state) => {
          const key = itemKey(input.productId, input.variantId, input.customization);
          const existing = state.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.key === key ? { ...i, quantity: Math.min(i.maxQuantity, i.quantity + quantity) } : i,
              ),
            };
          }
          return { items: [...state.items, { ...input, key, quantity: Math.min(input.maxQuantity, quantity) }] };
        }),
      setQuantity: (key, quantity) =>
        set((state) => ({
          items: state.items
            .map((i) => (i.key === key ? { ...i, quantity: Math.min(i.maxQuantity, quantity) } : i))
            .filter((i) => i.quantity > 0),
        })),
      remove: (key) => set((state) => ({ items: state.items.filter((i) => i.key !== key) })),
      clear: () => set({ items: [] }),
    }),
    { name: "minerva-cart", version: 1, storage: createJSONStorage(() => localStorage), skipHydration: true },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartTotal = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity * i.unitPrice, 0);

/* -------------------------------- UI overlays ------------------------------- */

type Overlay = "cart" | "search" | "menu" | null;

export const useUI = create<{ overlay: Overlay; open: (o: Overlay) => void; close: () => void }>((set) => ({
  overlay: null,
  open: (overlay) => set({ overlay }),
  close: () => set({ overlay: null }),
}));

/* ---------------------------------- Toasts ---------------------------------- */

export interface Toast {
  id: number;
  title: string;
  description?: string;
  tone?: "success" | "error" | "info";
  action?: { label: string; onClick: () => void };
}

let toastId = 0;

export const useToasts = create<{ toasts: Toast[]; push: (t: Omit<Toast, "id">) => void; dismiss: (id: number) => void }>(
  (set) => ({
    toasts: [],
    push: (t) => {
      const id = ++toastId;
      set((s) => ({ toasts: [...s.toasts.slice(-2), { ...t, id }] }));
      setTimeout(() => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })), 4200);
    },
    dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
  }),
);

export const toast = (t: Omit<Toast, "id">) => useToasts.getState().push(t);

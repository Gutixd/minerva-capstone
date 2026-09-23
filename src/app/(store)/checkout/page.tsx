import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/CheckoutForm";

export const metadata: Metadata = { title: "Finalizar compra", robots: { index: false } };

export default function CheckoutPage() {
  return (
    <div className="container-x pb-12 pt-28 md:pt-36">
      <p className="eyebrow">Checkout</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">
        Finalizar <span className="serif-accent text-gradient">compra</span>
      </h1>
      <CheckoutForm />
    </div>
  );
}

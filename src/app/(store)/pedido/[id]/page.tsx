import type { Metadata } from "next";
import { OrderConfirmation } from "@/components/cart/OrderConfirmation";

export const metadata: Metadata = { title: "Pedido recibido", robots: { index: false } };

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <div className="container-x pb-12 pt-28 md:pt-36">
      <OrderConfirmation orderNumber={decodeURIComponent(id)} />
    </div>
  );
}

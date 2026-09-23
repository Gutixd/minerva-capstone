import Link from "next/link";
import type { Product } from "@/lib/types";
import { Icon } from "@/components/ui/Icon";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";

export function ProductsSection({ products }: { products: Product[] }) {
  return (
    <section aria-labelledby="productos-title" className="container-x py-12 md:py-20">
      <SectionHeading
        id="productos-title"
        eyebrow="Productos"
        title={
          <>
            Recién salidos <span className="serif-accent">del taller</span>
          </>
        }
        description="Cada pieza se estampa a pedido. Elige, personaliza y nosotros nos encargamos del resto."
        action={
          <Link href="/productos" className="btn btn-primary">
            Ver catálogo completo <Icon name="arrow" size={18} />
          </Link>
        }
      />
      {products.length === 0 ? (
        <p className="mt-12 rounded-3xl bg-paper-2 p-10 text-center text-ink-soft">Pronto publicaremos nuevos productos. ✨</p>
      ) : (
        <div data-reveal="stagger" className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
          {products.slice(0, 8).map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}

import { ProductCardSkeleton } from "@/components/product/ProductCard";

export default function Loading() {
  return (
    <div className="container-x pb-12 pt-32 md:pt-40" aria-busy="true" aria-label="Cargando productos">
      <div className="skeleton h-4 w-24 rounded-full" />
      <div className="skeleton mt-6 h-16 w-3/4 max-w-2xl rounded-2xl" />
      <div className="skeleton mt-4 h-5 w-1/2 max-w-md rounded-full" />
      <div className="mt-12 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="skeleton h-10 w-24 rounded-full" />
        ))}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

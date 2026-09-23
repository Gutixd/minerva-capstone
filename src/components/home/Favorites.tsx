"use client";
import { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ProductCard } from "@/components/product/ProductCard";

/** Carrusel horizontal nativo: funciona con touch, trackpad, rueda horizontal, teclado y arrastre con mouse. */
export function Favorites({ products }: { products: Product[] }) {
  const track = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const max = el.scrollWidth - el.clientWidth;
      setProgress(max > 0 ? el.scrollLeft / max : 0);
    };
    onScroll();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Arrastre con mouse (touch ya es nativo)
    let startX = 0;
    let startScroll = 0;
    let moved = false;
    let down = false;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      down = true;
      moved = false;
      startX = e.clientX;
      startScroll = el.scrollLeft;
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) > 6) {
        moved = true;
        setDragging(true);
        el.setPointerCapture(e.pointerId);
      }
      if (moved) el.scrollLeft = startScroll - dx;
    };
    const onUp = () => {
      down = false;
      if (moved) {
        setDragging(false);
        // Evita que el clic final del arrastre abra un producto
        const block = (ev: MouseEvent) => {
          ev.preventDefault();
          ev.stopPropagation();
        };
        el.addEventListener("click", block, { capture: true, once: true });
        setTimeout(() => el.removeEventListener("click", block, { capture: true }), 50);
      }
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  if (products.length === 0) return null;

  return (
    <section aria-labelledby="favoritos-title" className="py-12 md:py-20">
      <div className="container-x">
        <SectionHeading
          id="favoritos-title"
          eyebrow="Más vendidos"
          title={
            <>
              Los favoritos <span className="serif-accent">de Minerva</span>
            </>
          }
          description="Lo que más nos piden. Arrastra para descubrir."
        />
      </div>

      <div
        ref={track}
        role="region"
        aria-label="Carrusel de productos favoritos"
        tabIndex={0}
        data-lenis-prevent-wheel
        className={`no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-[max(1rem,calc((100vw-88rem)/2+clamp(1rem,4vw,3rem)))] pb-4 md:gap-6 ${
          dragging ? "cursor-grabbing select-none [scroll-behavior:auto] [scroll-snap-type:none]" : "cursor-grab"
        }`}
      >
        {products.map((p) => (
          <div key={p.id} className="w-[72vw] max-w-[22rem] shrink-0 snap-start sm:w-[44vw] lg:w-[24vw]">
            <ProductCard product={p} />
          </div>
        ))}
      </div>

      <div className="container-x mt-6">
        <div className="h-0.5 w-full max-w-xs overflow-hidden rounded-full bg-line" aria-hidden>
          <div className="bg-gradient-minerva h-full origin-left rounded-full" style={{ transform: `scaleX(${Math.max(0.08, progress)})` }} />
        </div>
      </div>
    </section>
  );
}

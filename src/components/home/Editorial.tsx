"use client";
import Link from "next/link";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/format";
import { ProductImage } from "@/components/product/ProductImage";

// Grid asimétrico tipo campaña. `speed` controla el parallax de cada pieza.
const SLOTS = [
  { className: "col-span-12 md:col-span-7 aspect-[4/5] md:aspect-[5/6]", speed: -6, caption: "Para papá, con todo el cariño" },
  { className: "col-span-6 md:col-span-5 md:mt-40 aspect-[3/4]", speed: 10, caption: "Tu nombre, tu estilo" },
  { className: "col-span-6 md:col-span-4 md:mt-6 aspect-[3/4]", speed: 4, caption: "Pequeños detalles" },
  { className: "col-span-12 md:col-span-8 md:mt-6 aspect-[16/10]", speed: -8, caption: "Celebraciones que se recuerdan" },
];

export function Editorial({ products }: { products: Product[] }) {
  const root = useRef<HTMLElement>(null);
  const picks = products.slice(0, SLOTS.length);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const speed = Number(el.dataset.parallax);
          gsap.fromTo(
            el,
            { yPercent: speed },
            { yPercent: -speed, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } },
          );
          const img = el.querySelector("[data-parallax-img]");
          if (img)
            gsap.fromTo(img, { scale: 1.12 }, { scale: 1, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
        });
        gsap.from("[data-editorial-word]", {
          yPercent: 110,
          stagger: 0.06,
          duration: 1.2,
          scrollTrigger: { trigger: "[data-editorial-title]", start: "top 80%" },
        });
      });
    },
    { scope: root },
  );

  if (picks.length === 0) return null;
  const words = "Creamos detalles que hablan por ti.".split(" ");

  return (
    <section ref={root} aria-labelledby="editorial-title" className="container-x overflow-hidden py-24 md:py-36">
      <div className="grid gap-8 md:grid-cols-12 md:items-end">
        <h2 id="editorial-title" data-editorial-title className="display text-[clamp(2.75rem,7.5vw,6.5rem)] md:col-span-9">
          {words.map((w, i) => (
            <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-bottom">
              <span data-editorial-word className={cn("inline-block pr-[0.22em]", w === "hablan" && "serif-accent text-gradient")}>
                {w}
              </span>
            </span>
          ))}
        </h2>
        <p data-reveal className="text-lg text-ink-soft md:col-span-3">
          Cada encargo es único. Diseñamos, estampamos y empacamos pensando en la persona que lo va a recibir.
        </p>
      </div>

      <div className="mt-16 grid grid-cols-12 gap-4 md:gap-6">
        {picks.map((p, i) => {
          const slot = SLOTS[i];
          return (
            <Link
              key={p.id}
              href={`/productos/${p.slug}`}
              data-parallax={slot.speed}
              className={cn("group relative block overflow-hidden rounded-[2rem] bg-paper-2", slot.className)}
            >
              <div data-parallax-img className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.03]">
                <ProductImage src={p.images[0]?.image_url} art={p.placeholder_art} view={i % 2 === 0 ? 0 : 1} alt={p.name} sizes="(min-width: 768px) 60vw, 100vw" />
              </div>
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-ink/50 to-transparent p-4 pt-16 text-white sm:p-6 sm:pt-20">
                <div>
                  <p className="serif-accent text-lg sm:text-2xl">{slot.caption}</p>
                  <p className="mt-1 text-xs font-medium uppercase tracking-widest text-white/80 sm:text-sm">{p.name}</p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

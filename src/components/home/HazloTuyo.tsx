"use client";
import Link from "next/link";
import { useId, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/motion";
import { cn } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";
import { MugPreview, ProductArt } from "@/components/product/ProductArt";

const STEPS = [
  { n: "01", title: "Elige tu producto", text: "Tazas, cuadernos, stickers, tote bags y más. Todos listos para llevar tu sello." },
  { n: "02", title: "Personaliza tu diseño", text: "Agrega un nombre, una frase, tu foto o tu logo. Te mostramos cómo quedará antes de producirlo." },
  { n: "03", title: "Nosotros lo creamos", text: "Lo estampamos a mano con dedicación, lo empacamos con cariño y lo enviamos a todo Chile." },
];

function StepChoose() {
  return (
    <div className="relative size-full">
      <div className="absolute left-[4%] top-[14%] w-[44%] rotate-[-8deg] overflow-hidden rounded-3xl shadow-2xl">
        <ProductArt art="notebook" className="block w-full" />
      </div>
      <div className="absolute right-[4%] top-[4%] w-[40%] rotate-[7deg] overflow-hidden rounded-3xl shadow-2xl">
        <ProductArt art="tote" className="block w-full" />
      </div>
      <div className="absolute bottom-[2%] left-[28%] w-[46%] overflow-hidden rounded-3xl shadow-2xl ring-4 ring-white/80">
        <ProductArt art="mug" className="block w-full" />
        <span className="absolute left-3 top-3 rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">Seleccionado ✓</span>
      </div>
    </div>
  );
}

function StepCustomize() {
  return (
    <div className="relative grid size-full place-items-center">
      <div className="absolute inset-[6%] rounded-[2rem] bg-white/95 shadow-2xl" />
      <MugPreview print={{ name: "Papá", text: "el mejor del mundo ♥" }} className="relative w-[62%]" />
      <div className="absolute bottom-[10%] left-1/2 flex -translate-x-1/2 gap-2 rounded-full bg-paper px-3 py-2 shadow-lg">
        {["bg-m-red", "bg-m-yellow", "bg-m-magenta", "bg-m-violet", "bg-m-blue"].map((c) => (
          <span key={c} className={cn("size-6 rounded-full ring-2 ring-white", c)} />
        ))}
      </div>
      <div className="absolute left-[10%] top-[12%] rounded-2xl bg-ink px-4 py-3 text-left text-sm text-white shadow-xl">
        <span className="block text-[0.65rem] uppercase tracking-widest text-white/60">Texto</span>
        Papá <span className="animate-pulse">|</span>
      </div>
    </div>
  );
}

function StepCreate() {
  const rid = `ribbon-${useId().replace(/:/g, "")}`;
  return (
    <div className="relative grid size-full place-items-center">
      <svg viewBox="0 0 400 400" className="w-[78%]" aria-hidden>
        <defs>
          <linearGradient id={rid} x1="0" x2="1">
            <stop offset="0" stopColor="#E0312F" />
            <stop offset="0.35" stopColor="#F2B544" />
            <stop offset="0.7" stopColor="#D9307F" />
            <stop offset="1" stopColor="#6A45A0" />
          </linearGradient>
        </defs>
        <ellipse cx="200" cy="350" rx="140" ry="16" fill="#000" opacity="0.25" />
        <rect x="80" y="170" width="240" height="175" rx="14" fill="#F4EBD9" />
        <rect x="68" y="140" width="264" height="52" rx="12" fill="#FBF8F4" />
        <rect x="186" y="140" width="28" height="205" fill={`url(#${rid})`} />
        <path d="M200 140c-40-50-90-40-70-10 12 18 50 14 70 10Zm0 0c40-50 90-40 70-10-12 18-50 14-70 10Z" fill={`url(#${rid})`} />
        <rect x="236" y="220" width="70" height="38" rx="8" fill="#fff" transform="rotate(-8 270 240)" />
        <text x="271" y="244" textAnchor="middle" fontSize="12" fontStyle="italic" fontFamily="var(--font-instrument)" fill="#141217" transform="rotate(-8 270 240)">
          para ti ♥
        </text>
        {[
          [70, 90, "#F2B544"],
          [330, 110, "#4E9FD1"],
          [350, 230, "#D9307F"],
          [50, 250, "#3FAE8A"],
        ].map(([x, y, c], i) => (
          <path key={i} d={`M${x} ${Number(y) - 12}l3 9 9 3-9 3-3 9-3-9-9-3 9-3Z`} fill={c as string} />
        ))}
      </svg>
      <span className="absolute bottom-[8%] rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-lg">Envío a todo Chile</span>
    </div>
  );
}

const VISUALS = [StepChoose, StepCustomize, StepCreate];

export function HazloTuyo() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        const visuals = gsap.utils.toArray<HTMLElement>("[data-step-visual]");
        gsap.set(visuals.slice(1), { autoAlpha: 0, yPercent: 12, scale: 0.94 });
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut", duration: 1 },
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "+=220%",
            pin: true,
            scrub: 0.6,
            snap: { snapTo: [0, 0.5, 1], duration: { min: 0.2, max: 0.6 }, ease: "power1.inOut" },
            onUpdate: (self) => setActive(Math.min(2, Math.round(self.progress * 2))),
          },
        });
        tl.to(visuals[0], { autoAlpha: 0, yPercent: -10, scale: 0.94 })
          .to(visuals[1], { autoAlpha: 1, yPercent: 0, scale: 1 }, "<0.15")
          .to("[data-step-progress]", { scaleY: 0.5, ease: "none" }, 0)
          .to(visuals[1], { autoAlpha: 0, yPercent: -10, scale: 0.94 })
          .to(visuals[2], { autoAlpha: 1, yPercent: 0, scale: 1 }, "<0.15")
          .to("[data-step-progress]", { scaleY: 1, ease: "none" }, 1);
        return () => setActive(0);
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      id="personaliza"
      aria-labelledby="personaliza-title"
      className="relative overflow-hidden bg-ink text-white lg:motion-safe:h-screen"
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/4 size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(217_48_127/0.25),transparent_65%)]" />
        <div className="absolute -right-40 bottom-0 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(78_159_209/0.2),transparent_65%)]" />
      </div>

      <div className="container-x relative grid gap-12 py-24 lg:grid-cols-12 lg:items-center lg:motion-safe:h-full lg:motion-safe:py-0">
        <div className="lg:col-span-5">
          <p className="eyebrow !text-white/60">Personaliza</p>
          <h2 id="personaliza-title" className="display mt-4 text-[clamp(3rem,7vw,6rem)]">
            Hazlo <span className="serif-accent text-gradient">tuyo.</span>
          </h2>
          <p className="mt-4 max-w-md text-lg text-white/70">Tres pasos simples para convertir una idea en un regalo que se recuerda.</p>

          {/* Pasos (escritorio: resaltado según scroll) */}
          <div className="relative mt-10 hidden pl-8 lg:block lg:motion-reduce:hidden">
            <span className="absolute bottom-2 left-0 top-2 w-px bg-white/15" />
            <span data-step-progress className="bg-gradient-minerva absolute left-0 top-2 h-[calc(100%-1rem)] w-px origin-top scale-y-0" />
            <ol className="space-y-7">
              {STEPS.map((s, i) => (
                <li key={s.n} className={cn("transition-opacity duration-500", active === i ? "opacity-100" : "opacity-40")} aria-current={active === i ? "step" : undefined}>
                  <p className="text-sm font-semibold tabular-nums text-white/60">{s.n}</p>
                  <h3 className="display mt-1 text-3xl">{s.title}</h3>
                  <p className={cn("mt-2 max-w-sm text-white/70 transition-[max-height,opacity] duration-700", active === i ? "max-h-24" : "max-h-24 lg:max-h-0 lg:opacity-0")}>
                    {s.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <Link href="/productos?filtro=personalizable" className="btn mt-10 hidden bg-white text-ink hover:bg-white/90 lg:inline-flex lg:motion-reduce:hidden">
            Empieza a personalizar <Icon name="arrow" size={18} />
          </Link>
        </div>

        {/* Escenario (escritorio) */}
        <div className="relative hidden aspect-square w-full max-w-[40rem] justify-self-end lg:col-span-7 lg:block lg:motion-reduce:hidden">
          {VISUALS.map((V, i) => (
            <div key={i} data-step-visual className="absolute inset-0">
              <V />
            </div>
          ))}
        </div>

        {/* Móvil / reduced-motion: pasos apilados */}
        <ol data-reveal="stagger" className="grid gap-6 lg:hidden lg:motion-reduce:col-span-12 lg:motion-reduce:grid lg:motion-reduce:grid-cols-3">
          {STEPS.map((s, i) => {
            const V = VISUALS[i];
            return (
              <li key={s.n} className="overflow-hidden rounded-[1.75rem] bg-white/[0.06] ring-1 ring-white/10">
                <div className="relative aspect-square">
                  <V />
                </div>
                <div className="p-6">
                  <p className="text-sm font-semibold text-white/60">{s.n}</p>
                  <h3 className="display mt-1 text-2xl">{s.title}</h3>
                  <p className="mt-2 text-white/70">{s.text}</p>
                </div>
              </li>
            );
          })}
          <li>
            <Link href="/productos?filtro=personalizable" className="btn w-full bg-white text-ink">
              Empieza a personalizar <Icon name="arrow" size={18} />
            </Link>
          </li>
        </ol>
      </div>
    </section>
  );
}

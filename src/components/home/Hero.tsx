"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/format";
import { Magnetic } from "@/components/ui/Magnetic";
import { Icon } from "@/components/ui/Icon";
import { ChileFlag } from "@/components/ui/ChileFlag";
import { HeroFallback } from "./HeroFallback";
import type { SceneHandle } from "./hero-scene";

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };

function canRun3D() {
  if (prefersReducedMotion()) return false;
  const nav = navigator as Nav;
  if ((nav.hardwareConcurrency ?? 8) <= 2 || (nav.deviceMemory ?? 8) <= 2 || nav.connection?.saveData) return false;
  try {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<SceneHandle | null>(null);
  const [ready3D, setReady3D] = useState(false);

  // Carga diferida de Three.js
  useEffect(() => {
    if (!canRun3D()) return;
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    const onPointer = (e: PointerEvent) => sceneRef.current?.setPointer((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    const onVisibility = () => sceneRef.current?.setActive(!document.hidden);

    const start = async () => {
      const { createHeroScene } = await import("./hero-scene");
      if (cancelled || !canvasRef.current) return;
      const scene = createHeroScene(canvasRef.current, { lite: window.innerWidth < 768 });
      sceneRef.current = scene;
      setReady3D(true);
      observer = new IntersectionObserver(([entry]) => scene.setActive(entry.isIntersecting && !document.hidden));
      observer.observe(canvasRef.current);
      window.addEventListener("pointermove", onPointer, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
    };

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => void start(), { timeout: 1500 });

    return () => {
      cancelled = true;
      cancelIdle(handle);
      observer?.disconnect();
      window.removeEventListener("pointermove", onPointer);
      document.removeEventListener("visibilitychange", onVisibility);
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useGSAP(
    () => {
      if (prefersReducedMotion()) {
        gsap.set("[data-hero]", { autoAlpha: 1 });
        return;
      }
      const tl = gsap.timeline({ defaults: { ease: "expo.out", duration: 1.3 } });
      tl.from("[data-header]", { y: -24, autoAlpha: 0, duration: 1 }, 0)
        .set("[data-hero]", { autoAlpha: 1 }, 0)
        .from("[data-hero-eyebrow]", { y: 16, autoAlpha: 0, duration: 1 }, 0.15)
        .from("[data-hero-line]", { yPercent: 115, rotate: 2, stagger: 0.12 }, 0.2)
        .from("[data-hero-sub]", { y: 20, autoAlpha: 0 }, 0.55)
        .from("[data-hero-cta] > *", { y: 20, autoAlpha: 0, stagger: 0.08 }, 0.7)
        .from("[data-hero-trust] > *", { y: 12, autoAlpha: 0, stagger: 0.06, duration: 1 }, 0.85)
        .from("[data-hero-visual]", { scale: 0.92, autoAlpha: 0, duration: 1.8 }, 0.2);

      // Parallax del contenido y progreso de scroll para la escena 3D
      gsap.to("[data-hero-copy]", {
        yPercent: -12,
        autoAlpha: 0.2,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
      });
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom top",
        onUpdate: (self) => sceneRef.current?.setScroll(self.progress),
      });
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100svh] flex-col overflow-hidden pt-24 sm:pt-28 lg:min-h-[max(92vh,640px)]"
    >
      {/* Brillo de fondo con colores de la marca */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-[10%] top-[8%] size-[55vmax] rounded-full bg-[radial-gradient(circle,rgb(217_48_127/0.13),transparent_62%)]" />
        <div className="absolute -left-[15%] bottom-[-10%] size-[45vmax] rounded-full bg-[radial-gradient(circle,rgb(78_159_209/0.12),transparent_60%)]" />
        <div className="absolute left-[30%] top-[-10%] size-[35vmax] rounded-full bg-[radial-gradient(circle,rgb(242_181_68/0.12),transparent_60%)]" />
      </div>

      <div className="container-x relative grid flex-1 items-center gap-6 lg:grid-cols-12">
        <div data-hero-copy className="relative z-10 lg:col-span-6 xl:col-span-6">
          <div data-hero>
            <p data-hero-eyebrow className="eyebrow">
              Estampados y papelería · Hecho en Chile <ChileFlag />
            </p>
            <h1 id="hero-title" className="display mt-5 text-[clamp(3rem,9.5vw,7.5rem)]">
              <span className="block overflow-hidden pb-[0.06em]">
                <span data-hero-line className="block">
                  Tus ideas,
                </span>
              </span>
              <span className="block overflow-hidden pb-[0.12em]">
                <span data-hero-line className="block">
                  hechas <span className="serif-accent text-gradient pr-[0.08em]">realidad.</span>
                </span>
              </span>
            </h1>
            <p data-hero-sub className="mt-5 max-w-md text-lg leading-relaxed text-ink-2 sm:text-xl">
              Estampados y papelería personalizada para regalar, celebrar y crear algo realmente tuyo.
            </p>
            <div data-hero-cta className="mt-8 flex flex-wrap gap-3">
              <Magnetic>
                <Link href="/productos" className="btn btn-primary h-14 px-7 text-base">
                  Ver productos <Icon name="arrow" size={18} />
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/productos?filtro=personalizable" className="btn btn-ghost h-14 px-7 text-base">
                  <Icon name="sparkle" size={18} className="text-m-magenta" /> Personalizar ahora
                </Link>
              </Magnetic>
            </div>
            <ul data-hero-trust className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-soft">
              <li className="flex items-center gap-2">
                <Icon name="truck" size={18} /> Envíos a todo Chile
              </li>
              <li className="flex items-center gap-2">
                <Icon name="brush" size={18} /> Diseño a tu medida
              </li>
              <li className="flex items-center gap-2">
                <Icon name="heart" size={18} /> Hecho con dedicación
              </li>
            </ul>
          </div>
        </div>

      </div>

      <div
        data-hero-visual
        className="relative mt-4 h-[46svh] min-h-[300px] w-full lg:absolute lg:inset-y-0 lg:right-0 lg:mt-0 lg:h-auto lg:w-[58%] lg:[mask-image:linear-gradient(to_bottom,#000_88%,transparent)]"
      >
        <HeroFallback className={cn("absolute inset-0 transition-opacity duration-1000", ready3D && "opacity-0")} />
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={cn("absolute inset-0 size-full transition-opacity duration-1000", ready3D ? "opacity-100" : "opacity-0")}
        />
      </div>

      <div aria-hidden className="container-x relative z-10 hidden pb-8 lg:block">
        <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
          <span className="relative h-10 w-px overflow-hidden bg-line">
            <span className="bg-gradient-minerva absolute inset-x-0 top-0 h-1/2 animate-[scroll-cue_2.2s_var(--ease-soft)_infinite]" />
          </span>
          Desliza para descubrir
        </div>
      </div>
    </section>
  );
}

"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, isCoarsePointer, prefersReducedMotion, ScrollTrigger, setLenis } from "@/lib/motion";
import { useCart } from "@/lib/stores";

/**
 * - Smooth scroll con Lenis (solo escritorio y sin reduced-motion).
 * - Revela automáticamente todo elemento con [data-reveal] al entrar en pantalla.
 *   Variantes: data-reveal="up" (defecto) | "fade" | "scale" | "stagger" (revela hijos).
 */
export function MotionProvider() {
  const pathname = usePathname();

  // El carrito se hidrata desde localStorage después del primer render (evita desajustes SSR)
  useEffect(() => {
    void useCart.persist.rehydrate();
  }, []);

  // Lenis
  useEffect(() => {
    if (prefersReducedMotion() || isCoarsePointer()) return;
    const lenis = new Lenis({ duration: 1.1, anchors: { offset: -88 }, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Reveals
  useEffect(() => {
    const root = document.documentElement;
    (window as unknown as { __mnvMotion?: boolean }).__mnvMotion = true;
    if (prefersReducedMotion()) {
      root.classList.remove("js-motion");
      return;
    }
    const mobile = window.innerWidth < 768;
    const seen = new WeakSet<Element>();
    const triggers: ScrollTrigger[] = [];

    const setup = (el: HTMLElement) => {
      if (seen.has(el)) return false;
      seen.add(el);
      const kind = el.dataset.reveal || "up";
      const targets = kind === "stagger" ? Array.from(el.children) : [el];
      const from: gsap.TweenVars =
        kind === "fade" ? { autoAlpha: 0 } : kind === "scale" ? { autoAlpha: 0, scale: 0.96, y: 24 } : { autoAlpha: 0, y: mobile ? 20 : 36 };
      if (kind === "stagger") gsap.set(el, { autoAlpha: 1 });
      gsap.set(targets, from);
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: "top 88%",
          once: true,
          onEnter: () =>
            gsap.to(targets, {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: mobile ? 0.8 : 1.1,
              stagger: kind === "stagger" ? (mobile ? 0.06 : 0.09) : 0,
              delay: Number(el.dataset.revealDelay ?? 0),
              clearProps: "transform",
            }),
        }),
      );
      return true;
    };

    const scan = () => {
      let added = 0;
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (setup(el)) added++;
      });
      return added;
    };
    scan();
    let raf = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (scan() > 0) ScrollTrigger.refresh();
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    // Refrescar cuando cargan fuentes/imágenes (cambian alturas)
    document.fonts?.ready.then(() => ScrollTrigger.refresh());

    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      triggers.forEach((t) => t.kill());
    };
  }, [pathname]);

  return null;
}

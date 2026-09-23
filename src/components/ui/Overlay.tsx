"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { lockScroll } from "@/lib/motion";
import { cn } from "@/lib/format";

/**
 * Capa modal accesible: bloquea scroll, cierra con Esc / clic fuera,
 * atrapa el foco y lo devuelve al cerrar.
 */
export function Overlay({
  open,
  onClose,
  label,
  children,
  panelClassName,
  side = "right",
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
  panelClassName?: string;
  side?: "right" | "left" | "top" | "center";
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    lockScroll(true);
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])') ?? [],
      );
    requestAnimationFrame(() => (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0])?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab") {
        const f = focusables();
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lockScroll(false);
      previous?.focus?.();
    };
  }, [open]);

  if (!mounted) return null;

  const hidden = {
    right: "translate-x-full",
    left: "-translate-x-full",
    top: "-translate-y-6 opacity-0",
    center: "translate-y-4 scale-[0.98] opacity-0",
  }[side];

  return createPortal(
    <div className={cn("fixed inset-0 z-[70]", !open && "pointer-events-none")} aria-hidden={!open} inert={!open}>
      <div
        className={cn(
          "absolute inset-0 bg-ink/30 backdrop-blur-[2px] transition-opacity duration-500",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-lenis-prevent
        className={cn(
          "absolute transition-[transform,opacity] duration-[650ms] ease-[var(--ease-out-expo)]",
          open ? "translate-x-0 translate-y-0 scale-100 opacity-100" : hidden,
          panelClassName,
        )}
      >
        {children}
      </div>
    </div>,
    document.body,
  );
}

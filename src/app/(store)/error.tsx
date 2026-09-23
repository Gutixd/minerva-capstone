"use client";
import Link from "next/link";
import { useEffect } from "react";
import { waLink } from "@/lib/whatsapp";

export default function StoreError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => console.error(error), [error]);
  return (
    <div className="container-x flex min-h-[70vh] flex-col items-center justify-center pt-24 text-center">
      <p className="eyebrow">Algo salió mal</p>
      <h1 className="display mt-4 text-[clamp(2.5rem,6vw,4.5rem)]">
        Tuvimos un <span className="serif-accent text-gradient">pequeño</span> problema
      </h1>
      <p className="mt-4 max-w-md text-lg text-ink-soft">No pudimos cargar esta página. Intenta nuevamente o escríbenos si el problema continúa.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn btn-primary">
          Reintentar
        </button>
        <Link href="/" className="btn btn-ghost">
          Ir al inicio
        </Link>
        <a href={waLink("Hola Minerva 👋 Tuve un problema usando la página web.")} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Avisar por WhatsApp
        </a>
      </div>
    </div>
  );
}

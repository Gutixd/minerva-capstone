import Link from "next/link";
import type { Metadata } from "next";
import { Logo } from "@/components/layout/Logo";
import { MugPreview } from "@/components/product/ProductArt";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-40 top-10 size-[40rem] rounded-full bg-[radial-gradient(circle,rgb(217_48_127/0.12),transparent_62%)]" />
        <div className="absolute -left-40 bottom-0 size-[36rem] rounded-full bg-[radial-gradient(circle,rgb(78_159_209/0.12),transparent_60%)]" />
      </div>
      <header className="container-x py-5">
        <Logo size={46} />
      </header>
      <div className="container-x grid flex-1 items-center gap-10 pb-16 md:grid-cols-2">
        <div className="page-enter">
          <p className="eyebrow">Error 404</p>
          <h1 className="display mt-4 text-[clamp(3rem,9vw,7rem)]">
            Esta página se nos <span className="serif-accent text-gradient">derramó.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-ink-soft">No encontramos lo que buscabas, pero tenemos muchas otras cosas lindas esperándote.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-primary">
              Volver al inicio
            </Link>
            <Link href="/productos" className="btn btn-ghost">
              Ver productos
            </Link>
          </div>
        </div>
        <div className="mx-auto w-full max-w-sm rotate-[-12deg]">
          <MugPreview print={{ name: "404", text: "ups…" }} className="w-full" />
        </div>
      </div>
    </main>
  );
}

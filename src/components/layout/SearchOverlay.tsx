"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { SearchEntry } from "@/lib/catalog";
import { useUI } from "@/lib/stores";
import { formatCLP } from "@/lib/format";
import { Overlay } from "@/components/ui/Overlay";
import { Icon } from "@/components/ui/Icon";
import { ProductImage } from "@/components/product/ProductImage";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
const SUGGESTIONS = ["Taza", "Stickers", "Cuaderno", "Cumpleaños", "Agenda"];

export function SearchOverlay({ index }: { index: SearchEntry[] }) {
  const { overlay, close } = useUI();
  const router = useRouter();
  const open = overlay === "search";
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!open) {
      setQ("");
      setActive(0);
    }
  }, [open]);

  const results = useMemo(() => {
    const terms = norm(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return index.slice(0, 4);
    return index.filter((p) => terms.every((t) => norm(`${p.name} ${p.category ?? ""}`).includes(t))).slice(0, 8);
  }, [q, index]);

  const go = (href: string) => {
    close();
    router.push(href);
  };

  return (
    <Overlay
      open={open}
      onClose={close}
      label="Buscar productos"
      side="top"
      panelClassName="inset-x-2 top-2 mx-auto max-w-2xl overflow-hidden rounded-[1.75rem] bg-paper shadow-2xl sm:top-6"
    >
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (results[active] && q) go(`/productos/${results[active].slug}`);
          else go(`/productos${q ? `?q=${encodeURIComponent(q)}` : ""}`);
        }}
        className="flex items-center gap-3 border-b border-line px-5"
      >
        <Icon name="search" className="shrink-0 text-ink-soft" />
        <label htmlFor="site-search" className="sr-only">
          Buscar productos
        </label>
        <input
          id="site-search"
          data-autofocus
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((a) => Math.min(results.length - 1, a + 1));
            }
            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((a) => Math.max(0, a - 1));
            }
          }}
          placeholder="Busca tazas, stickers, agendas…"
          autoComplete="off"
          role="combobox"
          aria-expanded="true"
          aria-controls="search-results"
          aria-activedescendant={results[active] ? `sr-${results[active].id}` : undefined}
          className="h-16 w-full bg-transparent text-lg outline-none placeholder:text-ink-soft/70"
        />
        <button type="button" onClick={close} className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs font-medium text-ink-soft" aria-label="Cerrar búsqueda">
          Esc
        </button>
      </form>

      <div className="max-h-[60dvh] overflow-y-auto overscroll-contain p-3">
        {!q && (
          <div className="flex flex-wrap gap-2 px-2 pb-3 pt-1">
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" className="chip" onClick={() => setQ(s)}>
                {s}
              </button>
            ))}
          </div>
        )}
        {q && results.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="display text-xl">Sin resultados para “{q}”</p>
            <p className="mt-1 text-sm text-ink-soft">¿Buscas algo especial? Lo creamos a pedido.</p>
            <Link href="/productos" onClick={close} className="btn btn-ghost mt-4">
              Ver todo el catálogo
            </Link>
          </div>
        ) : (
          <>
            <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-widest text-ink-soft">{q ? "Resultados" : "Populares"}</p>
            <ul id="search-results" role="listbox" aria-label="Resultados">
              {results.map((p, i) => (
                <li key={p.id} id={`sr-${p.id}`} role="option" aria-selected={i === active}>
                  <Link
                    href={`/productos/${p.slug}`}
                    onClick={close}
                    onMouseEnter={() => setActive(i)}
                    className="flex items-center gap-4 rounded-2xl p-2.5 transition-colors aria-selected:bg-white"
                    aria-selected={i === active}
                  >
                    <span className="relative aspect-square w-14 shrink-0 overflow-hidden rounded-xl bg-paper-2">
                      <ProductImage src={p.image} art={p.placeholder_art} alt="" sizes="56px" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{p.name}</span>
                      <span className="text-sm text-ink-soft">{p.category}</span>
                    </span>
                    <span className="text-sm font-semibold tabular-nums">{formatCLP(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Overlay>
  );
}

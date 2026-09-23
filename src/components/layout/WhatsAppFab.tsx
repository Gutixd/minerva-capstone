"use client";
import { useUI } from "@/lib/stores";
import { waLink } from "@/lib/whatsapp";
import { cn } from "@/lib/format";
import { WhatsAppIcon } from "@/components/ui/Icon";

export function WhatsAppFab() {
  const overlay = useUI((s) => s.overlay);
  return (
    <a
      href={waLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escríbenos por WhatsApp"
      className={cn(
        "group fixed bottom-4 right-4 z-40 flex h-13 items-center gap-2 rounded-full bg-[#1faa59] pl-3.5 pr-3.5 text-white shadow-[0_12px_30px_-10px_rgb(31_170_89/0.65)] transition-[transform,opacity,padding] duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 sm:bottom-6 sm:right-6",
        overlay && "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <WhatsAppIcon size={24} />
      <span className="max-w-0 overflow-hidden whitespace-nowrap text-sm font-semibold transition-[max-width] duration-500 ease-[var(--ease-out-expo)] group-hover:max-w-40 group-focus-visible:max-w-40">
        ¿Cotizamos?
      </span>
    </a>
  );
}

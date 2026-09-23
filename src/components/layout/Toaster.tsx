"use client";
import { useToasts } from "@/lib/stores";
import { cn } from "@/lib/format";
import { Icon } from "@/components/ui/Icon";

export function Toaster() {
  const { toasts, dismiss } = useToasts();
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.tone === "error" ? "alert" : "status"}
          className="pointer-events-auto flex w-full max-w-md animate-[fade-up_0.6s_var(--ease-out-expo)] items-center gap-3 rounded-2xl bg-ink p-3 pl-4 text-white shadow-[0_24px_48px_-16px_rgb(20_18_23/0.5)]"
        >
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-full",
              t.tone === "error" ? "bg-m-red" : t.tone === "info" ? "bg-m-blue" : "bg-gradient-minerva",
            )}
          >
            <Icon name={t.tone === "error" ? "x" : "check"} size={16} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{t.title}</p>
            {t.description && <p className="truncate text-xs text-white/70">{t.description}</p>}
          </div>
          {t.action && (
            <button
              type="button"
              onClick={() => {
                t.action!.onClick();
                dismiss(t.id);
              }}
              className="shrink-0 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-ink transition-transform active:scale-95"
            >
              {t.action.label}
            </button>
          )}
          <button type="button" onClick={() => dismiss(t.id)} className="grid size-8 shrink-0 place-items-center rounded-full text-white/60 hover:text-white" aria-label="Cerrar aviso">
            <Icon name="x" size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}

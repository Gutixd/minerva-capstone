import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  id,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div data-reveal className="max-w-2xl">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 id={id} className="display mt-4 text-[clamp(2.25rem,5.5vw,4.25rem)]">
          {title}
        </h2>
        {description && <p className="mt-4 max-w-xl text-lg text-ink-soft">{description}</p>}
      </div>
      {action && (
        <div data-reveal data-reveal-delay="0.1" className="shrink-0">
          {action}
        </div>
      )}
    </div>
  );
}

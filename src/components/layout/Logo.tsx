import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/format";

/** Logo original de Minerva (public/brand/minerva-logo.png, fondo transparente). */
export function Logo({ size = 44, className, priority }: { size?: number; className?: string; priority?: boolean }) {
  return (
    <Link href="/" aria-label="Minerva, ir al inicio" className={cn("inline-flex shrink-0 items-center", className)}>
      <Image
        src="/brand/minerva-logo.png"
        alt="Minerva"
        width={104}
        height={105}
        priority={priority}
        style={{ width: size, height: "auto" }}
        sizes={`${size}px`}
      />
    </Link>
  );
}

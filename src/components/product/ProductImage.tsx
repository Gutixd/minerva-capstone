import Image from "next/image";
import type { ArtKey } from "@/lib/types";
import { cn } from "@/lib/format";
import { ProductArt } from "./ProductArt";

/** Foto real si existe; si no, la ilustración del producto. */
export function ProductImage({
  src,
  art,
  alt,
  sizes,
  view = 0,
  priority,
  className,
}: {
  src: string | null | undefined;
  art: ArtKey | null | undefined;
  alt: string;
  sizes: string;
  view?: 0 | 1;
  priority?: boolean;
  className?: string;
}) {
  if (src) {
    return <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={cn("object-cover", className)} />;
  }
  return <ProductArt art={art ?? "mug"} view={view} title={alt} className={cn("absolute inset-0 size-full", className)} />;
}

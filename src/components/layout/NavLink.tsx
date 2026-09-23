"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";
import { scrollToHash } from "@/lib/motion";

/** Link que, si apunta a una sección de la portada estando en ella, hace scroll suave. */
export function NavLink({ href, onClick, ...props }: ComponentProps<typeof Link> & { href: string }) {
  const pathname = usePathname();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (pathname === "/" && href.startsWith("/#")) {
          const hash = href.slice(1);
          if (scrollToHash(hash)) {
            e.preventDefault();
            history.replaceState(null, "", hash);
          }
        } else if (pathname === "/" && href === "/") {
          e.preventDefault();
          scrollToHash("body");
          history.replaceState(null, "", "/");
        }
      }}
      {...props}
    />
  );
}

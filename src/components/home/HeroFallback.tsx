import { useId } from "react";
import { Mug } from "@/components/product/ProductArt";

/**
 * Composición estática del hero: se muestra mientras carga Three.js
 * y queda como versión definitiva en equipos modestos o con reduced-motion.
 */
export function HeroFallback({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 800 700" className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}-brand`} x1="0" y1="0" x2="1" y2="0.2">
          <stop offset="0" stopColor="#E0312F" />
          <stop offset="0.22" stopColor="#F0643A" />
          <stop offset="0.42" stopColor="#F2B544" />
          <stop offset="0.62" stopColor="#D9307F" />
          <stop offset="0.82" stopColor="#6A45A0" />
          <stop offset="1" stopColor="#4E9FD1" />
        </linearGradient>
        <linearGradient id={`${id}-ceramic`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E6DFD7" />
          <stop offset="0.16" stopColor="#FFFFFF" />
          <stop offset="0.6" stopColor="#FAF7F3" />
          <stop offset="1" stopColor="#D9D1C7" />
        </linearGradient>
        <radialGradient id={`${id}-shadow`}>
          <stop offset="0" stopColor="#141217" stopOpacity="0.18" />
          <stop offset="1" stopColor="#141217" stopOpacity="0" />
        </radialGradient>
        <filter id={`${id}-soft`} x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="14" stdDeviation="14" floodColor="#141217" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* hoja de papel */}
      <g transform="rotate(-12 170 420)" filter={`url(#${id}-soft)`}>
        <rect x="80" y="300" width="180" height="240" rx="6" fill="#fff" />
        <rect x="104" y="334" width="110" height="8" rx="4" fill="#ECE4F4" />
        <rect x="104" y="354" width="80" height="8" rx="4" fill="#ECE4F4" />
      </g>
      {/* tarjeta con gradiente */}
      <g transform="rotate(18 640 520)" filter={`url(#${id}-soft)`}>
        <rect x="540" y="470" width="200" height="124" rx="14" fill={`url(#${id}-brand)`} />
      </g>
      {/* M del logo en trazo */}
      <path
        d="M420 420V210c0-40 40-58 64-26l66 110 66-110c24-32 64-14 64 26v210"
        fill="none"
        stroke={`url(#${id}-brand)`}
        strokeWidth="34"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter={`url(#${id}-soft)`}
      />
      {/* taza */}
      <g transform="translate(150 150) scale(1.05)">
        <Mug id={id}>
          <text x="200" y="300" textAnchor="middle" fontSize="44" fontStyle="italic" fill={`url(#${id}-brand)`} fontFamily="var(--font-instrument)">
            tu idea
          </text>
        </Mug>
      </g>
      {/* stickers */}
      <circle cx="170" cy="190" r="34" fill="#D9307F" filter={`url(#${id}-soft)`} />
      <path d="M660 150l12 26 28 3-21 19 6 28-25-14-25 14 6-28-21-19 28-3Z" fill="#F2B544" filter={`url(#${id}-soft)`} />
      <circle cx="720" cy="360" r="16" fill="#3FAE8A" />
      <circle cx="350" cy="120" r="10" fill="#4E9FD1" />
      <circle cx="330" cy="620" r="14" fill="#6A45A0" />
    </svg>
  );
}

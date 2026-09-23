/** Bandera de Chile en SVG (Windows no dibuja el emoji 🇨🇱). */
export function ChileFlag({ className = "inline-block" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" width="18" height="12" className={`${className} shrink-0 rounded-[2px] shadow-[0_0_0_0.5px_rgb(0_0_0/0.15)]`} role="img" aria-label="Chile">
      <rect width="30" height="20" fill="#fff" />
      <rect y="10" width="30" height="10" fill="#D52B1E" />
      <rect width="10" height="10" fill="#0039A6" />
      <path d="M5 2.2l.9 2.7h2.8L6.4 6.6l.9 2.7L5 7.6 2.7 9.3l.9-2.7L1.3 4.9h2.8Z" fill="#fff" />
    </svg>
  );
}

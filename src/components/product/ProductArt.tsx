/**
 * Ilustraciones vectoriales de producto.
 * Se muestran mientras un producto no tenga fotografías subidas desde /admin,
 * y el mockup de taza se reutiliza para la vista previa de personalización.
 */
import { useId, type ReactNode } from "react";
import type { ArtKey } from "@/lib/types";

const C = {
  red: "#E0312F",
  orange: "#F0643A",
  yellow: "#F2B544",
  green: "#3FAE8A",
  blue: "#4E9FD1",
  violet: "#6A45A0",
  magenta: "#D9307F",
  ink: "#141217",
};

const BG: Record<ArtKey, [string, string]> = {
  "mug-dad": ["#F6E6D8", "#F1DCEC"],
  "mug-magic": ["#E3ECF7", "#EDE4F5"],
  "mug-name": ["#F7E3EA", "#F8EDD2"],
  mug: ["#F4EFE8", "#EDE6F4"],
  notebook: ["#ECE4F4", "#F7E5D8"],
  agenda: ["#F8EDD2", "#E3EEF6"],
  stickers: ["#E0F0E8", "#F7E1EA"],
  "stickers-logo": ["#F4EAD9", "#E4EDF6"],
  tote: ["#F7E1D6", "#E6F1EA"],
  bottle: ["#E1EEF7", "#F6E3EC"],
  party: ["#F8ECD3", "#ECE3F5"],
  cards: ["#F2E3EE", "#E3EEF6"],
  print: ["#EAF2EC", "#F7E6DA"],
};

function Gradients({ id }: { id: string }) {
  return (
    <defs>
      <linearGradient id={`${id}-brand`} x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stopColor={C.red} />
        <stop offset="0.25" stopColor={C.orange} />
        <stop offset="0.45" stopColor={C.yellow} />
        <stop offset="0.65" stopColor={C.magenta} />
        <stop offset="0.85" stopColor={C.violet} />
        <stop offset="1" stopColor={C.blue} />
      </linearGradient>
      <linearGradient id={`${id}-warm`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.red} />
        <stop offset="0.5" stopColor={C.orange} />
        <stop offset="1" stopColor={C.magenta} />
      </linearGradient>
      <linearGradient id={`${id}-cool`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={C.magenta} />
        <stop offset="0.55" stopColor={C.violet} />
        <stop offset="1" stopColor={C.blue} />
      </linearGradient>
      <linearGradient id={`${id}-ceramic`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#E6DFD7" />
        <stop offset="0.16" stopColor="#FFFFFF" />
        <stop offset="0.6" stopColor="#FAF7F3" />
        <stop offset="1" stopColor="#D9D1C7" />
      </linearGradient>
      <linearGradient id={`${id}-dark`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#0D0B10" />
        <stop offset="0.2" stopColor="#2B2731" />
        <stop offset="0.6" stopColor="#1C1921" />
        <stop offset="1" stopColor="#09080B" />
      </linearGradient>
      <radialGradient id={`${id}-shadow`}>
        <stop offset="0" stopColor={C.ink} stopOpacity="0.22" />
        <stop offset="1" stopColor={C.ink} stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

const Shadow = ({ id, cx = 200, cy = 420, rx = 130, ry = 18 }: { id: string; cx?: number; cy?: number; rx?: number; ry?: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-shadow)`} />
);

/* ----------------------------------- Taza ----------------------------------- */

export interface MugPrint {
  text?: string;
  name?: string;
  image?: string;
}

export function Mug({
  id,
  dark = false,
  interior,
  children,
}: {
  id: string;
  dark?: boolean;
  interior?: string;
  children?: ReactNode;
}) {
  const body = dark ? `url(#${id}-dark)` : `url(#${id}-ceramic)`;
  return (
    <g>
      <Shadow id={id} cx={210} cy={408} rx={140} ry={20} />
      <path d="M280 214c74 0 74 128 0 128" fill="none" stroke={dark ? "#0B0A0D" : "#DCD4CA"} strokeWidth="32" strokeLinecap="round" />
      <path d="M280 214c68 0 68 128 0 128" fill="none" stroke={dark ? "#26222B" : "#FFFFFF"} strokeWidth="22" strokeLinecap="round" />
      <path d="M118 172v200c0 18 12 30 30 30h104c18 0 30-12 30-30V172Z" fill={body} />
      <clipPath id={`${id}-print`}>
        <rect x="130" y="198" width="140" height="178" rx="8" />
      </clipPath>
      <g clipPath={`url(#${id}-print)`}>{children}</g>
      <rect x="132" y="188" width="9" height="196" rx="4.5" fill="#fff" opacity={dark ? 0.08 : 0.55} />
      <ellipse cx="200" cy="172" rx="82" ry="16" fill={dark ? "#2E2A33" : "#F1ECE6"} />
      <ellipse cx="200" cy="174" rx="72" ry="11" fill={interior ?? (dark ? "#141217" : "#DCD3C8")} />
    </g>
  );
}

/** Estampado personalizable de la taza (texto + imagen del cliente). */
export function CustomMugPrint({ id, print, dark = false }: { id: string; print: MugPrint; dark?: boolean }) {
  const ink = dark ? "#fff" : C.ink;
  const hasImage = Boolean(print.image);
  const text = print.text?.trim();
  const name = print.name?.trim();
  return (
    <>
      {hasImage && (
        <image
          href={print.image}
          x="130"
          y={text || name ? 198 : 214}
          width="140"
          height={text || name ? 112 : 150}
          preserveAspectRatio="xMidYMid slice"
        />
      )}
      {!hasImage && !text && !name && (
        <g opacity="0.5">
          <rect x="146" y="226" width="108" height="112" rx="10" fill="none" stroke={ink} strokeDasharray="5 6" strokeOpacity="0.35" />
          <text x="200" y="286" textAnchor="middle" fontSize="12" fill={ink} fillOpacity="0.55" fontFamily="var(--font-inter)">
            Tu diseño aquí
          </text>
        </g>
      )}
      {name && (
        <text
          x="200"
          y={hasImage ? 338 : text ? 270 : 296}
          textAnchor="middle"
          fontFamily="var(--font-bricolage)"
          fontWeight="700"
          fontSize={name.length > 11 ? 18 : name.length > 7 ? 23 : 30}
          fill={`url(#${id}-brand)`}
        >
          {name.slice(0, 16)}
        </text>
      )}
      {text && (
        <text
          x="200"
          y={hasImage ? (name ? 360 : 344) : name ? 304 : 292}
          textAnchor="middle"
          fontFamily="var(--font-instrument)"
          fontStyle="italic"
          fontSize={text.length > 22 ? 13 : 17}
          fill={ink}
        >
          {text.slice(0, 32)}
        </text>
      )}
    </>
  );
}

function MugDad({ id }: { id: string }) {
  return (
    <Mug id={id}>
      <text x="200" y="240" textAnchor="middle" fontSize="11" letterSpacing="4" fontWeight="600" fill={C.ink} fontFamily="var(--font-inter)">
        FELIZ DÍA
      </text>
      <text x="200" y="292" textAnchor="middle" fontSize="50" fontWeight="800" fill={`url(#${id}-brand)`} fontFamily="var(--font-bricolage)" letterSpacing="-2">
        PAPÁ
      </text>
      <text x="200" y="322" textAnchor="middle" fontSize="15" fontStyle="italic" fill={C.ink} fontFamily="var(--font-instrument)">
        el mejor del mundo
      </text>
      <path d="M200 350c-6-5-12-8-12-13a5 5 0 0 1 12-3 5 5 0 0 1 12 3c0 5-6 8-12 13Z" fill={C.red} />
      <path d="M156 256l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1Z" fill={C.yellow} />
    </Mug>
  );
}

function MugMagic({ id }: { id: string }) {
  return (
    <Mug id={id} dark>
      <rect x="144" y="212" width="112" height="136" rx="10" fill={`url(#${id}-cool)`} />
      <circle cx="224" cy="248" r="14" fill={C.yellow} />
      <path d="M144 330l30-44 20 22 22-34 40 56v18H144Z" fill="#fff" opacity="0.92" />
      <path d="M174 286l8 10-8 3-8-3Z M216 274l7 10-7 3-7-3Z" fill={C.blue} opacity="0.5" />
    </Mug>
  );
}

function MugName({ id }: { id: string }) {
  return (
    <Mug id={id} interior={C.magenta}>
      <circle cx="152" cy="232" r="9" fill={C.yellow} />
      <circle cx="252" cy="340" r="11" fill={C.blue} opacity="0.85" />
      <circle cx="160" cy="344" r="6" fill={C.green} />
      <text x="202" y="300" textAnchor="middle" fontSize="60" fontStyle="italic" fill={`url(#${id}-warm)`} fontFamily="var(--font-instrument)">
        Cami
      </text>
      <path d="M160 314c24 10 56 10 82 0" stroke={C.violet} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </Mug>
  );
}

/* --------------------------------- Papelería -------------------------------- */

function Notebook({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={430} rx={150} />
      <g transform="rotate(8 250 260)">
        <rect x="170" y="100" width="190" height="270" rx="12" fill={C.orange} />
        <rect x="170" y="100" width="190" height="270" rx="12" fill="#000" opacity="0.08" />
      </g>
      <g transform="rotate(-6 200 270)">
        <rect x="104" y="112" width="200" height="290" rx="12" fill="#fff" />
        <rect x="100" y="106" width="200" height="290" rx="12" fill={C.violet} />
        <rect x="100" y="106" width="26" height="290" rx="10" fill={`url(#${id}-brand)`} />
        <rect x="270" y="106" width="10" height="290" fill={C.ink} opacity="0.85" />
        <rect x="146" y="176" width="112" height="80" rx="10" fill="#FBF8F4" />
        <text x="202" y="208" textAnchor="middle" fontSize="11" letterSpacing="2.5" fontWeight="600" fill={C.ink} fontFamily="var(--font-inter)">
          CUADERNO DE
        </text>
        <text x="202" y="238" textAnchor="middle" fontSize="26" fontStyle="italic" fill={C.violet} fontFamily="var(--font-instrument)">
          Valentina
        </text>
        <circle cx="160" cy="330" r="16" fill={C.yellow} />
        <circle cx="190" cy="346" r="9" fill={C.magenta} />
      </g>
    </g>
  );
}

function Agenda({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={432} rx={140} />
      <g transform="rotate(4 200 260)">
        <path d="M262 380v58l12-10 12 10v-58Z" fill={C.magenta} />
        <rect x="112" y="96" width="186" height="296" rx="14" fill="#fff" />
        <rect x="106" y="90" width="186" height="296" rx="14" fill={C.ink} />
        <text x="199" y="222" textAnchor="middle" fontSize="64" fontWeight="800" letterSpacing="-3" fill={`url(#${id}-brand)`} fontFamily="var(--font-bricolage)">
          2027
        </text>
        <text x="199" y="252" textAnchor="middle" fontSize="12" letterSpacing="4" fill="#fff" opacity="0.75" fontFamily="var(--font-inter)">
          AGENDA DE
        </text>
        <text x="199" y="284" textAnchor="middle" fontSize="26" fontStyle="italic" fill="#fff" fontFamily="var(--font-instrument)">
          Martina
        </text>
        <circle cx="140" cy="126" r="5" fill={C.yellow} />
        <circle cx="258" cy="352" r="7" fill={C.blue} />
      </g>
    </g>
  );
}

/* --------------------------------- Stickers --------------------------------- */

const Sticker = ({ children, x, y, r = 0 }: { children: ReactNode; x: number; y: number; r?: number }) => (
  <g transform={`translate(${x} ${y}) rotate(${r})`} style={{ filter: "drop-shadow(0 6px 8px rgb(20 18 23 / 0.14))" }}>
    {children}
  </g>
);

function Stickers({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={440} rx={150} ry={14} />
      <Sticker x={140} y={160} r={-10}>
        <circle r="62" fill="#fff" />
        <circle r="54" fill={C.magenta} />
        <circle cx="-17" cy="-10" r="6" fill="#fff" />
        <circle cx="17" cy="-10" r="6" fill="#fff" />
        <path d="M-22 12c12 16 32 16 44 0" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" />
      </Sticker>
      <Sticker x={275} y={150} r={12}>
        <path d="M0-66 18-22 66-20 28 10 42 58 0 30-42 58-28 10-66-20-18-22Z" fill="#fff" stroke="#fff" strokeWidth="14" strokeLinejoin="round" />
        <path d="M0-66 18-22 66-20 28 10 42 58 0 30-42 58-28 10-66-20-18-22Z" fill={C.yellow} />
      </Sticker>
      <Sticker x={150} y={320} r={-6}>
        <rect x="-78" y="-40" width="156" height="80" rx="40" fill="#fff" />
        <rect x="-70" y="-32" width="140" height="64" rx="32" fill={C.blue} />
        <text y="12" textAnchor="middle" fontSize="34" fontWeight="700" fill="#fff" fontFamily="var(--font-bricolage)">
          hola!
        </text>
      </Sticker>
      <Sticker x={288} y={306} r={14}>
        <path d="M0 52C-22 34-60 14-60-18a30 30 0 0 1 60-12 30 30 0 0 1 60 12c0 32-38 52-60 70Z" fill="#fff" />
        <path d="M0 40C-18 26-50 10-50-18a24 24 0 0 1 50-10 24 24 0 0 1 50 10c0 28-32 44-50 58Z" fill={C.red} />
      </Sticker>
      <Sticker x={214} y={236} r={-4}>
        <circle r="34" fill="#fff" />
        <circle r="27" fill={C.green} />
        <path d="M0-14v28M-14 0h28M-10-10l20 20M10-10l-20 20" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </Sticker>
    </g>
  );
}

function StickersLogo({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={436} rx={150} />
      <rect x="96" y="210" width="210" height="200" rx="12" fill="#D8B78C" />
      <rect x="96" y="210" width="210" height="36" rx="10" fill="#C9A676" />
      <Sticker x={200} y={320}>
        <circle r="56" fill="#fff" />
        <circle r="48" fill="none" stroke={`url(#${id}-brand)`} strokeWidth="6" />
        <text y="-4" textAnchor="middle" fontSize="20" fontWeight="700" fill={C.ink} fontFamily="var(--font-bricolage)">
          tu logo
        </text>
        <text y="16" textAnchor="middle" fontSize="9" letterSpacing="2" fill={C.ink} opacity="0.7" fontFamily="var(--font-inter)">
          GRACIAS
        </text>
      </Sticker>
      {[
        [120, 120, C.violet, -8],
        [200, 100, C.orange, 4],
        [282, 128, C.blue, 10],
      ].map(([x, y, color, r], i) => (
        <Sticker key={i} x={x as number} y={y as number} r={r as number}>
          <circle r="38" fill="#fff" />
          <circle r="32" fill={color as string} />
          <text y="6" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff" fontFamily="var(--font-bricolage)">
            logo
          </text>
        </Sticker>
      ))}
    </g>
  );
}

/* ---------------------------------- Regalos --------------------------------- */

function Tote({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={440} rx={150} />
      <path d="M158 170c0-84 84-84 84 0" fill="none" stroke="#E7DBC4" strokeWidth="14" />
      <path d="M140 180c0-100 120-100 120 0" fill="none" stroke="#EFE4CF" strokeWidth="14" />
      <path d="M100 176h200l14 246H86Z" fill="#F4EBD9" />
      <path d="M100 176h200l2 20H98Z" fill="#E7DBC4" />
      <circle cx="200" cy="272" r="50" fill={`url(#${id}-warm)`} />
      <path d="M150 290h100" stroke="#F4EBD9" strokeWidth="6" />
      <path d="M156 304h88" stroke="#F4EBD9" strokeWidth="6" />
      <text x="200" y="362" textAnchor="middle" fontSize="24" fontStyle="italic" fill={C.ink} fontFamily="var(--font-instrument)">
        hecho con cariño
      </text>
      <text x="200" y="384" textAnchor="middle" fontSize="9" letterSpacing="3" fill={C.ink} opacity="0.6" fontFamily="var(--font-inter)">
        CHILE
      </text>
    </g>
  );
}

function Bottle({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={434} rx={90} ry={14} />
      <rect x="174" y="70" width="52" height="46" rx="10" fill={C.ink} />
      <rect x="182" y="112" width="36" height="16" fill="#2B2731" />
      <path d="M170 132c0-6 6-10 12-10h36c6 0 12 4 12 10l12 30v250c0 12-10 20-22 20h-40c-12 0-22-8-22-20V162Z" fill={`url(#${id}-cool)`} />
      <path d="M170 132c0-6 6-10 12-10h36c6 0 12 4 12 10l12 30v250c0 12-10 20-22 20h-40c-12 0-22-8-22-20V162Z" fill="#fff" opacity="0.12" />
      <rect x="166" y="190" width="10" height="220" rx="5" fill="#fff" opacity="0.35" />
      <text x="200" y="300" textAnchor="middle" fontSize="38" fontStyle="italic" fill="#fff" fontFamily="var(--font-instrument)" transform="rotate(-90 200 300)">
        Sofi
      </text>
      <circle cx="200" cy="376" r="8" fill={C.yellow} />
    </g>
  );
}

/* ---------------------------------- Eventos --------------------------------- */

function Party({ id }: { id: string }) {
  const flags = [C.red, C.orange, C.yellow, C.green, C.blue, C.violet, C.magenta];
  return (
    <g>
      <Shadow id={id} cy={440} rx={150} />
      <path d="M30 70Q200 150 370 70" fill="none" stroke={C.ink} strokeWidth="2" opacity="0.6" />
      {flags.map((color, i) => {
        const t = (i + 0.5) / flags.length;
        const x = 30 + t * 340;
        const y = 70 + 160 * t * (1 - t);
        return <path key={i} d={`M${x - 20} ${y - 4}h40l-20 44Z`} fill={color} transform={`rotate(${(t - 0.5) * -24} ${x} ${y})`} />;
      })}
      <rect x="120" y="300" width="160" height="112" rx="14" fill="#F9D7E4" />
      <rect x="120" y="340" width="160" height="16" fill="#fff" opacity="0.8" />
      <rect x="138" y="240" width="124" height="68" rx="12" fill="#FFF6EA" />
      <path d="M138 262c20 12 30-6 42 4s22-8 34 2 30-6 48 2" stroke={C.magenta} strokeWidth="6" fill="none" strokeLinecap="round" />
      {[170, 200, 230].map((x, i) => (
        <g key={x}>
          <rect x={x - 3} y="204" width="6" height="36" rx="3" fill={[C.blue, C.yellow, C.green][i]} />
          <path d={`M${x} 188c6 8 6 14 0 16-6-2-6-8 0-16Z`} fill={C.orange} />
        </g>
      ))}
      <line x1="244" y1="244" x2="258" y2="150" stroke={C.ink} strokeWidth="2" />
      <circle cx="260" cy="136" r="24" fill={`url(#${id}-brand)`} />
      <text x="260" y="145" textAnchor="middle" fontSize="24" fontWeight="800" fill="#fff" fontFamily="var(--font-bricolage)">
        6
      </text>
      {[
        [80, 220, C.yellow],
        [330, 250, C.magenta],
        [90, 360, C.blue],
        [320, 380, C.green],
        [60, 290, C.red],
      ].map(([x, y, c], i) => (
        <circle key={i} cx={x as number} cy={y as number} r="6" fill={c as string} />
      ))}
    </g>
  );
}

function Cards({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={436} rx={150} />
      <g transform="rotate(-10 200 270)">
        <rect x="96" y="150" width="210" height="250" rx="10" fill="#D8B78C" />
        <path d="M96 160l105 90 105-90" fill="none" stroke="#C4A274" strokeWidth="4" />
      </g>
      <g transform="rotate(6 200 260)">
        <rect x="120" y="110" width="170" height="240" rx="10" fill={C.blue} />
      </g>
      <g transform="rotate(-2 200 260)">
        <rect x="110" y="120" width="180" height="256" rx="10" fill="#fff" />
        <rect x="124" y="134" width="152" height="228" rx="6" fill="none" stroke={`url(#${id}-brand)`} strokeWidth="2" />
        <text x="200" y="212" textAnchor="middle" fontSize="11" letterSpacing="3" fill={C.ink} opacity="0.65" fontFamily="var(--font-inter)">
          ESTÁS
        </text>
        <text x="200" y="250" textAnchor="middle" fontSize="36" fontStyle="italic" fill={C.ink} fontFamily="var(--font-instrument)">
          invitad@
        </text>
        <text x="200" y="280" textAnchor="middle" fontSize="12" fill={C.magenta} fontWeight="600" fontFamily="var(--font-inter)">
          a mi cumple
        </text>
        <circle cx="200" cy="318" r="10" fill={C.yellow} />
        <circle cx="178" cy="322" r="5" fill={C.green} />
        <circle cx="222" cy="322" r="5" fill={C.red} />
      </g>
    </g>
  );
}

/* ------------------------------ Diseños especiales -------------------------- */

function Flower({ x, y, color, r = 22 }: { x: number; y: number; color: string; r?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      {[0, 72, 144, 216, 288].map((a) => (
        <ellipse key={a} rx={r * 0.55} ry={r} fill={color} transform={`rotate(${a}) translate(0 ${-r * 0.8})`} opacity="0.92" />
      ))}
      <circle r={r * 0.45} fill={C.yellow} />
    </g>
  );
}

function Print({ id }: { id: string }) {
  return (
    <g>
      <Shadow id={id} cy={440} rx={140} />
      <rect x="88" y="70" width="224" height="330" rx="4" fill={C.ink} />
      <rect x="98" y="80" width="204" height="310" fill="#FFFDF8" />
      <rect x="118" y="100" width="164" height="240" fill="#F6EFE6" />
      <path d="M160 340c0-60 10-110 30-150M230 340c0-50-6-90-20-130M200 340c0-40 20-70 44-90" stroke={C.green} strokeWidth="3" fill="none" />
      <path d="M176 260c-20-6-30-20-28-36 18 2 30 14 28 36Z" fill={C.green} />
      <Flower x={190} y={180} color={C.red} r={24} />
      <Flower x={246} y={226} color={C.magenta} r={18} />
      <Flower x={148} y={234} color={C.violet} r={16} />
      <text x="200" y="368" textAnchor="middle" fontSize="15" fontStyle="italic" fill={C.ink} fontFamily="var(--font-instrument)">
        Flores de Chile
      </text>
    </g>
  );
}

const ART: Record<ArtKey, (p: { id: string }) => ReactNode> = {
  "mug-dad": MugDad,
  "mug-magic": MugMagic,
  "mug-name": MugName,
  mug: ({ id }) => <Mug id={id} />,
  notebook: Notebook,
  agenda: Agenda,
  stickers: Stickers,
  "stickers-logo": StickersLogo,
  tote: Tote,
  bottle: Bottle,
  party: Party,
  cards: Cards,
  print: Print,
};

export function ProductArt({
  art,
  view = 0,
  className,
  title,
  bare = false,
}: {
  art: ArtKey;
  view?: 0 | 1;
  className?: string;
  title?: string;
  /** Sin fondo, para superponer en composiciones. */
  bare?: boolean;
}) {
  const id = useId().replace(/:/g, "");
  const Art = ART[art] ?? ART.mug;
  const [bg1, bg2] = BG[art] ?? BG.mug;
  return (
    <svg
      viewBox="0 0 400 500"
      className={className}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMidYMid slice"
    >
      <Gradients id={id} />
      {!bare && <rect width="400" height="500" fill={view === 0 ? bg1 : bg2} />}
      {!bare && view === 0 && <circle cx="330" cy="80" r="120" fill="#fff" opacity="0.35" />}
      <g transform={view === 1 ? "translate(200 250) scale(1.22) rotate(-5) translate(-200 -236)" : undefined}>
        <Art id={id} />
      </g>
    </svg>
  );
}

/** Mockup de taza con el diseño del cliente (vista previa de personalización). */
export function MugPreview({ print, interior, dark, className }: { print: MugPrint; interior?: string; dark?: boolean; className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 400 500" className={className} role="img" aria-label="Vista previa de tu taza personalizada">
      <Gradients id={id} />
      <Mug id={id} interior={interior} dark={dark}>
        <CustomMugPrint id={id} print={print} dark={dark} />
      </Mug>
    </svg>
  );
}

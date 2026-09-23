import type { ArtKey } from "./types";
import { site } from "./site";

/**
 * Publicaciones destacadas para la grilla social.
 * Para usar contenido real: sube la imagen a /public/social/ (o a Supabase Storage)
 * y completa `image` y `url` con el enlace directo a la publicación.
 */
export interface SocialPost {
  network: "instagram" | "tiktok";
  url: string;
  caption: string;
  image?: string;
  art: ArtKey;
}

export const socialPosts: SocialPost[] = [
  { network: "instagram", url: site.instagram.url, caption: "Tazas para el Día del Papá", art: "mug-dad" },
  { network: "tiktok", url: site.tiktok.url, caption: "Así estampamos una taza mágica", art: "mug-magic" },
  { network: "instagram", url: site.instagram.url, caption: "Stickers recién troquelados", art: "stickers" },
  { network: "instagram", url: site.instagram.url, caption: "Agendas 2027 con tu nombre", art: "agenda" },
  { network: "tiktok", url: site.tiktok.url, caption: "Empacando pedidos con cariño", art: "stickers-logo" },
  { network: "instagram", url: site.instagram.url, caption: "Kits para cumpleaños", art: "party" },
];

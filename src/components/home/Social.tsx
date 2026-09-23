import Image from "next/image";
import { site } from "@/lib/site";
import { socialPosts } from "@/lib/social";
import { cn } from "@/lib/format";
import { InstagramIcon, TikTokIcon } from "@/components/ui/Icon";
import { ProductArt } from "@/components/product/ProductArt";

export function Social() {
  return (
    <section aria-labelledby="social-title" className="container-x py-24 md:py-32">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-white px-5 py-14 shadow-[var(--shadow-soft)] sm:px-10 md:px-14 md:py-20">
        <div aria-hidden className="bg-gradient-minerva absolute -right-24 -top-24 size-72 rounded-full opacity-15 blur-3xl" />
        <div className="relative grid gap-10 lg:grid-cols-12 lg:items-center">
          <div data-reveal className="lg:col-span-5">
            <p className="eyebrow">Comunidad</p>
            <h2 id="social-title" className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
              Síguenos y descubre lo que estamos <span className="serif-accent text-gradient">creando</span>
            </h2>
            <p className="mt-4 max-w-md text-lg text-ink-soft">Procesos, lanzamientos y pedidos reales, directo desde nuestro taller.</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                <InstagramIcon /> {site.instagram.handle}
              </a>
              <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
                <TikTokIcon /> {site.tiktok.handle}
              </a>
            </div>
          </div>

          <ul data-reveal="stagger" className="grid grid-cols-3 gap-2 sm:gap-3 lg:col-span-7">
            {socialPosts.map((post, i) => (
              <li key={i} className={cn(i % 3 === 1 && "sm:translate-y-6")}>
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${post.caption} — ver en ${post.network === "instagram" ? "Instagram" : "TikTok"}`}
                  className={cn("group relative block overflow-hidden rounded-2xl bg-paper-2", post.network === "tiktok" ? "aspect-[9/14]" : "aspect-square")}
                >
                  {post.image ? (
                    <Image src={post.image} alt="" fill sizes="(min-width: 1024px) 18vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <ProductArt art={post.art} view={i % 2 === 0 ? 1 : 0} className="size-full transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <span className="absolute inset-0 flex flex-col justify-between bg-ink/0 p-2.5 text-white opacity-0 transition-all duration-500 group-hover:bg-ink/45 group-hover:opacity-100 group-focus-visible:bg-ink/45 group-focus-visible:opacity-100 sm:p-3">
                    <span className="self-end">{post.network === "instagram" ? <InstagramIcon size={18} /> : <TikTokIcon size={18} />}</span>
                    <span className="text-xs font-medium leading-tight sm:text-sm">{post.caption}</span>
                  </span>
                  <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-white/85 text-ink transition-opacity group-hover:opacity-0">
                    {post.network === "instagram" ? <InstagramIcon size={14} /> : <TikTokIcon size={14} />}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

"use client";
import { useState } from "react";
import { site } from "@/lib/site";
import { waLink } from "@/lib/whatsapp";
import { InstagramIcon, TikTokIcon, WhatsAppIcon } from "@/components/ui/Icon";

const TOPICS = ["Cotizar un producto", "Pedido por mayor / evento", "Estado de mi pedido", "Otro"];

export function Contact() {
  const [name, setName] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState(false);

  return (
    <section id="contacto" aria-labelledby="contacto-title" className="container-x pb-8 pt-12 md:pt-20">
      <div className="grid overflow-hidden rounded-[2.5rem] text-white lg:grid-cols-2">
        <div data-reveal className="relative overflow-hidden bg-ink p-8 sm:p-12 lg:p-16">
          <div aria-hidden className="bg-gradient-minerva absolute -bottom-32 -left-32 size-80 rounded-full opacity-30 blur-3xl" />
          <p className="eyebrow !text-white/60">Contacto</p>
          <h2 id="contacto-title" className="display relative mt-4 text-[clamp(2.25rem,5vw,4rem)]">
            Conversemos <span className="serif-accent text-gradient">tu idea</span>
          </h2>
          <p className="relative mt-4 max-w-md text-lg text-white/70">
            Cuéntanos qué tienes en mente y te respondemos por WhatsApp con opciones y precios.
          </p>
          <ul className="relative mt-10 space-y-4">
            <li>
              <a href={waLink()} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-[#1faa59]">
                  <WhatsAppIcon />
                </span>
                <span>
                  <span className="block text-sm text-white/60">WhatsApp</span>
                  <span className="font-semibold group-hover:underline">{site.whatsappDisplay}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-white/10">
                  <InstagramIcon />
                </span>
                <span>
                  <span className="block text-sm text-white/60">Instagram</span>
                  <span className="font-semibold group-hover:underline">{site.instagram.handle}</span>
                </span>
              </a>
            </li>
            <li>
              <a href={site.tiktok.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4">
                <span className="grid size-12 place-items-center rounded-full bg-white/10">
                  <TikTokIcon />
                </span>
                <span>
                  <span className="block text-sm text-white/60">TikTok</span>
                  <span className="font-semibold group-hover:underline">{site.tiktok.handle}</span>
                </span>
              </a>
            </li>
          </ul>
        </div>

        <form
          data-reveal
          className="border border-line bg-white p-8 text-ink sm:p-12 max-lg:rounded-b-[2.5rem] lg:rounded-r-[2.5rem] lg:p-16"
          onSubmit={(e) => {
            e.preventDefault();
            if (!message.trim()) {
              setError(true);
              return;
            }
            const text = `Hola Minerva 👋 ${name.trim() ? `Soy ${name.trim()}. ` : ""}Les escribo desde la página web.\n*Motivo:* ${topic}\n\n${message.trim()}`;
            window.open(waLink(text), "_blank", "noopener,noreferrer");
          }}
          noValidate
        >
          <div className="space-y-5">
            <div>
              <label htmlFor="c-name" className="label">
                Tu nombre
              </label>
              <input id="c-name" className="field" value={name} onChange={(e) => setName(e.target.value)} autoComplete="given-name" />
            </div>
            <fieldset>
              <legend className="label">Motivo</legend>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {TOPICS.map((t) => (
                  <button key={t} type="button" role="radio" aria-checked={topic === t} onClick={() => setTopic(t)} className="chip">
                    {t}
                  </button>
                ))}
              </div>
            </fieldset>
            <div>
              <label htmlFor="c-msg" className="label">
                Mensaje
              </label>
              <textarea
                id="c-msg"
                rows={4}
                className="field resize-none"
                value={message}
                aria-invalid={error}
                aria-describedby={error ? "c-msg-err" : undefined}
                onChange={(e) => {
                  setMessage(e.target.value);
                  setError(false);
                }}
                placeholder="Ej: Quiero 10 tazas para el cumpleaños de mi mamá con una foto familiar…"
              />
              {error && (
                <p id="c-msg-err" className="mt-1.5 text-sm text-m-red">
                  Escribe un mensaje para poder ayudarte.
                </p>
              )}
            </div>
            <button type="submit" className="btn btn-wa w-full">
              <WhatsAppIcon /> Enviar por WhatsApp
            </button>
            <p className="text-center text-xs text-ink-soft">Se abrirá WhatsApp con tu mensaje listo para enviar.</p>
          </div>
        </form>
      </div>
    </section>
  );
}

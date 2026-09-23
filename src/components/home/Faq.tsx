import { faqs } from "@/lib/faq";
import { waLink } from "@/lib/whatsapp";
import { Icon, WhatsAppIcon } from "@/components/ui/Icon";

export function Faq() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  return (
    <section id="faq" aria-labelledby="faq-title" className="container-x py-24 md:py-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <div className="grid gap-12 lg:grid-cols-12">
        <div data-reveal className="lg:col-span-4">
          <p className="eyebrow">Ayuda</p>
          <h2 id="faq-title" className="display mt-4 text-[clamp(2.25rem,5vw,3.75rem)]">
            Preguntas <span className="serif-accent">frecuentes</span>
          </h2>
          <p className="mt-4 text-ink-soft">¿No encuentras tu respuesta? Te respondemos rápido por WhatsApp.</p>
          <a href={waLink()} target="_blank" rel="noopener noreferrer" className="btn btn-wa mt-6">
            <WhatsAppIcon /> Hacer una pregunta
          </a>
        </div>
        <div data-reveal="stagger" className="divide-y divide-line border-y border-line lg:col-span-8">
          {faqs.map((f) => (
            <details key={f.q} className="group py-2 [&_summary::-webkit-details-marker]:hidden">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-xl py-4 text-left text-lg font-semibold sm:text-xl">
                {f.q}
                <span className="grid size-10 shrink-0 place-items-center rounded-full border border-line transition-[transform,background-color,color] duration-500 ease-[var(--ease-out-expo)] group-open:rotate-45 group-open:bg-ink group-open:text-white">
                  <Icon name="plus" size={18} />
                </span>
              </summary>
              <p className="max-w-2xl pb-5 pr-14 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

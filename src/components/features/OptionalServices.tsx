import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ServiceAddButton, { type ServicePayload } from "./ServiceAddButton";

type Service = ServicePayload & {
  blurb: string;
  tone: "green" | "amber" | "white";
};

const SERVICES: Service[] = [
  {
    id: "inventory-mgmt",
    name: "Inventory Management",
    blurb: "Full competitor scan every 3–5 days. Billed after sale.",
    price: 50,
    unit: "post-sale",
    priceLabel: "$50 / car",
    qtyLabel: "Cars",
    tone: "green",
  },
  {
    id: "shipping",
    name: "Shipping coordination",
    blurb: "Routed transport with 10% of saved freight costs.",
    price: 10,
    unit: "per car",
    priceLabel: "$10/car + 10% saved",
    qtyLabel: "Cars",
    tone: "white",
  },
  {
    id: "parts",
    name: "Parts searching",
    blurb: "AI parts search across 2,400+ suppliers.",
    price: 20,
    unit: "per car",
    priceLabel: "$20 / car",
    qtyLabel: "Cars",
    tone: "amber",
  },
  {
    id: "seo",
    name: "Website + SEO",
    blurb: "Dealer website, local SEO, and listing syndication.",
    price: 499,
    unit: "per month",
    priceLabel: "$499 / month",
    qtyLabel: "Months",
    tone: "white",
  },
  {
    id: "pricing-report",
    name: "Weekly competitor pricing report",
    blurb: "Per-market pricing intelligence updated weekly.",
    price: 35,
    unit: "per report",
    priceLabel: "$35 / report",
    qtyLabel: "Reports",
    tone: "green",
  },
];

export default function OptionalServices() {
  const railRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.7), behavior: "smooth" });
  };

  return (
    <section id="services" data-section="services" className="relative py-32 md:py-40">
      <section className="container">
        <section className="reveal flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <section>
            <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
              06 — Optional services
            </p>
            <h2 className="max-w-2xl font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
              Add only what moves the needle.
            </h2>
            <p className="mt-4 max-w-md text-[14px] text-white/55">
              Mix‑and‑match a pilot loadout. Most line items bill per car or after sale.
            </p>
          </section>

          <section className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              data-cursor="hover"
              aria-label="Previous"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:bg-white/[0.05]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              data-cursor="hover"
              aria-label="Next"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:bg-white/[0.05]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </section>
        </section>
      </section>

      <section
        ref={railRef}
        className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]"
      >
        {SERVICES.map((s, i) => (
          <article
            key={s.id}
            className="reveal group relative flex h-[360px] w-[82%] flex-shrink-0 snap-center flex-col justify-between overflow-hidden rounded-3xl border border-white/[0.06] bg-white/[0.02] p-7 transition hover:border-white/15 sm:w-[340px]"
          >
            <span
              className="absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl transition group-hover:scale-110"
              style={{
                background:
                  s.tone === "green"
                    ? "rgba(0,240,176,0.18)"
                    : s.tone === "amber"
                    ? "rgba(255,204,102,0.16)"
                    : "rgba(255,255,255,0.04)",
              }}
              aria-hidden
            />
            <section className="relative">
              <p className="text-[10.5px] uppercase tracking-[0.28em] text-white/40">0{i + 1}</p>
              <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
                {s.name}
              </h3>
              <p className="mt-3 text-[14px] leading-relaxed text-white/55">{s.blurb}</p>
            </section>

            <section className="relative flex items-end justify-between">
              <section>
                <p
                  className={`font-display text-3xl font-semibold tabular-nums ${
                    s.tone === "green"
                      ? "text-rev-green"
                      : s.tone === "amber"
                      ? "text-rev-amber"
                      : "text-white"
                  }`}
                >
                  {s.priceLabel}
                </p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/40">{s.unit}</p>
              </section>
              <ServiceAddButton service={s} variant="light" />
            </section>
          </article>
        ))}
      </section>
    </section>
  );
}

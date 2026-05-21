import { useRef } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import ServiceAddButton, { type ServicePayload } from "./ServiceAddButton";
import { useCart } from "@/hooks/useCart";

type Service = ServicePayload & {
  blurb: string;
  detail: string;
  tone: "green" | "amber" | "white";
};

const SERVICES: Service[] = [
  {
    id: "inventory-mgmt",
    name: "Inventory Management",
    blurb: "Full competitor scan every 3–5 days.",
    detail: "Billed after sale — zero upfront cost.",
    price: 50,
    unit: "post-sale",
    priceLabel: "$50 / car",
    qtyLabel: "Cars",
    tone: "green",
  },
  {
    id: "shipping",
    name: "Shipping Coordination",
    blurb: "Routed transport with freight savings.",
    detail: "We return 10% of every dollar saved.",
    price: 10,
    unit: "per car",
    priceLabel: "$10/car + 10% saved",
    qtyLabel: "Cars",
    tone: "white",
  },
  {
    id: "parts",
    name: "Parts Searching",
    blurb: "AI parts search across 2,400+ suppliers.",
    detail: "Average savings: $180 per repair order.",
    price: 20,
    unit: "per car",
    priceLabel: "$20 / car",
    qtyLabel: "Cars",
    tone: "amber",
  },
  {
    id: "seo",
    name: "Website + SEO",
    blurb: "Dealer site, local SEO, listing sync.",
    detail: "Across 12 platforms, updated daily.",
    price: 499,
    unit: "per month",
    priceLabel: "$499 / month",
    qtyLabel: "Months",
    tone: "white",
  },
  {
    id: "pricing-report",
    name: "Competitor Pricing Report",
    blurb: "Per-market intelligence, updated weekly.",
    detail: "Covers 200+ competitors in your radius.",
    price: 35,
    unit: "per report",
    priceLabel: "$35 / report",
    qtyLabel: "Reports",
    tone: "green",
  },
];

const ACCENT: Record<string, string> = {
  green: "rgba(0,240,176,0.18)",
  amber: "rgba(255,204,102,0.16)",
  white: "rgba(255,255,255,0.04)",
};

const ACCENT_BORDER: Record<string, string> = {
  green: "rgba(0,240,176,0.2)",
  amber: "rgba(255,204,102,0.18)",
  white: "rgba(255,255,255,0.08)",
};

export default function OptionalServices() {
  const railRef = useRef<HTMLDivElement>(null);
  const { items } = useCart();

  const scrollBy = (dir: number) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.75), behavior: "smooth" });
  };

  return (
    <section id="services" data-section="services" className="relative py-28 md:py-36 section-glow-top">
      <div className="container">
        <div className="reveal flex flex-col items-start gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
              06 — Optional services
            </p>
            <h2 className="max-w-2xl font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
              Add only what moves the needle.
            </h2>
            <p className="mt-4 max-w-md text-[14px] leading-relaxed text-white/55">
              Mix‑and‑match a pilot loadout. Most services bill per car or post-sale — no monthly
              minimums.
            </p>
          </div>

          {/* Scroll arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-1)}
              data-cursor="hover"
              aria-label="Previous services"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(1)}
              data-cursor="hover"
              aria-label="Next services"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Services rail */}
      <div
        ref={railRef}
        className="scrollbar-none mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:px-[max(1.5rem,calc((100vw-1280px)/2+1.5rem))]"
      >
        {SERVICES.map((s, i) => {
          const inCart = items.some((item) => item.id === s.id);

          return (
            <article
              key={s.id}
              className={`card-lift group relative flex flex-shrink-0 snap-center flex-col justify-between overflow-hidden rounded-[28px] border p-7 sm:w-[340px] w-[82%]`}
              style={{
                minHeight: 340,
                background: "rgba(16,18,24,0.85)",
                borderColor: inCart ? ACCENT_BORDER[s.tone] : "rgba(255,255,255,0.07)",
                boxShadow: inCart
                  ? `0 0 0 1px ${ACCENT_BORDER[s.tone]}, 0 20px 60px rgba(0,0,0,0.25)`
                  : "0 20px 60px rgba(0,0,0,0.2)",
              }}
            >
              {/* Corner glow */}
              <span
                className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-all duration-500 group-hover:scale-125 group-hover:opacity-100"
                style={{
                  background: ACCENT[s.tone],
                  opacity: inCart ? 1 : 0.6,
                }}
                aria-hidden
              />

              {/* "In cart" indicator */}
              {inCart && (
                <div
                  className="absolute right-4 top-4 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    background: `${ACCENT[s.tone]}`,
                    color: s.tone === "green" ? "#00F0B0" : s.tone === "amber" ? "#FFCC66" : "#fff",
                    border: `1px solid ${ACCENT_BORDER[s.tone]}`,
                  }}
                >
                  <Check className="h-3 w-3" />
                  In cart
                </div>
              )}

              {/* Card content */}
              <div className="relative">
                <p className="text-[10.5px] uppercase tracking-[0.28em] text-white/35">0{i + 1}</p>
                <h3 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight">
                  {s.name}
                </h3>
                <p className="mt-3 text-[14px] leading-relaxed text-white/60">{s.blurb}</p>
                <p className="mt-1.5 text-[12px] leading-relaxed text-white/38">{s.detail}</p>
              </div>

              {/* Price + CTA */}
              <div className="relative mt-8 flex items-end justify-between">
                <div>
                  <p
                    className="font-display text-3xl font-semibold tabular-nums"
                    style={{
                      color:
                        s.tone === "green"
                          ? "#00F0B0"
                          : s.tone === "amber"
                          ? "#FFCC66"
                          : "white",
                    }}
                  >
                    {s.priceLabel}
                  </p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/38">
                    {s.unit}
                  </p>
                </div>
                <ServiceAddButton service={s} variant="light" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

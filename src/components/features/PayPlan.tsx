import { useState, useRef, useEffect } from "react";

// Commission structure: 30% / 20% / 15% / $0 after 60 days
const ROWS = [
  {
    range: "1 – 10 days",
    commission: "30%",
    badge: "Best rate",
    description: "Sell fast, both win big.",
    accent: "#00F0B0",
    highlight: true,
  },
  {
    range: "11 – 30 days",
    commission: "20%",
    badge: null,
    description: "Healthy volume, strong margins.",
    accent: "#FFCC66",
    highlight: false,
  },
  {
    range: "31 – 60 days",
    commission: "15%",
    badge: null,
    description: "Aging inventory, slimmer take.",
    accent: "#FFB347",
    highlight: false,
  },
  {
    range: "60+ days",
    commission: "$0",
    badge: "Zero risk",
    description: "Sits too long → you owe nothing.",
    accent: "#FF4D4D",
    zero: true,
  },
];

// Example calculation
const EXAMPLE = {
  salePrice: 18500,
  buyPrice: 14200,
  recon: 850,
  shipping: 180,
  fees: 320,
  get netProfit() {
    return this.salePrice - this.buyPrice - this.recon - this.shipping - this.fees;
  },
  get revuShare15() {
    return Math.round(this.netProfit * 0.15);
  },
  get dealerKeep15() {
    return this.netProfit - this.revuShare15;
  },
};

export default function PayPlan() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="plan"
      data-section="plan"
      ref={sectionRef}
      className="relative py-28 md:py-36 section-glow-top"
      style={{ background: "linear-gradient(180deg, #0D1018 0%, #0A0C10 100%)" }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[360px] w-[500px] -translate-x-1/2 rounded-full opacity-[0.05] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #FFCC66, transparent 70%)" }}
      />

      <div className="container">
        {/* Header */}
        <div
          className={`mx-auto max-w-3xl text-center transition duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
            03 — The pay plan
          </p>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl lg:text-6xl">
            Skin in the game.{" "}
            <span className="text-gradient-warm">Priced by performance.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed text-white/58">
            Revu earns only when you earn. The faster the car sells, the higher our share — but
            you always keep the majority of net profit.
          </p>
        </div>

        <div
          className={`mt-16 grid gap-8 lg:grid-cols-[1fr_1fr] transition duration-700 ease-out delay-100 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Commission table */}
          <div>
            <div className="overflow-hidden rounded-[28px] border border-white/[0.07] glass shadow-card-dark">
              {/* Table header */}
              <div className="border-b border-white/[0.06] px-6 py-4">
                <div className="grid grid-cols-[1fr_auto] text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/35">
                  <span>Days to sell</span>
                  <span>Revu's share of net profit</span>
                </div>
              </div>

              {/* Rows */}
              {ROWS.map((r) => (
                <div
                  key={r.range}
                  className={`group relative border-t border-white/[0.04] transition-colors duration-200 hover:bg-white/[0.025] ${
                    r.highlight ? "bg-rev-green/[0.04]" : r.zero ? "bg-rev-red/[0.03]" : ""
                  }`}
                >
                  {/* Accent left bar */}
                  <div
                    className="absolute left-0 top-0 h-full w-[3px] rounded-r-full opacity-60"
                    style={{ background: r.accent }}
                    aria-hidden
                  />
                  <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-5 pl-8">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-[15px] text-white/85">{r.range}</span>
                        {r.badge && (
                          <span
                            className="rounded-full px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider"
                            style={{
                              background: `${r.accent}20`,
                              color: r.accent,
                              border: `1px solid ${r.accent}40`,
                            }}
                          >
                            {r.badge}
                          </span>
                        )}
                      </div>
                      <div className="mt-0.5 text-[12px] text-white/38">{r.description}</div>
                    </div>
                    <div
                      className="font-display text-3xl font-semibold tabular-nums"
                      style={{ color: r.accent }}
                    >
                      {r.commission}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footnote */}
            <p className="mt-5 text-[13.5px] leading-relaxed text-white/50">
              <span className="text-white/70 font-medium">Net profit =</span> Sale price − Buy price − Recon − Shipping − Fees.
              {" "}Full transparency, calculated per car.
            </p>
          </div>

          {/* Example calculation card */}
          <div className="flex flex-col gap-4">
            {/* Explainer card */}
            <div className="flex-1 rounded-[28px] border border-white/[0.07] bg-[rgba(16,18,24,0.85)] p-7 backdrop-blur-sm shadow-card-dark">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/35">
                Example calculation
              </p>
              <p className="mt-1 text-[13px] text-white/50">
                A car sold in 42 days — standard tier (15% commission)
              </p>

              <div className="mt-6 space-y-3 text-[14px]">
                {[
                  { label: "Sale price", value: `$${EXAMPLE.salePrice.toLocaleString()}`, color: "" },
                  { label: "Buy price", value: `− $${EXAMPLE.buyPrice.toLocaleString()}`, color: "text-white/50" },
                  { label: "Reconditioning", value: `− $${EXAMPLE.recon.toLocaleString()}`, color: "text-white/50" },
                  { label: "Shipping", value: `− $${EXAMPLE.shipping.toLocaleString()}`, color: "text-white/50" },
                  { label: "Fees", value: `− $${EXAMPLE.fees.toLocaleString()}`, color: "text-white/50" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/[0.04] pb-3">
                    <span className="text-white/55">{label}</span>
                    <span className={color || "text-white/85 tabular-nums font-display"}>{value}</span>
                  </div>
                ))}

                {/* Net profit */}
                <div className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.025] px-4 py-3">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-white/60">
                    Net profit
                  </span>
                  <span className="font-display text-xl font-semibold text-white tabular-nums">
                    ${EXAMPLE.netProfit.toLocaleString()}
                  </span>
                </div>

                {/* Split */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="rounded-xl border border-rev-green/20 bg-rev-green/[0.07] p-4 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-rev-green/70">Revu (15%)</div>
                    <div className="mt-1 font-display text-xl font-semibold text-rev-green tabular-nums">
                      ${EXAMPLE.revuShare15.toLocaleString()}
                    </div>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center">
                    <div className="text-[10px] uppercase tracking-wider text-white/50">You keep (85%)</div>
                    <div className="mt-1 font-display text-xl font-semibold text-white tabular-nums">
                      ${EXAMPLE.dealerKeep15.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CTA hint */}
            <div className="rounded-2xl border border-rev-green/15 bg-rev-green/[0.05] px-5 py-4">
              <p className="text-[13px] text-rev-green/80">
                <span className="font-semibold">Zero risk:</span> If a car sits past 60 days,
                Revu collects $0. Your floor cost is the only exposure.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

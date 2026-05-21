import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Radar,
  Gauge,
  PenLine,
  AlertTriangle,
} from "lucide-react";

const ITEMS = [
  {
    label: "Predictive Turnaround",
    Icon: TrendingUp,
    hint: "Predicts days to sell within ±5 days",
  },
  {
    label: "Smart Buy Price",
    Icon: DollarSign,
    hint: "Auction-aware buy price bands per VIN",
  },
  {
    label: "Competitor Tracking",
    Icon: Radar,
    hint: "Live scans every 3–5 days in your market",
  },
  {
    label: "Inventory Scoring",
    Icon: Gauge,
    hint: "Ranks units by margin and velocity risk",
  },
  {
    label: "AI Copywriting",
    Icon: PenLine,
    hint: "Listing copy tuned for your lot and region",
  },
  {
    label: "Risk Alerts",
    Icon: AlertTriangle,
    hint: "Flags aging units before they hit 60 days",
  },
];

export default function AiMarquee() {
  const [hovered, setHovered] = useState<string | null>(null);
  const row = [...ITEMS, ...ITEMS];
  const activeHint = ITEMS.find((i) => i.label === hovered)?.hint;

  return (
    <section data-section="ai" className="relative overflow-hidden py-28 md:py-36">
      <section className="container mb-12">
        <section className="reveal flex flex-col items-start gap-3 md:flex-row md:items-end md:justify-between">
          <section>
            <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
              05 — The intelligence
            </p>
            <h2 className="max-w-2xl font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
              AI works in the background.{" "}
              <span className="text-gradient">You see results.</span>
            </h2>
          </section>
          <p className="max-w-sm text-[14px] text-white/55">
            Hover any capability to see what it does under the hood.
          </p>
        </section>
      </section>

      <section
        className="group relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <section className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {row.map(({ label, Icon, hint }, i) => (
            <button
              key={`${label}-${i}`}
              type="button"
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(label)}
              onBlur={() => setHovered(null)}
              className="flex items-center gap-3 rounded-full border border-white/[0.06] bg-white/[0.02] px-6 py-4 backdrop-blur-sm transition hover:border-rev-green/30 hover:bg-rev-green/[0.04]"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-rev-green/10 text-rev-green">
                <Icon className="h-4 w-4" />
              </span>
              <span className="whitespace-nowrap font-display text-[15px] font-medium tracking-tight text-white/90">
                {label}
              </span>
              <span className="sr-only">{hint}</span>
            </button>
          ))}
        </section>
      </section>

      <section className="container mt-8">
        <p
          className="reveal mx-auto min-h-[1.5rem] max-w-xl text-center text-[14px] text-rev-green/90 transition-opacity duration-300"
          style={{ opacity: activeHint ? 1 : 0.35 }}
          aria-live="polite"
        >
          {activeHint ?? "Six engines running on every car you list."}
        </p>
      </section>
    </section>
  );
}

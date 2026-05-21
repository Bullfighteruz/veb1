import { useState } from "react";
import {
  TrendingUp,
  DollarSign,
  Radar,
  Gauge,
  PenLine,
  AlertTriangle,
  Zap,
  BarChart3,
} from "lucide-react";

const ITEMS = [
  {
    label: "Predictive Turnaround",
    Icon: TrendingUp,
    hint: "Predicts days to sell within ±5 days using VIN-level market data",
    color: "#00F0B0",
  },
  {
    label: "Smart Buy Price",
    Icon: DollarSign,
    hint: "Auction-aware buy price bands per VIN — never overpay again",
    color: "#FFCC66",
  },
  {
    label: "Competitor Tracking",
    Icon: Radar,
    hint: "Live market scans every 3–5 days across your local radius",
    color: "#00F0B0",
  },
  {
    label: "Inventory Scoring",
    Icon: Gauge,
    hint: "Ranks every unit by margin potential and velocity risk (0–100)",
    color: "#FFB347",
  },
  {
    label: "AI Copywriting",
    Icon: PenLine,
    hint: "SEO-tuned listing copy matched to your lot, region, and buyer profile",
    color: "#00F0B0",
  },
  {
    label: "Risk Alerts",
    Icon: AlertTriangle,
    hint: "Flags aging units before they cross 60 days — prevent zero-profit sits",
    color: "#FF4D4D",
  },
  {
    label: "Velocity Forecasting",
    Icon: Zap,
    hint: "30-day sell-through projection updated daily per vehicle",
    color: "#FFCC66",
  },
  {
    label: "Market Positioning",
    Icon: BarChart3,
    hint: "Shows exactly where each car sits vs. 200+ competitors in real time",
    color: "#00F0B0",
  },
];

export default function AiMarquee() {
  const [hovered, setHovered] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string | null>(null);

  // Combine tap and hover for mobile/desktop support
  const active = hovered ?? tapped;
  const activeItem = ITEMS.find((i) => i.label === active);

  const row1 = [...ITEMS, ...ITEMS];
  const row2 = [...ITEMS.slice(4), ...ITEMS.slice(0, 4), ...ITEMS.slice(4), ...ITEMS.slice(0, 4)];

  const handleTap = (label: string) => {
    setTapped((prev) => (prev === label ? null : label));
  };

  return (
    <section data-section="ai" className="relative overflow-hidden py-24 md:py-32 section-glow-top">
      <div className="container mb-12">
        <div className="reveal flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
              05 — The intelligence
            </p>
            <h2 className="max-w-2xl font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl">
              AI works in the background.{" "}
              <span className="text-gradient-green">You see results.</span>
            </h2>
          </div>
          <p className="max-w-xs text-[14px] leading-relaxed text-white/50">
            Hover or tap any capability to see what it does under the hood.
          </p>
        </div>
      </div>

      {/* Marquee row 1 */}
      <div
        className="group relative"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {row1.map(({ label, Icon, hint, color }, i) => (
            <button
              key={`r1-${label}-${i}`}
              type="button"
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(label)}
              onBlur={() => setHovered(null)}
              onClick={() => handleTap(label)}
              aria-label={`${label}: ${hint}`}
              className={`tooltip-trigger relative flex items-center gap-3 rounded-full border px-6 py-3.5 backdrop-blur-sm transition-all duration-300 ${
                active === label
                  ? "border-opacity-60 bg-opacity-10"
                  : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
              style={
                active === label
                  ? { borderColor: `${color}60`, background: `${color}12` }
                  : {}
              }
            >
              <span
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: `${color}18` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </span>
              <span className="whitespace-nowrap font-display text-[14px] font-medium tracking-tight text-white/90">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2 — slower, reversed */}
      <div
        className="group relative mt-4"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 6%, black 94%, transparent)",
        }}
      >
        <div className="flex w-max animate-marquee-reverse gap-4 group-hover:[animation-play-state:paused]">
          {row2.map(({ label, Icon, hint, color }, i) => (
            <button
              key={`r2-${label}-${i}`}
              type="button"
              onMouseEnter={() => setHovered(label)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(label)}
              onBlur={() => setHovered(null)}
              onClick={() => handleTap(label)}
              aria-label={`${label}: ${hint}`}
              className={`tooltip-trigger relative flex items-center gap-3 rounded-full border px-6 py-3.5 backdrop-blur-sm transition-all duration-300 ${
                active === label
                  ? ""
                  : "border-white/[0.05] bg-white/[0.015] hover:border-white/12 hover:bg-white/[0.03]"
              }`}
              style={
                active === label
                  ? { borderColor: `${color}50`, background: `${color}08` }
                  : {}
              }
            >
              <span
                className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                style={{ background: `${color}12` }}
              >
                <Icon className="h-4 w-4" style={{ color }} />
              </span>
              <span className="whitespace-nowrap font-display text-[14px] font-medium tracking-tight text-white/75">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Hint display — floating chip above / below marquee */}
      <div className="container mt-8">
        <div
          className="reveal mx-auto max-w-lg rounded-full border border-white/[0.07] bg-white/[0.025] px-6 py-3.5 text-center text-[13.5px] leading-relaxed backdrop-blur-sm transition-all duration-300"
          aria-live="polite"
          style={{
            borderColor: activeItem ? `${activeItem.color}40` : undefined,
            background: activeItem ? `${activeItem.color}0A` : undefined,
          }}
        >
          {activeItem ? (
            <span style={{ color: activeItem.color }}>{activeItem.hint}</span>
          ) : (
            <span className="text-white/40">
              Eight AI engines running on every car you list.
            </span>
          )}
        </div>
      </div>
    </section>
  );
}

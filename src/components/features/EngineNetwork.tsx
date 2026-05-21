import { useState, useRef, useEffect } from "react";
import { Truck, Wrench, Megaphone, Search, Boxes } from "lucide-react";
import ServiceAddButton, { type ServicePayload } from "./ServiceAddButton";

type Node = {
  id: string;
  name: string;
  short: string;
  desc: string;
  priceLabel: string;
  unitNote: string;
  icon: typeof Truck;
  x: number;
  y: number;
  service: ServicePayload;
};

const NODES: Node[] = [
  {
    id: "dispatch",
    name: "Dispatch",
    short: "Logistics",
    desc: "Shipping coordination with routed transport and freight savings.",
    priceLabel: "$10/car + 10% of saved costs",
    unitNote: "per car",
    icon: Truck,
    x: 50,
    y: 12,
    service: {
      id: "shipping",
      name: "Shipping coordination",
      price: 10,
      unit: "per car",
      priceLabel: "$10/car + 10% saved",
      qtyLabel: "Cars",
    },
  },
  {
    id: "parts",
    name: "Parts",
    short: "Sourcing",
    desc: "Parts searching across 2,400+ suppliers.",
    priceLabel: "$20 / car",
    unitNote: "per car",
    icon: Wrench,
    x: 88,
    y: 38,
    service: {
      id: "parts",
      name: "Parts searching",
      price: 20,
      unit: "per car",
      priceLabel: "$20 / car",
      qtyLabel: "Cars",
    },
  },
  {
    id: "marketing",
    name: "Marketing + SEO",
    short: "Demand",
    desc: "Website + SEO, listings syndication, and ad ops.",
    priceLabel: "$499 / month",
    unitNote: "monthly",
    icon: Megaphone,
    x: 75,
    y: 82,
    service: {
      id: "seo",
      name: "Website + SEO",
      price: 499,
      unit: "per month",
      priceLabel: "$499 / month",
      qtyLabel: "Months",
    },
  },
  {
    id: "buying",
    name: "Buying",
    short: "Acquisition",
    desc: "Auction signals, smart buy price, and competitor intelligence.",
    priceLabel: "$35 / report",
    unitNote: "per report",
    icon: Search,
    x: 25,
    y: 82,
    service: {
      id: "pricing-report",
      name: "Weekly competitor pricing report",
      price: 35,
      unit: "per report",
      priceLabel: "$35 / report",
      qtyLabel: "Reports",
    },
  },
  {
    id: "inventory",
    name: "Inventory Management",
    short: "Ops",
    desc: "Full competitor scan every 3–5 days — billed only after sale.",
    priceLabel: "$50 / car (post-sale)",
    unitNote: "post-sale",
    icon: Boxes,
    x: 12,
    y: 38,
    service: {
      id: "inventory-mgmt",
      name: "Inventory Management",
      price: 50,
      unit: "post-sale",
      priceLabel: "$50 / car",
      qtyLabel: "Cars",
    },
  },
];

export default function EngineNetwork() {
  const [hover, setHover] = useState<string | null>(null);
  const [locked, setLocked] = useState<string | null>(null);

  // active is locked if present, otherwise hover
  const active = locked ?? hover;

  // close locked when clicking outside the network area
  const containerRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!containerRef.current) return;
      if (target && containerRef.current.contains(target)) return;
      setLocked(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <section id="engine" data-section="engine" className="relative py-32 md:py-40">
      <section className="container" ref={containerRef as any}>
        <section className="mx-auto mb-16 max-w-3xl text-center reveal">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
            02 — The engine
          </p>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-6xl">
            Five departments. <span className="text-gradient">One nervous system.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-white/60">
            Hover or tap any node to see how it works — and what it costs. Click to add optional
            services to your pilot cart.
          </p>
        </section>

        <section className="reveal relative mx-auto aspect-square max-w-[680px]">
          <section className="pointer-events-none absolute inset-0" aria-hidden>
            {[0, 1, 2].map((r) => (
              <span
                key={r}
                className="absolute inset-0 block rounded-full border border-white/[0.05]"
                style={{ margin: `${r * 8}%` }}
              />
            ))}
            <span className="absolute inset-[28%] block rounded-full bg-rev-green/[0.04] blur-3xl" />
          </section>

          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
            {NODES.map((n) => (
              <line
                key={n.id}
                x1="50"
                y1="50"
                x2={n.x}
                y2={n.y}
                stroke={active === n.id ? "#00F0B0" : "rgba(255,255,255,0.12)"}
                strokeWidth={active === n.id ? "0.25" : "0.15"}
                style={{ transition: "all 0.4s ease" }}
              />
            ))}
            {NODES.map((n, i) => {
              const next = NODES[(i + 1) % NODES.length];
              return (
                <line
                  key={`${n.id}-ring`}
                  x1={n.x}
                  y1={n.y}
                  x2={next.x}
                  y2={next.y}
                  stroke="rgba(255,255,255,0.07)"
                  strokeWidth="0.1"
                  strokeDasharray="0.6 0.6"
                />
              );
            })}
          </svg>

          <section className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <section className="relative flex h-28 w-28 items-center justify-center rounded-full glass-strong">
              <span className="absolute inset-0 animate-pulse-soft rounded-full bg-rev-green/10 blur-xl" aria-hidden />
              <section className="relative text-center">
                <p className="font-display text-xs uppercase tracking-[0.3em] text-white/45">Core</p>
                <p className="font-display text-xl font-semibold text-white">Revu</p>
              </section>
            </section>
          </section>

          {NODES.map((n) => {
            const Icon = n.icon;
            const isActive = active === n.id;
            return (
              <button
                key={n.id}
                type="button"
                onMouseEnter={() => setHover(n.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(n.id)}
                onBlur={() => setHover(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setLocked((p) => (p === n.id ? null : n.id));
                }}
                data-cursor="hover"
                className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none"
                style={{ left: `${n.x}%`, top: `${n.y}%` }}
                aria-label={`${n.name} — ${n.desc}`}
              >
                <span
                  className={`relative flex h-16 w-16 items-center justify-center rounded-full border transition-all duration-300 ${
                    isActive
                      ? "border-rev-green/50 bg-ink-800 shadow-[0_0_0_6px_rgba(0,240,176,0.08)]"
                      : "border-white/10 bg-ink-800/80 group-hover:border-white/25"
                  }`}
                >
                  <Icon className={`h-5 w-5 transition ${isActive ? "text-rev-green" : "text-white/80"}`} />
                </span>
                <span
                  className={`absolute left-1/2 mt-3 -translate-x-1/2 whitespace-nowrap text-[10.5px] uppercase tracking-[0.22em] transition ${
                    isActive ? "text-white" : "text-white/55"
                  }`}
                >
                  {n.name}
                </span>
              </button>
            );
          })}
        </section>

        <section className="mx-auto mt-10 max-w-2xl reveal">
          <section
            className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500"
            style={{ minHeight: 132 }}
          >
            {active ? (
              <ActiveDetail node={NODES.find((n) => n.id === active)!} />
            ) : (
              <p className="text-center text-[13px] text-white/40">
                Hover a node to inspect — click to lock it. Then add it to your pilot.
              </p>
            )}
          </section>
        </section>
      </section>
    </section>
  );
}

function ActiveDetail({ node }: { node: Node }) {
  return (
    <section className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
      <section>
        <p className="mb-1 text-[10.5px] uppercase tracking-[0.28em] text-rev-green">{node.short}</p>
        <p className="font-display text-2xl font-semibold leading-tight">{node.name}</p>
        <p className="mt-1 text-[14px] text-white/60">{node.desc}</p>
      </section>
      <section className="flex w-full items-center justify-between gap-4 sm:w-auto">
        <section className="text-right">
          <p className="font-display text-xl font-semibold tabular-nums text-rev-amber">{node.priceLabel}</p>
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/40">{node.unitNote}</p>
        </section>
        <ServiceAddButton service={node.service} />
      </section>
    </section>
  );
}

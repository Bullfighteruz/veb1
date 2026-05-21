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
    desc: "Shipping coordination with routed transport and freight savings up to 30%.",
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
    desc: "AI-powered parts search across 2,400+ suppliers. Average $180 saved per repair.",
    priceLabel: "$20 / car",
    unitNote: "per car",
    icon: Wrench,
    // Moved slightly inward from 88% to prevent mobile overflow
    x: 84,
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
    desc: "Dealer website, local SEO, listings syndication across 12 platforms, and ad ops.",
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
    desc: "Auction signals, smart buy price bands, and weekly competitor intelligence.",
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
    desc: "Full competitor market scan every 3–5 days. Billed only after car is sold.",
    priceLabel: "$50 / car (post-sale)",
    unitNote: "post-sale",
    icon: Boxes,
    // Moved slightly inward from 12% to prevent mobile overflow
    x: 16,
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
  const [visible, setVisible] = useState(false);

  const active = locked ?? hover;
  const activeNode = NODES.find((n) => n.id === active);
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll-triggered reveal
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

  // Close locked node when clicking outside
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
    <section id="engine" data-section="engine" className="relative py-28 md:py-36 overflow-hidden" ref={sectionRef}>
      {/* Background radial spotlight grid lines */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(18,22,31,0.6)_0%,#0A0C10_80%)] pointer-events-none" />

      <div className="container relative z-10" ref={containerRef}>
        {/* Header */}
        <div
          className={`mx-auto mb-20 max-w-3xl text-center transition duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
            02 — The engine
          </p>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-5xl lg:text-6xl">
            Five departments.{" "}
            <span className="text-gradient-green">One nervous system.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-white/60">
            Hover or tap any node to see how it works — and what it costs. Click to lock it, then
            add it to your pilot cart.
          </p>
        </div>

        {/* Network canvas */}
        <div
          className={`relative mx-auto aspect-square max-w-[600px] transition duration-1000 ease-out ${
            visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          }`}
        >
          {/* Style Injector for Radar and Drifting Animations */}
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes radar-ripple {
              0% {
                transform: translate(-50%, -50%) scale(0.85);
                opacity: 0.55;
              }
              100% {
                transform: translate(-50%, -50%) scale(2.0);
                opacity: 0;
              }
            }
            @keyframes spin-slow {
              from { transform: translate(-50%, -50%) rotate(0deg); }
              to { transform: translate(-50%, -50%) rotate(360deg); }
            }
            @keyframes spin-reverse {
              from { transform: translate(-50%, -50%) rotate(360deg); }
              to { transform: translate(-50%, -50%) rotate(0deg); }
            }
            .radar-ripple-active-1 {
              animation: radar-ripple 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
            }
            .radar-ripple-active-2 {
              animation: radar-ripple 2.4s cubic-bezier(0.16, 1, 0.3, 1) infinite;
              animation-delay: 1.2s;
            }
            .spin-radar-slow {
              animation: spin-slow 28s linear infinite;
            }
            .spin-radar-reverse {
              animation: spin-reverse 36s linear infinite;
            }
          `}} />

          {/* Technical Backdrop Grid */}
          <div 
            className="absolute inset-0 pointer-events-none rounded-full border border-white/[0.03] overflow-hidden -z-10" 
            aria-hidden
            style={{
              backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Drifting Background Glow Orbs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-full -z-10" aria-hidden>
            {/* Orb 1: Neon Emerald drifting top-left */}
            <div className="absolute top-1/4 left-1/4 h-[180px] w-[180px] rounded-full bg-[#00F0B0]/8 blur-[60px] animate-drift-1 -translate-x-1/2 -translate-y-1/2" />
            {/* Orb 2: Warm Amber drifting bottom-right */}
            <div className="absolute bottom-1/4 right-1/4 h-[180px] w-[180px] rounded-full bg-[#FFCC66]/6 blur-[60px] animate-drift-2 translate-x-1/2 translate-y-1/2" />
            {/* Orb 3: Tech Blue tracking active node */}
            <div
              className="absolute h-[160px] w-[160px] rounded-full bg-[#00A3FF]/12 blur-[50px] transition-all duration-700 ease-out -translate-x-1/2 -translate-y-1/2"
              style={{
                left: activeNode ? `${activeNode.x}%` : "50%",
                top: activeNode ? `${activeNode.y}%` : "50%",
                opacity: activeNode ? 1 : 0,
              }}
            />
          </div>

          {/* Decorative concentric background rings */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {[0, 1, 2].map((r) => (
              <span
                key={r}
                className="absolute inset-0 block rounded-full border border-white/[0.03]"
                style={{ margin: `${r * 9}%` }}
              />
            ))}
            <span className="absolute inset-[28%] block rounded-full bg-rev-green/[0.03] blur-3xl" />
          </div>

          {/* SVG lines and animations */}
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full pointer-events-none" preserveAspectRatio="none">
            <defs>
              {/* Soft glow filter for active elements */}
              <filter id="svg-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="0.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* Outer Ring Dotted Connection Guide */}
            <path
              d="M 50 12 L 84 38 L 75 82 L 25 82 L 16 38 Z"
              fill="none"
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth="0.2"
              strokeDasharray="0.6 1.2"
            />

            {/* Loop of Light Pulses Traveling Orbitally */}
            <path
              d="M 50 12 L 84 38 L 75 82 L 25 82 L 16 38 Z"
              fill="none"
              stroke="#00F0B0"
              strokeWidth="0.35"
              strokeDasharray="8 60"
              opacity="0.45"
              filter="url(#svg-glow)"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="272;0"
                dur="8s"
                repeatCount="indefinite"
              />
            </path>

            {/* Spokes to center - underlays */}
            {NODES.map((n) => (
              <line
                key={`underlay-${n.id}`}
                x1="50" y1="50"
                x2={n.x} y2={n.y}
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="0.16"
              />
            ))}

            {/* Spokes to center - glowing overlays on active */}
            {NODES.map((n) => {
              const isActive = active === n.id;
              return (
                <line
                  key={`glow-${n.id}`}
                  x1="50" y1="50"
                  x2={n.x} y2={n.y}
                  stroke="#00F0B0"
                  strokeWidth="0.5"
                  className="transition-all duration-500 ease-out"
                  style={{
                    opacity: isActive ? 1 : 0,
                    filter: "url(#svg-glow)",
                  }}
                />
              );
            })}

            {/* Flow Comets (fading trail segment pulses feeding into core) */}
            {NODES.map((n) => {
              const isActive = active === n.id;
              return (
                <g key={`comet-${n.id}`} className="transition-opacity duration-500" style={{ opacity: isActive ? 1 : 0.25 }}>
                  {/* Comet Head */}
                  <path
                    d={`M ${n.x} ${n.y} L 50 50`}
                    stroke="#00F0B0"
                    strokeWidth="0.75"
                    strokeDasharray="1.5 50"
                    strokeLinecap="round"
                    fill="none"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="51.5;0"
                      dur={isActive ? "1.2s" : "2.6s"}
                      repeatCount="indefinite"
                    />
                  </path>
                  {/* Comet Mid Tail */}
                  <path
                    d={`M ${n.x} ${n.y} L 50 50`}
                    stroke="#00F0B0"
                    strokeWidth="0.4"
                    strokeDasharray="4 50"
                    strokeDashoffset="1.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.6"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="53;1.5"
                      dur={isActive ? "1.2s" : "2.6s"}
                      repeatCount="indefinite"
                    />
                  </path>
                  {/* Comet Outer Tail */}
                  <path
                    d={`M ${n.x} ${n.y} L 50 50`}
                    stroke="#00F0B0"
                    strokeWidth="0.22"
                    strokeDasharray="8 50"
                    strokeDashoffset="5.5"
                    strokeLinecap="round"
                    fill="none"
                    opacity="0.3"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      values="57;5.5"
                      dur={isActive ? "1.2s" : "2.6s"}
                      repeatCount="indefinite"
                    />
                  </path>
                </g>
              );
            })}
          </svg>

          {/* Center core node */}
          <div className="absolute left-1/2 top-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
            {/* Outer Concentric Ticks/Notches */}
            <svg className="absolute inset-0 h-full w-full spin-radar-reverse opacity-70" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.2"
                strokeDasharray="0.5 3.5"
              />
              <circle
                cx="50"
                cy="50"
                r="41"
                fill="none"
                stroke="rgba(0, 240, 176, 0.12)"
                strokeWidth="0.8"
                strokeDasharray="8 15"
                className="spin-radar-slow"
              />
            </svg>

            {/* Inner Glassmorphic Engine Core */}
            <div className="absolute inset-[10px] rounded-full border border-white/10 bg-gradient-to-b from-[#131720] to-[#0A0C10] flex items-center justify-center shadow-[inset_0_1px_2px_rgba(255,255,255,0.06),0_8px_32px_rgba(0,0,0,0.5)]">
              {/* Pulsating core heartbeat */}
              <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(0,240,176,0.15)_0%,transparent_70%)] animate-pulse-soft" />
              
              {/* Crosshair grids */}
              <div className="absolute inset-4 border border-white/[0.03] rounded-full" />
              <div className="absolute left-1/2 top-3 bottom-3 w-px bg-white/[0.04] -translate-x-1/2" />
              <div className="absolute top-1/2 left-3 right-3 h-px bg-white/[0.04] -translate-y-1/2" />

              {/* Text Layout */}
              <div className="relative text-center z-10">
                <p className="font-mono text-[7px] uppercase tracking-[0.4em] text-[#00F0B0] opacity-80">SYS CORE</p>
                <p className="font-display text-2xl font-bold tracking-tight text-white leading-tight">Revu</p>
                <p className="font-mono text-[6px] text-white/30 tracking-widest mt-0.5">v2.4.0</p>
              </div>
            </div>
          </div>

          {/* Department nodes */}
          {NODES.map((n, idx) => {
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
                className="group absolute -translate-x-1/2 -translate-y-1/2 outline-none z-20"
                style={{
                  left: `${n.x}%`,
                  top: `${n.y}%`,
                  transitionDelay: `${idx * 60}ms`,
                }}
                aria-label={`${n.name} — ${n.desc}`}
                aria-pressed={isActive}
              >
                {/* Radar concentric dashed spinner */}
                <div
                  className={`absolute left-1/2 top-1/2 h-[74px] w-[74px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed transition-all duration-500 md:h-[84px] md:w-[84px] ${
                    isActive
                      ? "opacity-100 scale-100 border-[#00F0B0]/60 spin-radar-slow"
                      : "opacity-0 scale-90 group-hover:opacity-40 group-hover:scale-95 group-hover:border-white/30 spin-radar-slow"
                  }`}
                />

                {/* Radar Ripples */}
                {isActive && (
                  <>
                    <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F0B0]/40 pointer-events-none radar-ripple-active-1 md:h-16 md:w-16 md:-translate-x-1/2 md:-translate-y-1/2" />
                    <div className="absolute left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#00F0B0]/30 pointer-events-none radar-ripple-active-2 md:h-16 md:w-16 md:-translate-x-1/2 md:-translate-y-1/2" />
                  </>
                )}

                {/* Inner Icon Circle Container */}
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500 md:h-16 md:w-16 bg-gradient-to-b from-[#12161F]/90 to-[#0A0C10]/95 shadow-[0_4px_16px_rgba(0,0,0,0.4)] ${
                    isActive
                      ? "border-[#00F0B0]/60 shadow-[0_0_20px_rgba(0,240,176,0.15),inset_0_1px_0_rgba(255,255,255,0.1)]"
                      : "border-white/10 group-hover:border-white/30 group-hover:shadow-[0_0_12px_rgba(255,255,255,0.06)]"
                  }`}
                >
                  {/* Microscopic node index */}
                  <span className="absolute top-1.5 right-1.5 font-mono text-[7px] text-white/35 scale-90 pointer-events-none select-none">
                    {`0${idx + 1}`}
                  </span>

                  {/* Microscopic status indicator */}
                  <span className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 font-mono text-[6px] tracking-wider transition-colors duration-300 scale-90 pointer-events-none select-none ${isActive ? "text-[#00F0B0] font-bold" : "text-white/20"}`}>
                    {isActive ? "LNKD" : "STBY"}
                  </span>

                  <Icon
                    className={`h-4.5 w-4.5 transition-colors duration-300 md:h-5.5 md:w-5.5 ${
                      isActive ? "text-[#00F0B0]" : "text-white/70 group-hover:text-white"
                    }`}
                  />
                </span>

                {/* Label below node */}
                <span
                  className={`absolute left-1/2 mt-3.5 -translate-x-1/2 whitespace-nowrap text-[9.5px] uppercase tracking-[0.2em] transition-colors duration-300 md:text-[10.5px] ${
                    isActive ? "text-[#00F0B0]" : "text-white/50 group-hover:text-white/80"
                  }`}
                  style={{ top: "100%" }}
                >
                  {n.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Detail panel */}
        <div
          className={`mx-auto mt-16 max-w-3xl transition duration-700 ease-out delay-200 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <div
            className={`relative overflow-hidden rounded-2xl border bg-[#0C0F14]/65 p-6 md:p-8 backdrop-blur-md transition-all duration-500 ${
              active ? "border-[#00F0B0]/30 shadow-[0_0_30px_rgba(0,240,176,0.06)]" : "border-white/[0.06]"
            }`}
            style={{ minHeight: 160 }}
          >
            {/* HUD Corner Brackets */}
            <div className={`absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 transition-colors duration-500 ${active ? "border-[#00F0B0]/60" : "border-white/15"}`} />
            <div className={`absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 transition-colors duration-500 ${active ? "border-[#00F0B0]/60" : "border-white/15"}`} />
            <div className={`absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 transition-colors duration-500 ${active ? "border-[#00F0B0]/60" : "border-white/15"}`} />
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 transition-colors duration-500 ${active ? "border-[#00F0B0]/60" : "border-white/15"}`} />

            {/* Hairline top glow when active */}
            {active && (
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline-green" aria-hidden />
            )}

            {/* Status Telemetry Badge */}
            <div className="absolute top-4 right-5 flex items-center gap-2 pointer-events-none select-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${active ? "bg-[#00F0B0]" : "bg-white/30"}`} />
                <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${active ? "bg-[#00F0B0]" : "bg-white/30"}`} />
              </span>
              <span className="font-mono text-[7.5px] uppercase tracking-[0.25em] text-white/40">
                {active ? "Module Linked" : "System Ready"}
              </span>
            </div>

            {active ? (
              <ActiveDetail node={NODES.find((n) => n.id === active)!} />
            ) : (
              <div className="flex h-full min-h-[96px] flex-col items-center justify-center py-4 text-center">
                <p className="font-mono text-[9.5px] uppercase tracking-[0.3em] text-[#00F0B0] opacity-50 mb-2">SYSTEM INTERACTION PENDING</p>
                <p className="text-[13px] text-white/40 max-w-md leading-relaxed">
                  Hover a department node to inspect details — click to lock. Add modules directly to your pilot cart.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ActiveDetail({ node }: { node: Node }) {
  return (
    <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center w-full min-h-[96px]">
      {/* Main info */}
      <div className="flex-1 flex flex-col justify-center text-left">
        <span className="mb-1 font-mono text-[9px] uppercase tracking-[0.3em] text-[#00F0B0] flex items-center gap-1.5">
          <span className="inline-block h-1 w-1 bg-[#00F0B0] rounded-full animate-pulse-soft" />
          {node.short} // {`0${NODES.findIndex(n => n.id === node.id) + 1}`}
        </span>
        <h3 className="font-display text-2xl font-bold tracking-tight text-white">{node.name}</h3>
        <p className="mt-2 text-[13.5px] leading-relaxed text-white/50 max-w-xl">{node.desc}</p>
      </div>

      {/* Price & Action */}
      <div className="flex w-full items-center justify-between gap-6 md:w-auto md:flex-col md:items-end border-t border-white/[0.06] pt-4 md:border-t-0 md:pt-0">
        <div className="text-left md:text-right">
          <p className="font-display text-xl font-semibold tabular-nums text-[#FFCC66] whitespace-nowrap">
            {node.priceLabel}
          </p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.22em] text-white/40 whitespace-nowrap">
            {node.unitNote}
          </p>
        </div>
        <div className="w-full flex md:justify-end">
          <ServiceAddButton service={node.service} />
        </div>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";

function useCountUp(target: number | [number, number], active: boolean, duration = 1200) {
  const [value, setValue] = useState<number | [number, number]>(() => 
    Array.isArray(target) ? [0, 0] : 0
  );

  useEffect(() => {
    if (!active) {
      setValue(Array.isArray(target) ? [0, 0] : 0);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      
      setValue(() => {
        if (Array.isArray(target)) {
          return [
            Math.round(target[0] * eased),
            Math.round(target[1] * eased),
          ];
        }
        return Math.round(target * eased);
      });

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}

type TabType = "revu" | "industry" | "current";

interface SimulationData {
  days: number;
  daysSaved: number;
  fasterTurnover: number;
  extraCars: number | [number, number];
  monthlyProfit: number | [number, number];
  turns: string;
  holdingCost: string;
  velocityIndex: string;
  exposure: string;
  description: string;
  status: string;
  color: string;
  glowColor: string;
}

const SIMULATION_DATA: Record<TabType, SimulationData> = {
  revu: {
    days: 42,
    daysSaved: 22,
    fasterTurnover: 34,
    extraCars: [5, 10],
    monthlyProfit: [15000, 25000],
    turns: "8.7x / year",
    holdingCost: "$1 344 / cycle",
    velocityIndex: "1.5x (Optimal)",
    exposure: "Minimal Floor Expense",
    description: "Revu accelerates turnover to 42 days, unlocking maximum cash velocity and compounding dealer profit with $0 in fixed subscription fees.",
    status: "Peak Efficiency",
    color: "#00F0B0",
    glowColor: "rgba(0, 240, 176, 0.4)",
  },
  industry: {
    days: 55,
    daysSaved: 9,
    fasterTurnover: 14,
    extraCars: 2,
    monthlyProfit: 3200,
    turns: "6.6x / year",
    holdingCost: "$1 760 / cycle",
    velocityIndex: "1.2x (Average)",
    exposure: "Moderate depreciation risk",
    description: "Standard industry pace. Capital sits longer, vulnerable to auction fees, inventory aging, and retail margin compression.",
    status: "Baseline Standard",
    color: "#FFCC66",
    glowColor: "rgba(255, 204, 102, 0.4)",
  },
  current: {
    days: 64,
    daysSaved: 0,
    fasterTurnover: 0,
    extraCars: 0,
    monthlyProfit: 0,
    turns: "5.7x / year",
    holdingCost: "$2 048 / cycle",
    velocityIndex: "1.0x (Slowest)",
    exposure: "High interest & depreciation risk",
    description: "Capital remains trapped in steel for 64 days, causing high floor cost exposure, stale lot syndrome, and lost retail opportunities.",
    status: "Capital Locked",
    color: "#FF4D4D",
    glowColor: "rgba(255, 77, 77, 0.4)",
  },
};

const TAB_DETAILS: Record<TabType, { saved: string; turnover: string; extra: string; profit: string }> = {
  revu: {
    saved: "22 days saved per car on average lot time",
    turnover: "34% faster capital recycling velocity",
    extra: "Based on 5 to 10 additional sales turns per month",
    profit: "Incremental profit at $2,500 average target margin",
  },
  industry: {
    saved: "9 days saved per car on average lot time",
    turnover: "14% faster capital recycling velocity",
    extra: "Based on 2 additional sales turns per month",
    profit: "Incremental profit at $2,100 average margin",
  },
  current: {
    saved: "Baseline turnaround pace (64 days)",
    turnover: "Standard inventory aging speed",
    extra: "No volume optimization enabled",
    profit: "No additional margin lift generated",
  },
};

export default function ProblemInsight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("revu");
  const [hoveredNode, setHoveredNode] = useState<TabType | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeData = useMemo(() => SIMULATION_DATA[activeTab], [activeTab]);

  const stats = useMemo(
    () => [
      { 
        key: "saved" as const,
        target: activeData.daysSaved, 
        label: "SAVED PER CAR", 
        color: activeTab === "current" ? "rgba(255,255,255,0.3)" : SIMULATION_DATA[activeTab].color,
      },
      { 
        key: "turnover" as const,
        target: activeData.fasterTurnover, 
        prefix: "-", 
        suffix: "%", 
        label: "FASTER TURNOVER", 
        color: activeTab === "current" ? "rgba(255,255,255,0.3)" : "#FFCC66",
      },
      { 
        key: "extra" as const,
        target: activeData.extraCars, 
        prefix: "+", 
        label: "EXTRA CARS / MONTH", 
        color: activeTab === "current" ? "rgba(255,255,255,0.3)" : SIMULATION_DATA[activeTab].color,
      },
      {
        key: "profit" as const,
        target: activeData.monthlyProfit,
        prefix: "$",
        label: "ADDITIONAL MONTHLY PROFIT",
        color: activeTab === "current" ? "rgba(255,255,255,0.3)" : "#FFD966",
        format: (value: number) => {
          if (value === 0) return "0";
          if (value % 1000 === 0) return `${value / 1000}k`;
          return `${(value / 1000).toFixed(1)}k`;
        },
      },
    ],
    [activeTab, activeData]
  );

  // Dynamic arc coordinates based on current active tab
  const arcPath = useMemo(() => {
    if (activeTab === "revu") {
      // Curve from Current (390, 80) to Revu (170, 80)
      return "M 390 80 A 110 50 0 0 0 170 80";
    }
    if (activeTab === "industry") {
      // Curve from Current (390, 80) to Industry (300, 80)
      return "M 390 80 A 45 20 0 0 0 300 80";
    }
    // Static flat spot if current
    return "M 390 80 L 390 80";
  }, [activeTab]);

  return (
    <section className="bg-[#0A0C10] py-24 px-6 md:px-8 border-t border-white/[0.04] relative overflow-hidden z-10" ref={containerRef}>
      
      {/* ─── AESTHETIC BACKGROUND ELEMENTS ─── */}
      {/* 1. Dual-Layer Technical Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none -z-10" />
      
      {/* 2. Floating Ambient Glow Orbs (Drifts slowly in background) */}
      <div className="absolute -left-40 top-12 h-[550px] w-[550px] rounded-full bg-[#00F0B0]/[0.02] blur-[145px] pointer-events-none -z-10 animate-drift-1" />
      <div className="absolute -right-40 bottom-12 h-[550px] w-[550px] rounded-full bg-[#FFCC66]/[0.015] blur-[145px] pointer-events-none -z-10 animate-drift-2" />
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full blur-[120px] pointer-events-none -z-10 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${activeData.color}12, transparent 70%)`,
        }}
      />
      
      {/* 3. Dynamic radial spotlight locked to active color */}
      <div 
        className="pointer-events-none absolute left-1/3 top-1/2 -translate-y-1/2 -z-10 h-[500px] w-[700px] rounded-full opacity-[0.015] blur-3xl transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse, ${activeData.color}, transparent 70%)`,
        }}
      />

      {/* 4. Fine tactile noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.015] pointer-events-none -z-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />
      
      <div className="mx-auto max-w-[1200px] relative">
        {/* Section Header - High-end Full Width Spacing */}
        <div className={`mb-12 max-w-2xl transition-all duration-1000 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-[#00F0B0] mb-3 block">
            02 — Cash Velocity
          </span>
          <h2 className="font-display text-4xl font-semibold leading-[1.15] tracking-tight text-white md:text-5xl">
            Cash velocity,{" "}
            <span className="bg-gradient-to-r from-[#00F0B0] to-[#FFCC66] bg-clip-text text-transparent">
              visualized
            </span>
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-white/60">
            Interactive timeline simulator. Contrast how Revu accelerates days to sell, reduces floor risk, and accelerates capital recyclability.
          </p>
        </div>

        {/* Main Grid - Perfect Spacing */}
        <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] items-stretch">
          
          {/* Left Column: Interactive Widget */}
          <div className={`transition-all duration-1000 ease-out delay-75 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="rounded-[24px] border border-white/[0.08] bg-[#101217]/45 p-6 md:p-8 shadow-[0_24px_50px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.025)] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between h-full">
              <div className="absolute inset-0 bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
              
              {/* Top Selector Tabs */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-black/45 rounded-2xl border border-white/[0.03] mb-6">
                {(["current", "industry", "revu"] as TabType[]).map((tab) => {
                  const isActive = activeTab === tab;
                  const tabData = SIMULATION_DATA[tab];
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`relative py-3 rounded-xl text-center transition-all duration-300 ${
                        isActive 
                          ? "text-white font-semibold" 
                          : "text-white/45 hover:text-white/80 hover:bg-white/[0.01]"
                      }`}
                    >
                      {isActive && (
                        <div 
                          className="absolute inset-0 rounded-xl transition-all duration-300"
                          style={{
                            background: "rgba(255, 255, 255, 0.04)",
                            border: `1px solid ${tabData.color}25`,
                            boxShadow: `0 4px 15px -3px ${tabData.color}10`,
                          }}
                        />
                      )}
                      <span className="relative z-10 block text-[9px] md:text-[10px] uppercase tracking-wider">
                        {tab === "current" ? "You (Current)" : tab === "industry" ? "Industry Avg" : "Revu Target"}
                      </span>
                      <span 
                        className="relative z-10 block font-display text-[13px] md:text-[14px] font-bold mt-0.5 transition-colors duration-300"
                        style={{ color: isActive ? tabData.color : "inherit" }}
                      >
                        {tabData.days} Days
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* RULER / TIMELINE VISUALIZER */}
              <div className="relative py-6 px-2 bg-black/25 rounded-2xl border border-white/[0.03] overflow-visible">
                {/* SVG Visualizer */}
                <svg viewBox="0 0 500 160" className="w-full h-auto overflow-visible" aria-hidden="true">
                  <defs>
                    <linearGradient id="grid-fade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgba(255, 255, 255, 0.01)" />
                      <stop offset="50%" stopColor="rgba(255, 255, 255, 0.04)" />
                      <stop offset="100%" stopColor="rgba(255, 255, 255, 0.01)" />
                    </linearGradient>
                    
                    {/* SVG Glow Filters */}
                    <filter id="glow-revu" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-industry" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="glow-current" x="-40%" y="-40%" width="180%" height="180%">
                      <feGaussianBlur stdDeviation="5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>

                    {/* Arc Gradients */}
                    <linearGradient id="arc-gradient-revu" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stopColor="#FF4D4D" />
                      <stop offset="60%" stopColor="#FFCC66" />
                      <stop offset="100%" stopColor="#00F0B0" />
                    </linearGradient>
                    <linearGradient id="arc-gradient-industry" x1="1" y1="0" x2="0" y2="0">
                      <stop offset="0%" stopColor="#FF4D4D" />
                      <stop offset="100%" stopColor="#FFCC66" />
                    </linearGradient>
                  </defs>

                  <style>{`
                    .timeline-label {
                      font-size: 7.5px;
                      font-weight: 700;
                      letter-spacing: 0.12em;
                      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .timeline-value {
                      font-size: 11px;
                      font-weight: 800;
                      font-family: 'Space Grotesk', sans-serif;
                      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    .timeline-tick-text {
                      font-size: 7px;
                      font-weight: 700;
                      font-family: 'Space Grotesk', sans-serif;
                      fill: rgba(255, 255, 255, 0.18);
                    }
                    .timeline-badge-text {
                      font-size: 7px;
                      font-weight: 700;
                      letter-spacing: 0.05em;
                    }
                    .svg-interactive-node {
                      transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
                    }
                    @media (max-width: 640px) {
                      .timeline-label { font-size: 6px; }
                      .timeline-value { font-size: 8.5px; }
                      .timeline-tick-text { font-size: 6px; }
                      .timeline-badge-text { font-size: 6px; }
                    }
                  `}</style>

                  {/* Scientific background grids at 5-day intervals */}
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                    const x = 50 + (i / 8) * 400;
                    return (
                      <line
                        key={i}
                        x1={x}
                        y1="40"
                        x2={x}
                        y2="120"
                        stroke="url(#grid-fade)"
                        strokeWidth="1"
                      />
                    );
                  })}

                  {/* Axis track rail */}
                  <rect x="50" y="79" width="400" height="2" rx="1" fill="rgba(255, 255, 255, 0.06)" />

                  {/* Inner rail glow when active */}
                  {activeTab !== "current" && (
                    <line 
                      x1={activeTab === "revu" ? "170" : "300"} 
                      y1="80" 
                      x2="390" 
                      y2="80" 
                      stroke={activeData.color} 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      className="opacity-25"
                    />
                  )}

                  {/* Tick labels at 10-day intervals along the bottom of the grid */}
                  {[0, 2, 4, 6, 8].map((i) => {
                    const x = 50 + (i / 8) * 400;
                    return (
                      <text
                        key={i}
                        x={x}
                        y="114"
                        className="timeline-tick-text"
                        textAnchor="middle"
                      >
                        {30 + i * 5}d
                      </text>
                    );
                  })}

                  {/* Dynamic Arc linking Current to active benchmark */}
                  {activeTab !== "current" && (
                    <>
                      {/* 1. Underlying ambient track glow */}
                      <path
                        d={arcPath}
                        fill="none"
                        stroke={activeData.color}
                        strokeWidth="5"
                        strokeLinecap="round"
                        className="opacity-[0.06]"
                        filter={`url(#glow-${activeTab})`}
                      />

                      {/* 2. Sharp gradient guide rail */}
                      <path
                        id="active-arc"
                        d={arcPath}
                        pathLength="100"
                        fill="none"
                        stroke={`url(#arc-gradient-${activeTab})`}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        className="opacity-20"
                      />

                      {/* 3. Continuous micro-pulse flow dots */}
                      <path
                        d={arcPath}
                        fill="none"
                        stroke={activeData.color}
                        strokeWidth="1.2"
                        strokeDasharray="2 6"
                        strokeLinecap="round"
                        className="opacity-35"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="0; -16"
                          dur="1.5s"
                          repeatCount="indefinite"
                        />
                      </path>

                      {/* 4. Tapered Solid Comet Trail (Non-Fragmented) */}
                      {/* Comet Outer Glow Trail */}
                      <path
                        d={arcPath}
                        pathLength="100"
                        fill="none"
                        stroke={activeData.color}
                        strokeWidth="4"
                        strokeDasharray="24 76"
                        strokeLinecap="round"
                        className="opacity-[0.22]"
                        filter={`url(#glow-${activeTab})`}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="24; -76"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </path>

                      {/* Comet Medium Core Glow */}
                      <path
                        d={arcPath}
                        pathLength="100"
                        fill="none"
                        stroke={activeData.color}
                        strokeWidth="2.2"
                        strokeDasharray="20 80"
                        strokeLinecap="round"
                        className="opacity-[0.6]"
                        filter={`url(#glow-${activeTab})`}
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="20; -80"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </path>

                      {/* Comet Sharp Core Leader (White-Hot Core) */}
                      <path
                        d={arcPath}
                        pathLength="100"
                        fill="none"
                        stroke="#FFFFFF"
                        strokeWidth="1.2"
                        strokeDasharray="10 90"
                        strokeLinecap="round"
                        className="opacity-[0.95]"
                      >
                        <animate
                          attributeName="stroke-dashoffset"
                          values="10; -90"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </path>

                      {/* 5. Leading Spark Group */}
                      <g>
                        <animateMotion dur="2.4s" repeatCount="indefinite">
                          <mpath href="#active-arc" />
                        </animateMotion>
                        {/* Outer halo spark */}
                        <circle cx="0" cy="0" r="5" fill={activeData.color} opacity="0" filter={`url(#glow-${activeTab})`}>
                          <animate attributeName="opacity" values="0;0.5" dur="0.1s" fill="freeze" />
                        </circle>
                        {/* Core white spark */}
                        <circle cx="0" cy="0" r="2" fill="#FFFFFF" opacity="0">
                          <animate attributeName="opacity" values="0;0.95" dur="0.1s" fill="freeze" />
                        </circle>
                      </g>
                    </>
                  )}

                  {/* CONNECTOR AXIS GUIDES (Laser Guides) */}
                  {/* Revu target (Above) */}
                  <line 
                    x1="170" 
                    y1="80" 
                    x2="170" 
                    y2="45" 
                    stroke={activeTab === "revu" ? "#00F0B0" : "rgba(255,255,255,0.06)"} 
                    strokeWidth={activeTab === "revu" ? "1.5" : "1"} 
                    strokeDasharray={activeTab === "revu" ? "3 1" : "2 2"} 
                    className="transition-all duration-500"
                    style={{ opacity: activeTab === "revu" ? 0.8 : 0.25 }}
                  />
                  {/* Industry avg (Below) */}
                  <line 
                    x1="300" 
                    y1="80" 
                    x2="300" 
                    y2="115" 
                    stroke={activeTab === "industry" ? "#FFCC66" : "rgba(255,255,255,0.06)"} 
                    strokeWidth={activeTab === "industry" ? "1.5" : "1"} 
                    strokeDasharray={activeTab === "industry" ? "3 1" : "2 2"} 
                    className="transition-all duration-500"
                    style={{ opacity: activeTab === "industry" ? 0.8 : 0.25 }}
                  />
                  {/* You Current (Above) */}
                  <line 
                    x1="390" 
                    y1="80" 
                    x2="390" 
                    y2="45" 
                    stroke={activeTab === "current" ? "#FF4D4D" : "rgba(255,255,255,0.06)"} 
                    strokeWidth={activeTab === "current" ? "1.5" : "1"} 
                    strokeDasharray={activeTab === "current" ? "3 1" : "2 2"} 
                    className="transition-all duration-500"
                    style={{ opacity: activeTab === "current" ? 0.8 : 0.25 }}
                  />

                  {/* NODES & LABELS */}
                  
                  {/* 1. Revu Target (42 days) */}
                  <g 
                    className="cursor-pointer svg-interactive-node" 
                    onClick={() => setActiveTab("revu")}
                    onMouseEnter={() => setHoveredNode("revu")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {activeTab === "revu" && (
                      <>
                        <circle cx="170" cy="80" r="5" fill="none" stroke="#00F0B0" strokeWidth="1.5">
                          <animate attributeName="r" values="5;22" dur="2.4s" repeatCount="indefinite" begin="0s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="0s" />
                        </circle>
                        <circle cx="170" cy="80" r="5" fill="none" stroke="#00F0B0" strokeWidth="1.2">
                          <animate attributeName="r" values="5;22" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                        </circle>
                      </>
                    )}
                    {/* Rotating Concentric Outer Ring */}
                    <circle
                      cx="170"
                      cy="80"
                      r={activeTab === "revu" ? 12 : 8}
                      fill="none"
                      stroke={activeTab === "revu" ? "#00F0B0" : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className={`transition-all duration-500 ${activeTab === "revu" ? "animate-rotate-slow" : ""}`}
                      style={{
                        transformOrigin: "170px 80px",
                        opacity: activeTab === "revu" || hoveredNode === "revu" ? 0.95 : 0.4
                      }}
                    />
                    {/* Glowing background aura */}
                    <circle
                      cx="170"
                      cy="80"
                      r="8"
                      fill={activeTab === "revu" ? "#00F0B0" : "transparent"}
                      className="transition-all duration-500"
                      style={{
                        opacity: activeTab === "revu" ? 0.2 : 0,
                        filter: "blur(4px)"
                      }}
                    />
                    {/* Core node center */}
                    <circle 
                      cx="170" 
                      cy="80" 
                      r={activeTab === "revu" ? 5 : 3.5} 
                      fill={activeTab === "revu" ? "#00F0B0" : "rgba(255,255,255,0.25)"} 
                      className="transition-all duration-500"
                    />
                    <text 
                      x="170" 
                      y="22" 
                      fill={activeTab === "revu" ? "#00F0B0" : (hoveredNode === "revu" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)")} 
                      textAnchor="middle"
                      className="timeline-label"
                      style={{
                        transform: hoveredNode === "revu" ? "translateY(-1px)" : "translateY(0)"
                      }}
                    >
                      REVU TARGET
                    </text>
                    <text 
                      x="170" 
                      y="35" 
                      fill={activeTab === "revu" ? "#FFFFFF" : (hoveredNode === "revu" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)")} 
                      textAnchor="middle"
                      className="timeline-value"
                    >
                      42 DAYS
                    </text>
                    {/* Hit box */}
                    <circle cx="170" cy="80" r="28" fill="transparent" />
                  </g>

                  {/* 2. Industry Average (55 days) */}
                  <g 
                    className="cursor-pointer svg-interactive-node" 
                    onClick={() => setActiveTab("industry")}
                    onMouseEnter={() => setHoveredNode("industry")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {activeTab === "industry" && (
                      <>
                        <circle cx="300" cy="80" r="4.5" fill="none" stroke="#FFCC66" strokeWidth="1.5">
                          <animate attributeName="r" values="4.5;20" dur="2.4s" repeatCount="indefinite" begin="0s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="0s" />
                        </circle>
                        <circle cx="300" cy="80" r="4.5" fill="none" stroke="#FFCC66" strokeWidth="1.2">
                          <animate attributeName="r" values="4.5;20" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                        </circle>
                      </>
                    )}
                    {/* Rotating Concentric Outer Ring */}
                    <circle
                      cx="300"
                      cy="80"
                      r={activeTab === "industry" ? 10 : 7.5}
                      fill="none"
                      stroke={activeTab === "industry" ? "#FFCC66" : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className={`transition-all duration-500 ${activeTab === "industry" ? "animate-rotate-slow" : ""}`}
                      style={{
                        transformOrigin: "300px 80px",
                        opacity: activeTab === "industry" || hoveredNode === "industry" ? 0.95 : 0.4
                      }}
                    />
                    {/* Glowing background aura */}
                    <circle
                      cx="300"
                      cy="80"
                      r="7.5"
                      fill={activeTab === "industry" ? "#FFCC66" : "transparent"}
                      className="transition-all duration-500"
                      style={{
                        opacity: activeTab === "industry" ? 0.2 : 0,
                        filter: "blur(4px)"
                      }}
                    />
                    {/* Core node center */}
                    <circle 
                      cx="300" 
                      cy="80" 
                      r={activeTab === "industry" ? 4.5 : 3} 
                      fill={activeTab === "industry" ? "#FFCC66" : "rgba(255,255,255,0.25)"} 
                      className="transition-all duration-500"
                    />
                    <text 
                      x="300" 
                      y="131" 
                      fill={activeTab === "industry" ? "#FFCC66" : (hoveredNode === "industry" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)")} 
                      textAnchor="middle"
                      className="timeline-label"
                      style={{
                        transform: hoveredNode === "industry" ? "translateY(1px)" : "translateY(0)"
                      }}
                    >
                      INDUSTRY AVG
                    </text>
                    <text 
                      x="300" 
                      y="144" 
                      fill={activeTab === "industry" ? "#FFFFFF" : (hoveredNode === "industry" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)")} 
                      textAnchor="middle"
                      className="timeline-value"
                    >
                      55 DAYS
                    </text>
                    {/* Hit box */}
                    <circle cx="300" cy="80" r="24" fill="transparent" />
                  </g>

                  {/* 3. You Current (64 days) */}
                  <g 
                    className="cursor-pointer svg-interactive-node" 
                    onClick={() => setActiveTab("current")}
                    onMouseEnter={() => setHoveredNode("current")}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    {activeTab === "current" && (
                      <>
                        <circle cx="390" cy="80" r="5" fill="none" stroke="#FF4D4D" strokeWidth="1.5">
                          <animate attributeName="r" values="5;22" dur="2.4s" repeatCount="indefinite" begin="0s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="0s" />
                        </circle>
                        <circle cx="390" cy="80" r="5" fill="none" stroke="#FF4D4D" strokeWidth="1.2">
                          <animate attributeName="r" values="5;22" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                        </circle>
                      </>
                    )}
                    {/* Rotating Concentric Outer Ring */}
                    <circle
                      cx="390"
                      cy="80"
                      r={activeTab === "current" ? 12 : 8}
                      fill="none"
                      stroke={activeTab === "current" ? "#FF4D4D" : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className={`transition-all duration-500 ${activeTab === "current" ? "animate-rotate-slow" : ""}`}
                      style={{
                        transformOrigin: "390px 80px",
                        opacity: activeTab === "current" || hoveredNode === "current" ? 0.95 : 0.4
                      }}
                    />
                    {/* Glowing background aura */}
                    <circle
                      cx="390"
                      cy="80"
                      r="8"
                      fill={activeTab === "current" ? "#FF4D4D" : "transparent"}
                      className="transition-all duration-500"
                      style={{
                        opacity: activeTab === "current" ? 0.2 : 0,
                        filter: "blur(4px)"
                      }}
                    />
                    {/* Core node center */}
                    <circle 
                      cx="390" 
                      cy="80" 
                      r={activeTab === "current" ? 5 : 3.5} 
                      fill={activeTab === "current" ? "#FF4D4D" : "rgba(255,255,255,0.25)"} 
                      className="transition-all duration-500"
                    />
                    <text 
                      x="390" 
                      y="22" 
                      fill={activeTab === "current" ? "#FF4D4D" : (hoveredNode === "current" ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)")} 
                      textAnchor="middle"
                      className="timeline-label"
                      style={{
                        transform: hoveredNode === "current" ? "translateY(-1px)" : "translateY(0)"
                      }}
                    >
                      YOU (CURRENT)
                    </text>
                    <text 
                      x="390" 
                      y="35" 
                      fill={activeTab === "current" ? "#FFFFFF" : (hoveredNode === "current" ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.45)")} 
                      textAnchor="middle"
                      className="timeline-value"
                    >
                      64 DAYS
                    </text>
                    {/* Hit box */}
                    <circle cx="390" cy="80" r="28" fill="transparent" />
                  </g>

                  {/* Dynamic Arc Savings Badge (Positioned at exact arc peak) */}
                  {activeTab !== "current" && (
                    <g transform={`translate(${activeTab === "revu" ? 280 : 345}, ${activeTab === "revu" ? 30 : 60})`}>
                      <rect 
                        x="-38" 
                        y="-8.5" 
                        width="76" 
                        height="17" 
                        rx="5" 
                        fill="#0A0C10" 
                        fillOpacity="0.85"
                        stroke={activeData.color} 
                        strokeWidth="1" 
                        className="opacity-95"
                        style={{ filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.5))" }}
                      />
                      <text 
                        x="0" 
                        y="2.5" 
                        fill={activeData.color} 
                        textAnchor="middle"
                        className="timeline-badge-text font-bold"
                      >
                        SAVED {activeData.daysSaved} DAYS
                      </text>
                    </g>
                  )}
                </svg>
              </div>

              {/* DYNAMIC ANALYSIS REPORT (Interactive feedback) */}
              <div className="mt-8 pt-6 border-t border-white/[0.04]">
                {/* Header Row: Muted impact tag on left, Dynamic Badge on right */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-white/35 uppercase block">Simulation Impact</span>
                    <h4 className="text-white font-semibold text-[14.5px] mt-1">
                      {activeData.status}
                    </h4>
                  </div>
                  <span 
                    className="text-[10px] font-bold px-3 py-1 rounded-full border bg-black/20 tracking-wider transition-all duration-300"
                    style={{ 
                      color: activeData.color,
                      borderColor: `${activeData.color}25`,
                      boxShadow: `0 0 10px ${activeData.color}05`
                    }}
                  >
                    {activeData.days} Days to Sell
                  </span>
                </div>

                <p className="text-[13.5px] leading-relaxed text-white/60 min-h-[50px] transition-all duration-300">
                  {activeData.description}
                </p>

                {/* Sub-grid of performance indices */}
                <div className="grid grid-cols-3 gap-3 mt-6">
                  {[
                    { label: "Turns / Year", value: activeData.turns },
                    { label: "Floor Expense", value: activeData.holdingCost },
                    { label: "Velocity Index", value: activeData.velocityIndex },
                  ].map((item, idx) => (
                    <div 
                      key={idx} 
                      className="rounded-xl border border-white/[0.03] bg-black/15 p-3 flex flex-col justify-between hover:border-white/[0.08] hover:bg-black/25 transition-all duration-300"
                    >
                      <span className="text-[8px] md:text-[9px] font-bold text-white/35 uppercase tracking-wider block mb-1">
                        {item.label}
                      </span>
                      <span className="font-display text-[12px] md:text-[13px] font-bold text-white leading-none">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Performance Stats Cards */}
          <div className={`transition-all duration-1000 ease-out delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 h-full">
              {stats.map((stat) => (
                <StatCard 
                  key={stat.label}
                  statKey={stat.key}
                  target={stat.target}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  label={stat.label}
                  color={stat.color}
                  format={stat.format}
                  active={isVisible} 
                  currentTab={activeTab} 
                  detail={TAB_DETAILS[activeTab][stat.key]}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

interface StatCardProps {
  statKey: "saved" | "turnover" | "extra" | "profit";
  target: number | [number, number];
  prefix?: string;
  suffix?: string;
  label: string;
  color: string;
  format?: (value: number) => string;
  active: boolean;
  currentTab: TabType;
  detail: string;
}

function StatCard({ 
  statKey,
  target, 
  prefix = "", 
  suffix = "", 
  label, 
  color, 
  format, 
  active,
  currentTab,
  detail
}: StatCardProps) {
  const value = useCountUp(target, active, 1300);
  
  const displayValue = useMemo(() => {
    if (Array.isArray(target)) {
      const valArray = Array.isArray(value) ? value : [value, value];
      const formattedMin = format ? format(valArray[0]) : valArray[0].toString();
      const formattedMax = format ? format(valArray[1]) : valArray[1].toString();
      
      return `${prefix}${formattedMin}–${formattedMax}${suffix}`;
    } else {
      const valNum = Array.isArray(value) ? value[0] : value;
      const formatted = format ? format(valNum) : valNum.toString();
      return `${prefix}${formatted}${suffix}`;
    }
  }, [value, target, prefix, suffix, format]);

  const [isHovered, setIsHovered] = useState(false);

  // High-end dark glassmorphic styling
  const tabStyles = useMemo(() => {
    if (currentTab === "current") {
      return {
        shadow: "rgba(255, 77, 77, 0)",
        border: "border-white/[0.04] hover:border-white/[0.1]",
        bg: "bg-white/[0.005]",
      };
    }
    const glowCol = currentTab === "industry" ? "rgba(255, 204, 102, 0.06)" : "rgba(0, 240, 176, 0.06)";
    const hoverBorder = currentTab === "industry" ? "hover:border-[#FFCC66]/25" : "hover:border-[#00F0B0]/25";
    return {
      shadow: glowCol,
      border: `border-white/[0.04] ${hoverBorder}`,
      bg: "bg-white/[0.015]",
    };
  }, [currentTab]);

  const renderMicroGraphic = (key: string, strokeColor: string, isHovered: boolean) => {
    const activeColor = currentTab === "current" ? "rgba(255, 255, 255, 0.3)" : strokeColor;
    switch(key) {
      case "saved":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-transform duration-700" style={{ transform: isHovered && currentTab !== "current" ? "rotate(-90deg)" : "rotate(0deg)" }}>
            <circle cx="12" cy="12" r="9" stroke={activeColor} strokeWidth="1.5" strokeDasharray="3 3" className="opacity-40" />
            <circle cx="12" cy="12" r="9" stroke={activeColor} strokeWidth="1.8" strokeDasharray="18 40" strokeLinecap="round" />
            <path d="M 12 12 L 12 7" stroke={activeColor} strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 12 12 L 15.5 12" stroke={activeColor} strokeWidth="1.5" strokeLinecap="round" className="opacity-75" />
          </svg>
        );
      case "turnover":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-transform duration-500" style={{ transform: isHovered && currentTab !== "current" ? "translateX(-2px)" : "translateX(0px)" }}>
            <path d="M 16 6 L 10 12 L 16 18" stroke={activeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 10 6 L 4 12 L 10 18" stroke={activeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" />
          </svg>
        );
      case "extra":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-transform duration-500" style={{ transform: isHovered && currentTab !== "current" ? "scale(1.15)" : "scale(1)" }}>
            <rect x="4" y="4" width="6" height="6" rx="1.5" stroke={activeColor} strokeWidth="1.5" fill={isHovered && currentTab !== "current" ? `${activeColor}15` : "transparent"} className="transition-all duration-300" />
            <rect x="14" y="4" width="6" height="6" rx="1.5" stroke={activeColor} strokeWidth="1.5" fill={isHovered && currentTab !== "current" ? `${activeColor}15` : "transparent"} className="transition-all duration-300" />
            <rect x="4" y="14" width="6" height="6" rx="1.5" stroke={activeColor} strokeWidth="1.5" fill={isHovered && currentTab !== "current" ? `${activeColor}15` : "transparent"} className="transition-all duration-300" />
            <rect x="14" y="14" width="6" height="6" rx="1.5" stroke={activeColor} strokeWidth="1.8" fill={activeColor} />
          </svg>
        );
      case "profit":
        return (
          <svg width="30" height="18" viewBox="0 0 32 20" fill="none">
            <path d="M 4 16 L 10 10 L 16 13 L 26 4" stroke={activeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 20 4 H 26 V 10" stroke={activeColor} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {isHovered && currentTab !== "current" && (
              <path d="M 4 16 L 10 10 L 16 13 L 26 4" stroke={activeColor} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-20" style={{ filter: "blur(2.5px)" }} />
            )}
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group rounded-[20px] border ${tabStyles.border} ${tabStyles.bg} p-6 transition-all duration-500 card-lift backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full`}
      style={{
        boxShadow: isHovered && currentTab !== "current"
          ? `0 20px 40px -10px ${tabStyles.shadow}, 0 12px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)`
          : `0 12px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.025)`,
      }}
    >
      {/* Dynamic top hairline accent glimmer (expands and fades in on hover) */}
      <div 
        className="absolute top-0 inset-x-0 h-[1.5px] transition-all duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${color}, transparent)`,
          opacity: isHovered && currentTab !== "current" ? 0.8 : 0
        }}
      />

      {/* Dynamic glow effect overlay inside the card on hover */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background: `radial-gradient(130px circle at 50% 10%, ${tabStyles.shadow}, transparent 70%)`,
        }}
      />

      {/* Main Metric Value on Top & Micro-Graphic */}
      <div>
        <div className="flex items-start justify-between">
          <div
            className={`font-bold font-display leading-none tracking-tight transition-all duration-300 whitespace-nowrap ${
              Array.isArray(target)
                ? "text-[20px] sm:text-[21px] md:text-[25px] lg:text-[30px]"
                : "text-4xl md:text-5xl"
            }`}
            style={{ 
              color: currentTab !== "current" ? color : "#FFFFFF", 
              fontVariantNumeric: "tabular-nums",
              textShadow: currentTab !== "current" 
                ? `0 0 ${isHovered ? "20px" : "12px"} ${color}${isHovered ? "25" : "10"}` 
                : "none"
            }}
          >
            {displayValue}
          </div>
          <div className="opacity-35 group-hover:opacity-75 transition-opacity duration-500 mt-1">
            {renderMicroGraphic(statKey, color, isHovered)}
          </div>
        </div>
        
        {/* Label underneath */}
        <div className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/35 mt-3 leading-relaxed">
          {label}
        </div>
      </div>

      {/* Dynamic Detail caption at the bottom */}
      <div className="mt-6 pt-3 border-t border-white/[0.02] text-[10.5px] text-white/45 group-hover:text-white/60 transition-colors leading-relaxed">
        {detail}
      </div>
    </div>
  );
}

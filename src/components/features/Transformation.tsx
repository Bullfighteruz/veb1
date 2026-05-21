import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  {
    label: "Your Current",
    days: 64,
    margin: 1750,
    context: "Typical idle times trap substantial cash flow in depreciating metal assets on the lot.",
    tone: "red",
    color: "#FF4D4D",
  },
  {
    label: "Industry Average",
    days: 55,
    margin: 2100,
    context: "The benchmark most independent dealers reach using standard local sourcing channels.",
    tone: "amber",
    color: "#FFB347",
  },
  {
    label: "Revu Target",
    days: 42,
    margin: 2400,
    context: "Accelerated retail velocity achieved by matching pre-sold buyers with optimal vehicle supply.",
    tone: "green",
    color: "#00F0B0",
  },
] as const;

const IMPACT = [
  {
    idKey: "saved" as const,
    label: "Days saved",
    value: "22",
    detail: "days saved per car on average lot time",
  },
  {
    idKey: "turnover" as const,
    label: "Turnover",
    value: "34%",
    detail: "faster capital recycling velocity",
  },
  {
    idKey: "profit" as const,
    label: "Margin lift",
    value: "+$650",
    detail: "incremental margin per retail car",
  },
] as const;

const INITIAL_STEP = 1;
function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function useAnimatedNumber(value: number, duration = 560) {
  const [display, setDisplay] = useState(value);
  const previousValueRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);

    const from = previousValueRef.current;
    const to = value;
    const start = performance.now();

    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (to - from) * eased);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        previousValueRef.current = to;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [duration, value]);

  return display;
}

export default function Transformation() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const activeIndexRef = useRef(INITIAL_STEP);
  const rafRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startScrollLeft: 0,
  });

  const [activeIndex, setActiveIndex] = useState(INITIAL_STEP);
  const [sectionSeen, setSectionSeen] = useState(false);
  const activeStep = STEPS[activeIndex];
  const animatedDays = useAnimatedNumber(activeStep.days);
  const animatedMargin = useAnimatedNumber(activeStep.margin);

  const clampIndex = useCallback((index: number) => {
    return Math.min(STEPS.length - 1, Math.max(0, index));
  }, []);

  const getCards = useCallback((track: HTMLDivElement) => {
    return Array.from(track.querySelectorAll<HTMLElement>("[data-step-card]"));
  }, []);

  const getNearestStep = useCallback(
    (track: HTMLDivElement) => {
      const cards = getCards(track);
      if (!cards.length) return INITIAL_STEP;

      const center = track.scrollLeft + track.clientWidth / 2;
      let nearestIndex = 0;
      let nearestDistance = Infinity;

      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      return nearestIndex;
    },
    [getCards]
  );

  const getStepOffset = useCallback(
    (track: HTMLDivElement, index: number) => {
      const cards = getCards(track);
      const card = cards[clampIndex(index)];
      if (!card) return track.scrollLeft;

      const rawOffset = card.offsetLeft + card.offsetWidth / 2 - track.clientWidth / 2;
      const maxOffset = Math.max(0, track.scrollWidth - track.clientWidth);

      return Math.min(maxOffset, Math.max(0, rawOffset));
    },
    [clampIndex, getCards]
  );

  const commitStep = useCallback(
    (index: number) => {
      const next = clampIndex(index);
      activeIndexRef.current = next;
      setActiveIndex(next);
    },
    [clampIndex]
  );

  const scrollToStep = useCallback(
    (index: number, behavior: ScrollBehavior = "smooth") => {
      const track = trackRef.current;
      if (!track) return;

      const next = clampIndex(index);
      commitStep(next);
      track.scrollTo({ left: getStepOffset(track, next), behavior });
    },
    [clampIndex, commitStep, getStepOffset]
  );

  useEffect(() => {
    const track = trackRef.current;
    const section = sectionRef.current;
    if (!track || !section) return;

    const syncFromScroll = () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        commitStep(getNearestStep(track));
      });
    };

    const recenter = () => {
      track.scrollTo({ left: getStepOffset(track, activeIndexRef.current), behavior: "auto" });
      commitStep(getNearestStep(track));
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;

        setSectionSeen(true);
        if (hasInitializedRef.current) return;

        hasInitializedRef.current = true;
        requestAnimationFrame(() => scrollToStep(INITIAL_STEP, "smooth"));
      },
      { threshold: 0.26 }
    );

    track.addEventListener("scroll", syncFromScroll, { passive: true });
    window.addEventListener("resize", recenter);
    observer.observe(section);
    requestAnimationFrame(() => scrollToStep(INITIAL_STEP, "auto"));

    return () => {
      track.removeEventListener("scroll", syncFromScroll);
      window.removeEventListener("resize", recenter);
      observer.disconnect();
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [commitStep, getNearestStep, getStepOffset, scrollToStep]);

  const beginDrag = (clientX: number) => {
    const track = trackRef.current;
    if (!track) return;

    dragRef.current = {
      active: true,
      startX: clientX,
      startScrollLeft: track.scrollLeft,
    };
  };

  const moveDrag = (clientX: number) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;

    const delta = clientX - drag.startX;
    track.scrollLeft = drag.startScrollLeft - delta;
  };

  const finishDrag = (clientX: number) => {
    const track = trackRef.current;
    const drag = dragRef.current;
    if (!track || !drag.active) return;

    const delta = clientX - drag.startX;
    dragRef.current.active = false;

    if (Math.abs(delta) > 56) {
      scrollToStep(activeIndexRef.current + (delta < 0 ? 1 : -1));
    } else {
      scrollToStep(getNearestStep(track));
    }
  };

  const onMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    beginDrag(event.clientX);
  };

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    event.preventDefault();
    moveDrag(event.clientX);
  };

  const onMouseUp = (event: MouseEvent<HTMLDivElement>) => {
    finishDrag(event.clientX);
  };

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    beginDrag(event.touches[0].clientX);
  };

  const onTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    moveDrag(event.touches[0].clientX);
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.changedTouches[0];
    if (!touch) return;
    finishDrag(touch.clientX);
  };

  const canGoPrev = activeIndex > 0;
  const canGoNext = activeIndex < STEPS.length - 1;

  return (
    <section
      id="numbers"
      ref={sectionRef}
      data-section="transformation"
      className="relative isolate scroll-mt-24 overflow-hidden bg-[#0A0C10] pb-24 pt-20 md:pb-32 md:pt-28 border-t border-white/[0.04]"
    >
      {/* ─── AESTHETIC BACKGROUND ELEMENTS ─── */}
      {/* 1. Dual-Layer Technical Grid Patterns */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:96px_96px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none -z-10" />

      {/* 2. Floating Ambient Glow Orbs */}
      <div className="absolute -left-40 top-12 h-[550px] w-[550px] rounded-full bg-[#FF4D4D]/[0.012] pointer-events-none -z-10 animate-drift-1" style={{ filter: "blur(140px)" }} />
      <div className="absolute -right-40 bottom-12 h-[550px] w-[550px] rounded-full bg-[#00F0B0]/[0.012] pointer-events-none -z-10 animate-drift-2" style={{ filter: "blur(140px)" }} />
      <div 
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full pointer-events-none -z-10 transition-all duration-1000"
        style={{
          background: `radial-gradient(circle, ${activeStep.color}15, transparent 70%)`,
          filter: "blur(130px)",
        }}
      />
      
      {/* 3. Fine tactile noise texture */}
      <div 
        className="absolute inset-0 opacity-[0.012] pointer-events-none -z-10 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.08 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`
        }}
      />

      <div className="container">
        {/* Section Header */}
        <div className="reveal mx-auto max-w-4xl text-center">
          <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.35em] text-[#00F0B0]">
            04 - The transformation
          </div>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.04] tracking-tightest md:text-6xl text-white">
            From <span className="text-white/40">stuck</span> to{" "}
            <span className="bg-gradient-to-r from-[#00F0B0] to-[#FFB347] bg-clip-text text-transparent">scaling.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-relaxed text-white/60">
            A cleaner path from idle inventory to faster retail turns, built around realistic
            passenger-car benchmarks for independent dealers.
          </p>
        </div>

        {/* Carousel Track */}
        <div
          ref={trackRef}
          className="scrollbar-none mt-16 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-4 active:cursor-grabbing md:gap-7 lg:gap-8 lg:pb-0"
          style={{ touchAction: "pan-y", scrollPaddingInline: "1px" }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onTouchCancel={onTouchEnd}
        >
          {STEPS.map((step, index) => {
            const isActive = activeIndex === index;
            return (
              <StepCard
                key={step.label}
                step={step}
                index={index}
                isActive={isActive}
                days={isActive ? Math.round(animatedDays) : step.days}
                margin={isActive ? Math.round(animatedMargin) : step.margin}
              />
            );
          })}
        </div>

        {/* Control HUD Deck */}
        <ControlDeck
          activeIndex={activeIndex}
          activeStep={activeStep}
          isReady={sectionSeen}
          canGoPrev={canGoPrev}
          canGoNext={canGoNext}
          onPrev={() => scrollToStep(activeIndex - 1)}
          onNext={() => scrollToStep(activeIndex + 1)}
          onSelect={(index) => scrollToStep(index)}
        />

        {/* Bottom Diagnostics Grid */}
        <div className="reveal mt-10 grid gap-4 md:grid-cols-3">
          {IMPACT.map((item) => (
            <ImpactPanel key={item.label} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function StepCard({
  step,
  index,
  isActive,
  days,
  margin,
}: {
  step: (typeof STEPS)[number];
  index: number;
  isActive: boolean;
  days: number;
  margin: number;
}) {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const style = {
    "--step-color": step.color,
    "--step-shadow": `${step.color}24`,
    borderColor: isActive || isHovered ? "rgba(255, 255, 255, 0.12)" : "rgba(255, 255, 255, 0.05)",
    boxShadow: isActive
      ? `0 30px 90px -10px ${step.color}20, 0 20px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)`
      : isHovered
      ? `0 25px 70px -12px ${step.color}15, 0 15px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)`
      : "0 12px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.025)",
  } as CSSProperties;

  return (
    <article
      data-step-card
      aria-current={isActive ? "step" : undefined}
      style={style}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex min-h-[390px] flex-[0_0_86vw] snap-center flex-col overflow-hidden rounded-[28px] border p-8 transition-[background,border-color,box-shadow,opacity,transform] duration-500 will-change-transform hover:scale-[1.02] md:min-h-[410px] md:flex-[0_0_46vw] md:px-8 md:py-9 lg:min-h-[450px] lg:flex-[0_0_calc((100%-4rem)/3)] lg:px-10 lg:py-10 ${
        isActive
          ? "bg-[rgba(16,18,23,0.72)] opacity-100"
          : "bg-[rgba(16,18,23,0.42)] opacity-78"
      }`}
    >
      {/* Spotlight overlay that tracks mouse cursor */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `radial-gradient(200px circle at ${coords.x}px ${coords.y}px, ${step.color}15, transparent 80%)`,
        }}
      />
      {/* Subtle inside card grid backdrop */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-500"
        style={{
          backgroundImage: `radial-gradient(circle, ${step.color} 1px, transparent 1px)`,
          backgroundSize: "16px 16px",
        }}
      />
      {/* Radial color backdrop */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80 backdrop-blur-[24px]"
        style={{
          background: `linear-gradient(145deg, color-mix(in srgb, ${step.color} 12%, transparent), transparent 45%), linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.005))`,
        }}
        aria-hidden
      />
      {/* Top hairline gradient border glow */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 h-[1.5px] transition-opacity duration-500 ${
          isActive ? "animate-pulse-hairline" : ""
        }`}
        style={{
          background: `linear-gradient(to right, transparent, ${step.color}, transparent)`,
          opacity: isActive || isHovered ? 0.8 : 0,
        }}
        aria-hidden
      />
      
      <div className="relative flex h-full flex-col z-10">
        {/* Monospace step header */}
        <div className="flex items-center justify-between gap-4 border-b border-white/[0.04] pb-4">
          <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">
            Step 0{index + 1}
          </span>
          <div className="flex items-center gap-1.5">
            <span 
              className={`h-1.5 w-1.5 rounded-full transition-all duration-500 ${
                isActive ? "animate-pulse" : "bg-white/10"
              }`}
              style={isActive ? { backgroundColor: step.color, boxShadow: `0 0 10px ${step.color}` } : undefined}
            />
          </div>
        </div>

        <div className="mt-6 flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/60">
              {step.label}
            </h3>
            
            {/* Visual Days metric */}
            <div className="mt-4 flex items-baseline select-none">
              <span className="font-display text-[4.5rem] font-extrabold leading-none tracking-tightest text-white tabular-nums">
                {days}
              </span>
              <span 
                className="font-display text-[3.25rem] font-extrabold leading-none tracking-tightest ml-0.5"
                style={{ 
                  color: step.color,
                  textShadow: isActive || isHovered ? `0 0 25px ${step.color}40` : "none" 
                }}
              >
                d
              </span>
            </div>

            <p className="mt-5 text-[13px] leading-relaxed text-white/50">
              {step.context}
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-white/[0.03]">
            <div className="flex items-center justify-between">
              <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/35">
                Avg margin / car
              </div>
              {index > 0 && (
                <span className="text-[10px] font-bold text-[#00F0B0] uppercase tracking-wider flex items-center">
                  ↑ +${margin - 1750}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <div
                className="font-display text-[1.85rem] font-extrabold leading-none tabular-nums"
                style={{ color: step.color }}
              >
                {formatCurrency(margin)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

function ControlDeck({
  activeIndex,
  activeStep,
  isReady,
  canGoPrev,
  canGoNext,
  onPrev,
  onNext,
  onSelect,
}: {
  activeIndex: number;
  activeStep: (typeof STEPS)[number];
  isReady: boolean;
  canGoPrev: boolean;
  canGoNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSelect: (index: number) => void;
}) {
  const progressWidth = `${(activeIndex / (STEPS.length - 1)) * 100}%`;
  const points = [
    { x: 58, y: 96 },
    { x: 340, y: 68 },
    { x: 622, y: 40 },
  ];
  const activePoint = points[activeIndex] ?? points[0];
  const activePct = activeIndex === 0 ? 35 : activeIndex === 1 ? 60 : 100;

  return (
    <div
      data-control-deck
      className="mt-8 overflow-hidden rounded-[30px] border border-white/[0.08] bg-[linear-gradient(135deg,rgba(20,22,27,0.78),rgba(8,11,16,0.64))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[12px]"
    >
      {styleRadarSpin}
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.7fr)_auto] lg:items-stretch">
        
        {/* Left Column: Active Benchmark Status */}
        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#101217]/50 p-5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] flex flex-col items-center min-h-[220px]">
          {/* L-brackets */}
          <span className="absolute left-0 top-0 block h-3.5 w-3.5 border-l-2 border-t-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute right-0 top-0 block h-3.5 w-3.5 border-r-2 border-t-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute left-0 bottom-0 block h-3.5 w-3.5 border-l-2 border-b-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute right-0 bottom-0 block h-3.5 w-3.5 border-r-2 border-b-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />

          <div className="w-full flex items-center justify-end mb-4">
            <span className="flex h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: activeStep.color, boxShadow: `0 0 8px ${activeStep.color}` }} />
          </div>

          {/* SVG Radial Gauge */}
          <div className="relative flex-1 flex items-center justify-center h-28 w-28">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              {/* Background swept track */}
              <path
                d="M 23.13 76.87 A 38 38 0 1 1 76.87 76.87"
                fill="none"
                stroke="rgba(255, 255, 255, 0.04)"
                strokeWidth="5"
                strokeLinecap="round"
              />
              
              {/* Active swept progress track */}
              <path
                d="M 23.13 76.87 A 38 38 0 1 1 76.87 76.87"
                fill="none"
                stroke={activeStep.color}
                strokeWidth="5"
                strokeLinecap="round"
                strokeDasharray="179.07"
                strokeDashoffset={179.07 - (179.07 * activePct) / 100}
                style={{
                  transition: "stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1), stroke 0.5s ease",
                  filter: `drop-shadow(0 0 6px ${activeStep.color}50)`
                }}
              />

              {/* Concentric tick lines around the circle (25 ticks, indices 0-24) */}
              {Array.from({ length: 25 }).map((_, i) => {
                const angle = 135 + i * 11.25;
                const isMajor = i % 4 === 0;
                const tickPct = (i / 24) * 100;
                const isActiveTick = tickPct <= activePct;
                const rStart = isMajor ? 34 : 36;
                const rEnd = 39;
                return (
                  <line
                    key={i}
                    x1="50"
                    y1={50 - rEnd}
                    x2="50"
                    y2={50 - rStart}
                    stroke={isActiveTick ? activeStep.color : "rgba(255, 255, 255, 0.08)"}
                    strokeWidth={isMajor ? "1.5" : "1"}
                    transform={`rotate(${angle + 90} 50 50)`}
                    style={{
                      transition: "stroke 0.5s ease",
                    }}
                  />
                );
              })}

              {/* Rotating Needle (pointing along positive x-axis and rotated dynamically) */}
              <g 
                transform={`rotate(${135 + (activePct / 100) * 270} 50 50)`}
                style={{ transition: "transform 1s cubic-bezier(0.4, 0, 0.2, 1)" }}
              >
                <polygon
                  points="47,50 50,48.5 78,50 50,51.5"
                  fill={activeStep.color}
                  style={{
                    filter: `drop-shadow(0 0 3px ${activeStep.color}60)`,
                    transition: "fill 0.5s ease",
                  }}
                />
              </g>

              {/* Center Glass Pin */}
              <circle
                cx="50"
                cy="50"
                r="5"
                fill="#101217"
                stroke={activeStep.color}
                strokeWidth="1.5"
                style={{
                  transition: "stroke 0.5s ease",
                  filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.5))"
                }}
              />
              <circle
                cx="50"
                cy="50"
                r="1.8"
                fill="#FFFFFF"
              />
            </svg>
            

          </div>
        </div>

        {/* Center Column: Velocity Corridor SVG */}
        <div className="relative min-h-[190px] overflow-hidden rounded-[22px] border border-white/[0.06] bg-[#0A0F15]/80 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
          {/* L-brackets */}
          <span className="absolute left-0 top-0 block h-3.5 w-3.5 border-l-2 border-t-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute right-0 top-0 block h-3.5 w-3.5 border-r-2 border-t-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute left-0 bottom-0 block h-3.5 w-3.5 border-l-2 border-b-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute right-0 bottom-0 block h-3.5 w-3.5 border-r-2 border-b-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          
          {/* Grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[length:24px_24px]" />
          </div>

          <div className="relative mb-2 flex items-center justify-between gap-4">
            <h4 className="text-[11px] font-bold tracking-wider text-white/60 uppercase">
              Velocity Corridor
            </h4>
          </div>

          {/* SVG Visualizer */}
          <div className="relative h-[128px]">
            <svg viewBox="0 0 680 128" className="h-full w-full overflow-visible" aria-hidden>
              <defs>
                <linearGradient id="transformationGlowGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#FF4D4D" />
                  <stop offset="50%" stopColor="#FFB347" />
                  <stop offset="100%" stopColor="#00F0B0" />
                </linearGradient>
                <linearGradient id="area-glow-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={activeStep.color} stopOpacity={activeIndex === 0 ? 0.08 : activeIndex === 1 ? 0.12 : 0.20} />
                  <stop offset="100%" stopColor={activeStep.color} stopOpacity={0.0} />
                </linearGradient>
                <filter id="transformationGlow" x="-20%" y="-90%" width="140%" height="280%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Technical horizontal coordinate lines */}
              {[40, 68, 96].map((lineY, i) => (
                <line
                  key={i}
                  x1="30"
                  x2="650"
                  y1={lineY}
                  y2={lineY}
                  stroke="rgba(255, 255, 255, 0.035)"
                  strokeWidth="0.8"
                />
              ))}

              {/* Gradient glow area under the curve */}
              <path
                d="M 58 96 C 180 96, 220 68, 340 68 S 500 40, 622 40 L 622 114 L 58 114 Z"
                fill="url(#area-glow-grad)"
                className="transition-all duration-700"
              />

              {/* Main Dotted Guide Line */}
              <path
                d="M 58 96 C 180 96, 220 68, 340 68 S 500 40, 622 40"
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1.5"
                strokeDasharray="5 7"
                strokeLinecap="round"
              />

              {/* Underlaying static corridor path with gradient */}
              <path
                d="M 58 96 C 180 96, 220 68, 340 68 S 500 40, 622 40"
                fill="none"
                stroke="url(#transformationGlowGrad)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="opacity-[0.08]"
              />

              {/* Segment 1 comet trail */}
              {activeIndex >= 1 && (
                <g>
                  {/* Trail 2 */}
                  <circle r="3.5" fill="#FF4D4D" opacity="0.25" filter="url(#transformationGlow)">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 58 96 C 180 96, 220 68, 340 68" begin="0s" />
                  </circle>
                  {/* Trail 1 */}
                  <circle r="2.5" fill="#FFB347" opacity="0.6" filter="url(#transformationGlow)">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 58 96 C 180 96, 220 68, 340 68" begin="-0.06s" />
                  </circle>
                  {/* White-hot head */}
                  <circle r="1.5" fill="#FFFFFF" opacity="0.95">
                    <animateMotion dur="1.8s" repeatCount="indefinite" path="M 58 96 C 180 96, 220 68, 340 68" begin="-0.12s" />
                  </circle>
                </g>
              )}

              {/* Segment 2 comet trail */}
              {activeIndex >= 2 && (
                <g>
                  {/* Trail 2 */}
                  <circle r="3.5" fill="#FFB347" opacity="0.25" filter="url(#transformationGlow)">
                    <animateMotion dur="1.6s" repeatCount="indefinite" path="M 340 68 C 460 68, 500 40, 622 40" begin="0s" />
                  </circle>
                  {/* Trail 1 */}
                  <circle r="2.5" fill="#00F0B0" opacity="0.6" filter="url(#transformationGlow)">
                    <animateMotion dur="1.6s" repeatCount="indefinite" path="M 340 68 C 460 68, 500 40, 622 40" begin="-0.05s" />
                  </circle>
                  {/* White-hot head */}
                  <circle r="1.5" fill="#FFFFFF" opacity="0.95">
                    <animateMotion dur="1.6s" repeatCount="indefinite" path="M 340 68 C 460 68, 500 40, 622 40" begin="-0.10s" />
                  </circle>
                </g>
              )}

              {/* Step Nodes and Guides */}
              {points.map((point, index) => {
                const step = STEPS[index];
                const isActive = activeIndex === index;

                return (
                  <g key={step.label} className="cursor-pointer" onClick={() => onSelect(index)}>
                    {/* Vertical guidelines */}
                    <line
                      x1={point.x}
                      x2={point.x}
                      y1={point.y}
                      y2="114"
                      stroke={isActive ? step.color : "rgba(255,255,255,0.06)"}
                      strokeWidth={isActive ? "1.5" : "1"}
                      strokeDasharray={isActive ? "3 1" : "2 2"}
                      className="transition-all duration-500"
                      style={{ opacity: isActive ? 0.8 : 0.25 }}
                    />
                    
                    {/* Concentric radar circles on active node */}
                    {isActive && (
                      <>
                        <circle cx={point.x} cy={point.y} r="5" fill="none" stroke={step.color} strokeWidth="1.5">
                          <animate attributeName="r" values="5;20" dur="2.4s" repeatCount="indefinite" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" />
                        </circle>
                        <circle cx={point.x} cy={point.y} r="5" fill="none" stroke={step.color} strokeWidth="1.2">
                          <animate attributeName="r" values="5;20" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                          <animate attributeName="opacity" values="0.85;0" dur="2.4s" repeatCount="indefinite" begin="1.2s" />
                        </circle>
                      </>
                    )}

                    {/* Rotating outer notch ring for active node */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 11 : 7}
                      fill="none"
                      stroke={isActive ? step.color : "rgba(255, 255, 255, 0.12)"}
                      strokeWidth="1.2"
                      strokeDasharray="3 3"
                      className="transition-all duration-500"
                      style={{
                        opacity: isActive ? 0.95 : 0.4
                      }}
                    >
                      {isActive && (
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          from={`0 ${point.x} ${point.y}`}
                          to={`360 ${point.x} ${point.y}`}
                          dur="18s"
                          repeatCount="indefinite"
                        />
                      )}
                    </circle>
                    
                    {/* Inner core center */}
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 4.5 : 3}
                      fill={isActive ? "#FFFFFF" : "#0A0F15"}
                      stroke={step.color}
                      strokeWidth={isActive ? 2.5 : 1.5}
                      className="transition-all duration-500"
                      style={{ filter: isActive ? `drop-shadow(0 0 3px ${step.color})` : "none" }}
                    />

                    {/* Node tick text at bottom */}
                    <text
                      x={point.x}
                      y="124"
                      textAnchor="middle"
                      fill={isActive ? step.color : "rgba(255,255,255,0.32)"}
                      fontSize="9"
                      fontFamily="Space Grotesk, sans-serif"
                      fontWeight="800"
                      className="transition-colors duration-500"
                    >
                      {step.days}D
                    </text>

                    {/* Hitbox circle */}
                    <circle cx={point.x} cy={point.y} r="25" fill="transparent" />
                  </g>
                );
              })}

              {/* Tactical Radar Target Lock Over active node */}
              <g transform={`translate(${activePoint.x}, ${activePoint.y})`} className="pointer-events-none transition-all duration-500">
                <circle cx="0" cy="0" r="16" fill="none" stroke={activeStep.color} strokeWidth="0.8" strokeDasharray="4 8">
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0"
                    to="360"
                    dur="24s"
                    repeatCount="indefinite"
                  />
                </circle>
                <line x1="-19" y1="0" x2="-13" y2="0" stroke={activeStep.color} strokeWidth="1" />
                <line x1="13" y1="0" x2="19" y2="0" stroke={activeStep.color} strokeWidth="1" />
                <line x1="0" y1="-19" x2="0" y2="-13" stroke={activeStep.color} strokeWidth="1" />
                <line x1="0" y1="13" x2="0" y2="19" stroke={activeStep.color} strokeWidth="1" />
              </g>
            </svg>
          </div>

          {/* Active progress corridor bar */}
          <div className="relative mt-2 h-1 overflow-hidden rounded-full bg-white/[0.04] border border-white/[0.02]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF4D4D] via-[#FFB347] to-[#00F0B0] transition-[width] duration-700 ease-out"
              style={{ width: isReady ? progressWidth : "0%" }}
            />
          </div>
          <div className="relative mt-2 flex justify-between text-[8.5px] font-bold uppercase tracking-wider text-white/25">
            <span>Start</span>
            <span>Industry Average</span>
            <span>Optimal Target</span>
          </div>
        </div>

        {/* Right Column: HUD Interactive slider deck buttons */}
        <div className="flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.06] bg-[#101217]/50 p-4 backdrop-blur-md relative overflow-hidden">
          {/* L-brackets */}
          <span className="absolute left-0 top-0 block h-3.5 w-3.5 border-l-2 border-t-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute right-0 top-0 block h-3.5 w-3.5 border-r-2 border-t-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute left-0 bottom-0 block h-3.5 w-3.5 border-l-2 border-b-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />
          <span className="absolute right-0 bottom-0 block h-3.5 w-3.5 border-r-2 border-b-2 transition-colors duration-500" style={{ borderColor: activeStep.color }} />

          <div className="flex items-center justify-center gap-3 lg:flex-col lg:justify-between">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canGoPrev}
              aria-label="Previous benchmark"
              className="relative group overflow-hidden inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/50 transition duration-300 hover:scale-105 active:scale-95 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-20 backdrop-blur-md"
            >
              <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5 z-10" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              aria-label="Next benchmark"
              className="relative group overflow-hidden inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/50 transition duration-300 hover:scale-105 active:scale-95 hover:border-white/20 hover:bg-white/[0.08] hover:text-white disabled:pointer-events-none disabled:opacity-20 backdrop-blur-md"
            >
              <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 z-10" />
            </button>
          </div>
          <div className="rounded-2xl border border-rev-green/15 bg-rev-green/[0.04] px-4 py-3 text-[9px] font-mono font-semibold uppercase leading-relaxed tracking-[0.2em] text-[#00F0B0]/80 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00F0B0] animate-pulse" />
            <span>SWIPE CARDS</span>
          </div>
        </div>

      </div>
    </div>
  );
}

function ImpactPanel({
  label,
  value,
  detail,
  idKey,
}: {
  label: string;
  value: string;
  detail: string;
  idKey: "saved" | "turnover" | "profit";
}) {
  const [isHovered, setIsHovered] = useState(false);

  const renderMicroGraphic = () => {
    switch (idKey) {
      case "saved":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-transform duration-700" style={{ transform: isHovered ? "rotate(-90deg)" : "rotate(0deg)" }}>
            <circle cx="12" cy="12" r="9" stroke="#00F0B0" strokeWidth="1.5" strokeDasharray="3 3" className="opacity-40" />
            <circle cx="12" cy="12" r="9" stroke="#00F0B0" strokeWidth="1.8" strokeDasharray="18 40" strokeLinecap="round" />
            <path d="M 12 12 L 12 7" stroke="#00F0B0" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M 12 12 L 15.5 12" stroke="#00F0B0" strokeWidth="1.5" strokeLinecap="round" className="opacity-75" />
          </svg>
        );
      case "turnover":
        return (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" className="transition-transform duration-500" style={{ transform: isHovered ? "translateX(2px)" : "translateX(0px)" }}>
            <path d="M 8 6 L 14 12 L 8 18" stroke="#00F0B0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 14 6 L 20 12 L 14 18" stroke="#00F0B0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="opacity-40" />
          </svg>
        );
      case "profit":
        return (
          <svg width="30" height="18" viewBox="0 0 32 20" fill="none">
            <path d="M 4 16 L 10 10 L 16 13 L 26 4" stroke="#00F0B0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M 20 4 H 26 V 10" stroke="#00F0B0" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            {isHovered && (
              <path d="M 4 16 L 10 10 L 16 13 L 26 4" stroke="#00F0B0" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="opacity-20" style={{ filter: "blur(2.5px)" }} />
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
      className="group rounded-[20px] border border-white/[0.04] hover:border-[#00F0B0]/25 bg-white/[0.015] p-6 transition-all duration-500 card-lift backdrop-blur-md relative overflow-hidden flex flex-col justify-between h-full"
      style={{
        boxShadow: isHovered
          ? "0 20px 40px -10px rgba(0, 240, 176, 0.06), 0 12px 30px rgba(0,0,0,0.22), inset 0 1px 0 rgba(255,255,255,0.04)"
          : "0 12px 30px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.025)",
      }}
    >
      {/* Dynamic top hairline accent glimmer */}
      <div 
        className="absolute top-0 inset-x-0 h-[1.5px] transition-all duration-500"
        style={{
          background: "linear-gradient(to right, transparent, #00F0B0, transparent)",
          opacity: isHovered ? 0.8 : 0
        }}
      />

      {/* Dynamic glow effect overlay inside the card on hover */}
      <div 
        className="pointer-events-none absolute -inset-px opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"
        style={{
          background: "radial-gradient(130px circle at 50% 10%, rgba(0, 240, 176, 0.06), transparent 70%)",
        }}
      />

      {/* Main Metric Value on Top & Micro-Graphic */}
      <div>
        <div className="flex items-start justify-between">
          <div
            className="font-bold font-display text-4xl md:text-5xl leading-none tracking-tight text-white transition-all duration-300"
            style={{ 
              textShadow: `0 0 ${isHovered ? "20px" : "12px"} rgba(0, 240, 176, ${isHovered ? "0.25" : "0.1"})`,
              fontVariantNumeric: "tabular-nums"
            }}
          >
            {value}
          </div>
          <div className="opacity-35 group-hover:opacity-75 transition-opacity duration-500 mt-1">
            {renderMicroGraphic()}
          </div>
        </div>
        
        {/* Label underneath */}
        <div className="text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/35 mt-3 leading-relaxed">
          {label.toUpperCase()}
        </div>
      </div>

      {/* Dynamic Detail caption at the bottom */}
      <div className="mt-6 pt-3 border-t border-white/[0.02] text-[10.5px] text-white/45 group-hover:text-white/60 transition-colors leading-relaxed">
        {detail}
      </div>
    </div>
  );
}

// Inline styles injector for animations
const styleRadarSpin = (
  <style dangerouslySetInnerHTML={{ __html: `
    @keyframes rotate-slow {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes rotate-reverse {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    @keyframes pulse-hairline {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 0.95; }
    }
    .animate-rotate-slow {
      animation: rotate-slow 18s linear infinite;
    }
    .animate-rotate-reverse {
      animation: rotate-reverse 15s linear infinite;
    }
    .animate-pulse-hairline {
      animation: pulse-hairline 2s ease-in-out infinite;
    }
  `}} />
);

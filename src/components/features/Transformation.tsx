import { useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties, MouseEvent, TouchEvent } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, GaugeCircle, TrendingUp } from "lucide-react";

const STEPS = [
  {
    label: "Your Current",
    days: 64,
    margin: 1750,
    context: "Industry-typical idle time. Cash trapped in steel.",
    tone: "red",
    color: "#FF4D4D",
  },
  {
    label: "Industry Average",
    days: 55,
    margin: 2100,
    context: "What competitors achieve with basic sourcing.",
    tone: "amber",
    color: "#FFB347",
  },
  {
    label: "Revu Target",
    days: 48,
    margin: 2400,
    context: "Achievable in 3 months with Revu's AI-driven system.",
    tone: "green",
    color: "#00FFAA",
  },
] as const;

const IMPACT = [
  {
    label: "Days saved",
    value: "16",
    detail: "days saved",
    Icon: CalendarDays,
  },
  {
    label: "Turnover",
    value: "25%",
    detail: "faster turnover",
    Icon: GaugeCircle,
  },
  {
    label: "Margin lift",
    value: "+$650",
    detail: "margin per car",
    Icon: TrendingUp,
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
      className="relative isolate scroll-mt-24 overflow-hidden bg-[#0A0C10] pb-20 pt-16 md:pb-28 md:pt-24"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.045]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "76px 76px",
          maskImage: "linear-gradient(180deg, transparent, black 15%, black 82%, transparent)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[520px] w-[min(920px,100vw)] -translate-x-1/2 rounded-full bg-rev-green/[0.055] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-rev-green/55 to-transparent"
        aria-hidden
      />

      <div className="container">
        <div className="reveal mx-auto max-w-4xl text-center">
          <div className="mb-4 text-[11px] uppercase tracking-[0.32em] text-white/42">
            04 - The transformation
          </div>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.04] tracking-tightest md:text-6xl">
            From <span className="text-white/58">stuck</span> to{" "}
            <span className="text-[#00FFAA]">scaling.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-relaxed text-white/58">
            A cleaner path from idle inventory to faster retail turns, built around realistic
            passenger-car benchmarks for independent dealers.
          </p>
        </div>

        <div
          ref={trackRef}
          className="scrollbar-none mt-12 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-4 active:cursor-grabbing md:gap-7 lg:gap-8 lg:pb-0"
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

        <div className="reveal mt-9 grid gap-4 md:grid-cols-3">
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
  const style = {
    "--step-color": step.color,
    "--step-shadow": `${step.color}24`,
  } as CSSProperties;

  return (
    <article
      data-step-card
      aria-current={isActive ? "step" : undefined}
      style={style}
      className={`group relative flex min-h-[370px] flex-[0_0_86vw] snap-center flex-col overflow-hidden rounded-[28px] border p-8 transition-[background,border-color,box-shadow,opacity,transform] duration-500 will-change-transform hover:scale-[1.02] hover:border-[color:var(--step-color)] hover:shadow-[0_26px_90px_var(--step-shadow)] md:min-h-[390px] md:flex-[0_0_46vw] md:px-8 md:py-9 lg:min-h-[430px] lg:flex-[0_0_calc((100%-4rem)/3)] lg:px-10 lg:py-10 ${
        isActive
          ? "border-[color:var(--step-color)] bg-[rgba(20,22,27,0.62)] opacity-100 shadow-[0_28px_100px_rgba(0,0,0,0.34),inset_0_1px_0_rgba(255,255,255,0.08)]"
          : "border-white/[0.08] bg-[rgba(20,22,27,0.48)] opacity-78 shadow-[inset_0_1px_0_rgba(255,255,255,0.045)]"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-80 backdrop-blur-[8px]"
        style={{
          background:
            "linear-gradient(145deg, color-mix(in srgb, var(--step-color) 16%, transparent), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.055), rgba(255,255,255,0.012))",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/26 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-60"
        style={{ background: "var(--step-color)" }}
        aria-hidden
      />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between gap-4">
          <span className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/42">
            Step 0{index + 1}
          </span>
          <span className="h-2 w-2 rounded-full bg-[color:var(--step-color)] shadow-[0_0_18px_var(--step-color)]" />
        </div>

        <div className="mt-8">
          <h3 className="text-[0.9rem] font-semibold uppercase tracking-[0.14em] text-white/56">
            {step.label}
          </h3>
          <div
            className="mt-5 font-display text-[4.15rem] font-semibold leading-none tracking-tightest tabular-nums md:text-[4.75rem]"
            style={{ color: "var(--step-color)" }}
          >
            {days}d
          </div>
          <p className="mt-6 max-w-[14rem] text-[0.85rem] leading-relaxed text-white/58 md:max-w-[15rem]">
            {step.context}
          </p>
        </div>

        <div className="mt-auto pt-10">
          <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/36">
            Avg margin / car
          </div>
          <div
            className="mt-3 font-display text-[1.55rem] font-semibold leading-none tabular-nums"
            style={{ color: "var(--step-color)" }}
          >
            {formatCurrency(margin)}
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
  const activePath = points
    .slice(0, activeIndex + 1)
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");
  const activePoint = points[activeIndex] ?? points[0];

  return (
    <div
      data-control-deck
      className="mt-7 overflow-hidden rounded-[30px] border border-white/[0.085] bg-[linear-gradient(135deg,rgba(20,22,27,0.78),rgba(8,11,16,0.64))] p-4 shadow-[0_30px_120px_rgba(0,0,0,0.28),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-[12px]"
    >
      <div className="grid gap-4 lg:grid-cols-[minmax(220px,0.72fr)_minmax(0,1.7fr)_auto] lg:items-stretch">
        <div className="relative overflow-hidden rounded-[22px] border border-white/[0.065] bg-white/[0.025] p-5">
          <div className="pointer-events-none absolute -right-12 -top-16 h-40 w-40 rounded-full bg-rev-green/10 blur-3xl" />
          <div className="relative">
            <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/36">
              Active benchmark
            </div>
            <div className="mt-3 font-display text-2xl font-semibold leading-tight text-white">
              {activeStep.label}
            </div>
            <div className="mt-1 text-[0.84rem] text-white/48">Passenger-car retail velocity</div>
            <div className="mt-6 flex items-end gap-3">
              <span
                className="font-display text-5xl font-semibold leading-none tabular-nums"
                style={{ color: activeStep.color }}
              >
                {activeStep.days}d
              </span>
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/36">
                to sell
              </span>
            </div>
          </div>
        </div>

        <div className="relative min-h-[190px] overflow-hidden rounded-[22px] border border-white/[0.065] bg-[#0A0F15]/70 px-5 py-5">
          <div className="pointer-events-none absolute inset-0 opacity-[0.16]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.28)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.28)_1px,transparent_1px)] bg-[length:44px_44px]" />
          </div>
          <div className="relative mb-2 flex items-center justify-between gap-4">
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/34">
                Velocity corridor
              </div>
              <div className="mt-1 text-[0.84rem] text-white/52">64 days to 48 days, without benchmark confusion</div>
            </div>
            <div className="hidden rounded-full border border-rev-green/20 bg-rev-green/[0.08] px-3 py-1.5 font-display text-sm font-semibold tabular-nums text-rev-green sm:block">
              {activeStep.days}d active
            </div>
          </div>

          <div className="relative h-[128px]">
            <svg viewBox="0 0 680 128" className="h-full w-full" aria-hidden>
              <defs>
                <linearGradient id="transformationPath" x1="58" y1="96" x2="622" y2="40" gradientUnits="userSpaceOnUse">
                  <stop offset="0" stopColor="#FF4D4D" />
                  <stop offset="0.52" stopColor="#FFB347" />
                  <stop offset="1" stopColor="#00FFAA" />
                </linearGradient>
                <filter id="transformationGlow" x="-20%" y="-90%" width="140%" height="280%">
                  <feGaussianBlur stdDeviation="5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <path
                d="M 58 96 L 340 68 L 622 40"
                fill="none"
                stroke="rgba(255,255,255,0.14)"
                strokeWidth="2"
                strokeDasharray="6 10"
                strokeLinecap="round"
              />
              <path
                d={activePath || "M 58 96"}
                fill="none"
                stroke="url(#transformationPath)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter="url(#transformationGlow)"
                style={{
                  strokeDasharray: 620,
                  strokeDashoffset: isReady ? 0 : 620,
                  transition: "stroke-dashoffset 850ms cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              />
              {points.map((point, index) => {
                const step = STEPS[index];
                const isActive = activeIndex === index;

                return (
                  <g key={step.label}>
                    <line
                      x1={point.x}
                      x2={point.x}
                      y1={point.y + 16}
                      y2="116"
                      stroke="rgba(255,255,255,0.09)"
                      strokeWidth="1"
                    />
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r={isActive ? 8 : 5}
                      fill={isActive ? step.color : "#0A0F15"}
                      stroke={step.color}
                      strokeWidth="2"
                    />
                    {isActive && (
                      <circle
                        cx={point.x}
                        cy={point.y}
                        r="19"
                        fill="none"
                        stroke={step.color}
                        strokeOpacity="0.2"
                        strokeWidth="2"
                      />
                    )}
                    <text
                      x={point.x}
                      y="124"
                      textAnchor="middle"
                      fill={isActive ? step.color : "rgba(255,255,255,0.48)"}
                      fontSize="11"
                      fontFamily="Space Grotesk, sans-serif"
                      fontWeight="700"
                      letterSpacing="1"
                    >
                      {step.days}D
                    </text>
                  </g>
                );
              })}
              <g transform={`translate(${activePoint.x}, ${activePoint.y})`}>
                <line
                  x1="0"
                  x2="0"
                  y1="-28"
                  y2="-10"
                  stroke={activeStep.color}
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path d="M -6 -30 L 0 -40 L 6 -30 Z" fill={activeStep.color} />
              </g>
            </svg>

            {STEPS.map((step, index) => {
              const point = points[index];

              return (
                <button
                  key={step.label}
                  type="button"
                  onClick={() => onSelect(index)}
                  aria-label={`Select ${step.label}`}
                  aria-current={activeIndex === index ? "step" : undefined}
                  className="absolute h-16 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rev-green/60"
                  style={{
                    left: `${(point.x / 680) * 100}%`,
                    top: `${(point.y / 128) * 100}%`,
                  }}
                />
              );
            })}
          </div>

          <div className="relative mt-1 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#FF4D4D] via-[#FFB347] to-[#00FFAA] transition-[width] duration-700 ease-out"
              style={{ width: isReady ? progressWidth : "0%" }}
            />
          </div>
          <div className="relative mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/28">
            <span>Current</span>
            <span>Industry</span>
            <span>Target</span>
          </div>
        </div>

        <div className="flex flex-col justify-between gap-4 rounded-[22px] border border-white/[0.065] bg-white/[0.025] p-4">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            <button
              type="button"
              onClick={onPrev}
              disabled={!canGoPrev}
              aria-label="Previous benchmark"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-white/64 transition hover:border-rev-green/35 hover:bg-rev-green/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={onNext}
              disabled={!canGoNext}
              aria-label="Next benchmark"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.035] text-white/64 transition hover:border-rev-green/35 hover:bg-rev-green/[0.07] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="rounded-2xl border border-rev-green/14 bg-rev-green/[0.055] px-4 py-3 text-[10px] font-semibold uppercase leading-relaxed tracking-[0.2em] text-rev-green/78">
            Drag, scroll, or swipe the cards.
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
  Icon,
}: {
  label: string;
  value: string;
  detail: string;
  Icon: typeof CalendarDays;
}) {
  return (
    <div className="group relative overflow-hidden rounded-[22px] border border-white/[0.075] bg-[rgba(20,22,27,0.54)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-[8px] transition hover:border-rev-green/35 hover:bg-rev-green/[0.045]">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rev-green/45 to-transparent opacity-0 transition group-hover:opacity-100"
        aria-hidden
      />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/38">
            {label}
          </div>
          <div className="mt-3 font-display text-3xl font-semibold leading-none tabular-nums text-white md:text-4xl">
            {value}
          </div>
          <div className="mt-2 text-[0.86rem] text-white/54">{detail}</div>
        </div>
        <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-rev-green/18 bg-rev-green/[0.08] text-rev-green">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </span>
      </div>
    </div>
  );
}

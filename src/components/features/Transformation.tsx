import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS = [
  {
    label: "Your Current",
    days: 64,
    margin: 1750,
    context: "Industry-typical idle time. Cash trapped in steel.",
    tone: "white",
  },
  {
    label: "Industry Average",
    days: 55,
    margin: 2100,
    context: "What competitors achieve with basic sourcing.",
    tone: "amber",
  },
  {
    label: "Revu Target",
    days: 48,
    margin: 2400,
    context: "Achievable in 3 months with Revu's AI-driven system.",
    tone: "green",
  },
] as const;

const INITIAL_STEP = 1;

function formatCurrency(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function useAnimatedNumber(value: number, duration = 520) {
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
  const activeStep = STEPS[activeIndex];
  const gaugeProgress = activeIndex / (STEPS.length - 1);
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
        if (!entry.isIntersecting || hasInitializedRef.current) return;
        hasInitializedRef.current = true;
        requestAnimationFrame(() => scrollToStep(INITIAL_STEP, "smooth"));
      },
      { threshold: 0.28 }
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

  const onMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    beginDrag(event.clientX);
  };

  const onMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    event.preventDefault();
    moveDrag(event.clientX);
  };

  const onMouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
    finishDrag(event.clientX);
  };

  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    beginDrag(event.touches[0].clientX);
  };

  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    moveDrag(event.touches[0].clientX);
  };

  const onTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
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
      className="relative isolate scroll-mt-24 overflow-hidden pb-20 pt-12 md:pb-28 md:pt-14"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,12,16,0) 0%, rgba(0,240,176,0.035) 28%, rgba(10,12,16,0.04) 62%, rgba(10,12,16,0) 100%)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-20 -z-10 h-px bg-gradient-to-r from-transparent via-rev-green/35 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.65) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "linear-gradient(180deg, transparent, black 20%, black 78%, transparent)",
        }}
        aria-hidden
      />

      <div className="container">
        <div className="reveal grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:items-start">
          <div className="max-w-3xl">
            <div className="mb-4 text-[11px] uppercase tracking-[0.32em] text-white/40">
              04 - The transformation
            </div>
            <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-6xl">
              From <span className="text-gradient">stuck</span> to{" "}
              <span className="text-gradient-green">scaling.</span>
            </h2>
            <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-white/58">
              A cleaner path from idle inventory to faster retail turns, using realistic
              passenger-car benchmarks for independent dealers.
            </p>
          </div>

          <Gauge
            activeIndex={activeIndex}
            progress={gaugeProgress}
            step={activeStep}
            onSelect={(index) => scrollToStep(index)}
          />
        </div>

        <div
          ref={trackRef}
          className="scrollbar-none mt-6 flex cursor-grab snap-x snap-mandatory gap-5 overflow-x-auto pb-3 active:cursor-grabbing md:mt-7"
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
              <article
                key={step.label}
                data-step-card
                aria-current={isActive ? "step" : undefined}
                className={`relative flex min-h-[320px] flex-[0_0_86vw] snap-center flex-col justify-between overflow-hidden rounded-[1.35rem] border p-7 transition-[background,border-color,box-shadow,opacity,transform] duration-500 md:min-h-[340px] md:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)] ${
                  isActive
                    ? "border-rev-green/35 bg-white/[0.045] opacity-100 shadow-[0_0_0_1px_rgba(0,240,176,0.08),0_28px_90px_rgba(0,0,0,0.24)]"
                    : "border-white/[0.075] bg-white/[0.018] opacity-72"
                }`}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-80"
                  style={{
                    background:
                      step.tone === "green"
                        ? "linear-gradient(145deg, rgba(0,240,176,0.13), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.045), transparent)"
                        : step.tone === "amber"
                        ? "linear-gradient(145deg, rgba(255,204,102,0.10), transparent 38%), linear-gradient(180deg, rgba(255,255,255,0.035), transparent)"
                        : "linear-gradient(180deg, rgba(255,255,255,0.04), transparent)",
                  }}
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />
                <div className="relative">
                  <div className="text-[10.5px] uppercase tracking-[0.28em] text-white/40">
                    Step 0{index + 1}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-semibold leading-tight text-white/90">
                    {step.label}
                  </h3>
                </div>

                <div className="relative">
                  <div
                    className={`font-display text-[4.25rem] font-semibold leading-none tracking-tightest md:text-[4.9rem] ${
                      step.tone === "green"
                        ? "text-rev-green"
                        : step.tone === "amber"
                        ? "text-rev-amber"
                        : "text-white"
                    }`}
                  >
                    {step.days}d
                  </div>
                  <p className="mt-5 min-h-12 text-[14px] leading-relaxed text-white/58">
                    {step.context}
                  </p>
                </div>

                <div className="relative flex items-end justify-between gap-6">
                  <div>
                    <div className="text-[10.5px] uppercase tracking-[0.28em] text-white/40">
                      Avg margin / car
                    </div>
                    <div
                      className={`mt-2 font-display text-3xl font-semibold tabular-nums ${
                        step.tone === "green" ? "text-rev-green" : "text-rev-amber"
                      }`}
                    >
                      {formatCurrency(step.margin)}
                    </div>
                  </div>
                  <div className="text-[10.5px] uppercase tracking-[0.28em] text-white/40">
                    {index + 1} / {STEPS.length}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToStep(activeIndex - 1)}
              disabled={!canGoPrev}
              aria-label="Previous benchmark"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToStep(activeIndex + 1)}
              disabled={!canGoNext}
              aria-label="Next benchmark"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-white/60 transition hover:bg-white/[0.05] disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 lg:justify-center" aria-label="Benchmark steps">
            {STEPS.map((step, index) => (
              <button
                key={step.label}
                type="button"
                onClick={() => scrollToStep(index)}
                aria-label={`Go to ${step.label}`}
                aria-current={activeIndex === index ? "step" : undefined}
                className={`h-1 rounded-full transition-all ${
                  activeIndex === index ? "w-14 bg-rev-green" : "w-7 bg-white/15 hover:bg-white/30"
                }`}
              />
            ))}
          </div>

          <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">
            Drag / scroll / swipe -&gt; Watch the needle move with you.
          </div>
        </div>

        <div className="reveal mt-8 grid gap-5 rounded-[1.35rem] border border-white/[0.075] bg-[linear-gradient(135deg,rgba(255,255,255,0.045),rgba(255,255,255,0.012))] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] md:grid-cols-3 md:p-8">
          <DynamicMetric label="Current step" value={activeStep.label} />
          <DynamicMetric label="Days to sell" value={`${Math.round(animatedDays)} days`} accent />
          <DynamicMetric label="Avg margin / car" value={formatCurrency(animatedMargin)} accent />
        </div>
      </div>
    </section>
  );
}

function Gauge({
  activeIndex,
  progress,
  step,
  onSelect,
}: {
  activeIndex: number;
  progress: number;
  step: (typeof STEPS)[number];
  onSelect: (index: number) => void;
}) {
  const daysSaved = STEPS[0].days - step.days;
  const marginLift = step.margin - STEPS[0].margin;
  const fasterPct = Math.round((daysSaved / STEPS[0].days) * 100);
  const points = [
    { x: 36, y: 116 },
    { x: 214, y: 76 },
    { x: 392, y: 34 },
  ];
  const activePoint = points[activeIndex] ?? points[0];
  const activePath = points
    .slice(0, activeIndex + 1)
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="relative w-full max-w-lg overflow-hidden rounded-[1.35rem] border border-rev-green/18 bg-[#0d1117] p-4 shadow-[0_30px_100px_rgba(0,0,0,0.34),0_0_60px_rgba(0,240,176,0.06)]">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.075),rgba(255,255,255,0.016)_38%,rgba(0,240,176,0.075)),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.18))]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rev-green/70 to-transparent" />
      </div>

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[10.5px] uppercase tracking-[0.32em] text-white/38">Velocity model</div>
            <div className="mt-1.5 font-display text-[1.35rem] font-semibold leading-tight text-white">
              {step.label}
            </div>
            <div className="mt-1 text-[12.5px] text-white/48">Passenger-car benchmark path</div>
          </div>

          <div className="min-w-[100px] rounded-2xl border border-rev-green/24 bg-rev-green/[0.085] px-4 py-2.5 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_32px_rgba(0,240,176,0.08)]">
            <div className="font-display text-[2.15rem] font-semibold leading-none tabular-nums text-rev-green">
              {step.days}d
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-[0.22em] text-rev-green/70">to sell</div>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <GaugeMetric
            label="Days saved"
            value={daysSaved === 0 ? "Baseline" : `${daysSaved}d`}
          />
          <GaugeMetric
            label="Margin lift"
            value={marginLift === 0 ? "Baseline" : `+${formatCurrency(marginLift)}`}
          />
          <GaugeMetric
            label="Turnover"
            value={fasterPct === 0 ? "Baseline" : `${fasterPct}% faster`}
          />
        </div>

        <div className="relative mt-4 hidden h-[92px] overflow-hidden rounded-2xl border border-white/[0.06] bg-black/18 px-2 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] sm:block">
          <svg viewBox="0 0 428 148" className="h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="velocityPath" x1="36" y1="116" x2="392" y2="34" gradientUnits="userSpaceOnUse">
                <stop offset="0" stopColor="rgba(255,204,102,0.46)" />
                <stop offset="1" stopColor="#00F0B0" />
              </linearGradient>
              <filter id="velocityGlow" x="-20%" y="-80%" width="140%" height="260%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M 36 116 C 106 116 144 82 214 76 C 286 70 318 40 392 34"
              fill="none"
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="5 8"
            />
            <path
              d={activePath || "M 36 116"}
              fill="none"
              stroke="url(#velocityPath)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              filter="url(#velocityGlow)"
            />
            {points.map((point, index) => {
              const isActive = activeIndex === index;
              return (
                <g key={STEPS[index].label}>
                  <line
                    x1={point.x}
                    x2={point.x}
                    y1={point.y + 14}
                    y2="132"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth="1"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={isActive ? 8 : 5}
                    fill={isActive ? "#00F0B0" : "#0d1117"}
                    stroke={isActive ? "#00F0B0" : "rgba(255,255,255,0.28)"}
                    strokeWidth="2"
                  />
                  {isActive && (
                    <circle
                      cx={point.x}
                      cy={point.y}
                      r="18"
                      fill="none"
                      stroke="rgba(0,240,176,0.2)"
                      strokeWidth="2"
                    />
                  )}
                  <text
                    x={point.x}
                    y="142"
                    textAnchor="middle"
                    fill={isActive ? "#00F0B0" : "rgba(255,255,255,0.42)"}
                    fontSize="10"
                    fontFamily="Inter, sans-serif"
                    fontWeight="700"
                    letterSpacing="1"
                  >
                    {STEPS[index].days}D
                  </text>
                </g>
              );
            })}
            <g transform={`translate(${activePoint.x}, ${activePoint.y})`}>
              <line
                x1="0"
                y1="-22"
                x2="0"
                y2="-7"
                stroke="#00F0B0"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path d="M -5 -24 L 0 -33 L 5 -24 Z" fill="#00F0B0" />
            </g>
          </svg>

          {points.map((point, index) => (
            <button
              key={STEPS[index].label}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Select ${STEPS[index].label}`}
              aria-current={activeIndex === index ? "step" : undefined}
              className="absolute h-14 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rev-green/60"
              style={{
                left: `${(point.x / 428) * 100}%`,
                top: `${(point.y / 148) * 100}%`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function GaugeMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-black/18 px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
      <div className="text-[9px] uppercase tracking-[0.16em] text-white/32">{label}</div>
      <div className="mt-1 font-display text-[14px] font-semibold leading-tight tabular-nums text-white/88">{value}</div>
    </div>
  );
}

function DynamicMetric({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.045] bg-black/10 px-5 py-4">
      <div className={`text-[10.5px] uppercase tracking-[0.28em] ${accent ? "text-rev-green" : "text-white/40"}`}>
        {label}
      </div>
      <div className={`mt-3 font-display text-3xl font-semibold tabular-nums md:text-4xl ${accent ? "text-rev-green" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

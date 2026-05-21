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
const MAX_DAYS = 90;

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

        <div className="mt-5 grid gap-5 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => scrollToStep(activeIndex - 1)}
              disabled={!canGoPrev}
              aria-label="Previous benchmark"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/62 transition hover:border-rev-green/35 hover:bg-rev-green/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToStep(activeIndex + 1)}
              disabled={!canGoNext}
              aria-label="Next benchmark"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/62 transition hover:border-rev-green/35 hover:bg-rev-green/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <Timeline
            activeIndex={activeIndex}
            activeDays={activeStep.days}
            isReady={sectionSeen}
            onSelect={(index) => scrollToStep(index)}
          />

          <div className="text-[10.5px] uppercase tracking-[0.28em] text-white/38 lg:text-right">
            Drag / scroll / swipe - watch the needle move with you.
          </div>
        </div>

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

function Timeline({
  activeIndex,
  activeDays,
  isReady,
  onSelect,
}: {
  activeIndex: number;
  activeDays: number;
  isReady: boolean;
  onSelect: (index: number) => void;
}) {
  const activePosition = (activeDays / MAX_DAYS) * 100;

  return (
    <div className="rounded-[22px] border border-white/[0.075] bg-[rgba(20,22,27,0.46)] px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-[8px]">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/36">
            Timeline ruler
          </div>
          <div className="mt-1 font-display text-lg font-semibold text-white/86">
            0 to 90 days to sell
          </div>
        </div>
        <div className="rounded-full border border-rev-green/20 bg-rev-green/[0.08] px-3 py-1.5 font-display text-sm font-semibold tabular-nums text-rev-green">
          {activeDays}d active
        </div>
      </div>

      <div className="relative h-16 px-2">
        <div className="absolute left-2 right-2 top-7 h-px bg-white/12" />
        <div
          className="absolute left-2 top-7 h-px bg-gradient-to-r from-rev-green via-[#FFB347] to-[#FF4D4D] transition-[width] duration-700 ease-out"
          style={{ width: isReady ? `calc(${activePosition}% - 0.5rem)` : "0%" }}
        />

        {STEPS.map((step, index) => {
          const position = (step.days / MAX_DAYS) * 100;
          const isActive = activeIndex === index;

          return (
            <button
              key={step.label}
              type="button"
              onClick={() => onSelect(index)}
              aria-label={`Select ${step.label}`}
              aria-current={isActive ? "step" : undefined}
              className="absolute top-7 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rev-green/60"
              style={{ left: `${position}%`, color: step.color }}
            >
              <span
                className={`h-3 w-3 rounded-full border transition ${
                  isActive ? "scale-125 bg-current shadow-[0_0_24px_currentColor]" : "bg-[#0A0C10]"
                }`}
              />
              <span className="mt-3 whitespace-nowrap font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-white/48">
                {step.days}d
              </span>
            </button>
          );
        })}

        <div
          className="absolute top-7 h-10 w-px -translate-y-1/2 bg-rev-green transition-[left] duration-500 ease-out"
          style={{ left: `${activePosition}%` }}
          aria-hidden
        >
          <span className="absolute -top-2 left-1/2 h-0 w-0 -translate-x-1/2 border-x-[5px] border-b-[8px] border-x-transparent border-b-rev-green" />
        </div>
      </div>

      <div className="flex justify-between text-[10px] font-semibold uppercase tracking-[0.22em] text-white/30">
        <span>0</span>
        <span>90 days</span>
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

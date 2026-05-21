import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Speedometer from "./Speedometer";

const HEADLINES = [
  "Revving up your revenue.",
  "Turning inventory into cash — faster.",
  "No fixed fees until the car is sold.",
  "If it sits over 60 days, you pay nothing.",
  "Join the pilot program today.",
];

export default function Hero() {
  const [headlineIndex, setHeadlineIndex] = useState(0);
  const [hasScrolled, setHasScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const scrollRaf = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      cancelAnimationFrame(scrollRaf.current);
      scrollRaf.current = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;
        const clamped = Math.min(1, Math.max(0, progress));
        const index = Math.min(HEADLINES.length - 1, Math.floor(clamped * HEADLINES.length));
        setHeadlineIndex(index);
        setScrollProgress(clamped);
        if (clamped > 0.02) setHasScrolled(true);
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("wheel", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("wheel", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(scrollRaf.current);
    };
  }, []);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.setProperty("--mx", `${x * 12}px`);
      el.style.setProperty("--my", `${y * 12}px`);
    };
    el.addEventListener("mousemove", onMove);
    return () => el.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <section
      id="top"
      data-section="hero"
      ref={wrapRef}
      className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28"
      style={{
        background: `radial-gradient(1200px 600px at 50% -10%, rgba(0,240,176,${0.08 + scrollProgress * 0.18}), transparent 60%), linear-gradient(180deg, #0A0C10 0%, #12161F 100%)`,
      }}
    >
      {/* Floating shapes */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-1/4 h-72 w-72 rounded-full bg-rev-green/[0.06] blur-3xl animate-drift-1" />
        <div className="absolute right-[-6rem] top-1/3 h-96 w-96 rounded-full bg-rev-amber/[0.05] blur-3xl animate-drift-2" />
        <div className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage:
              "radial-gradient(ellipse at center, black 30%, transparent 70%)",
          }}
        />
      </div>

      <div className="container relative z-10 grid grid-cols-1 items-center gap-16 py-16 lg:grid-cols-12">
        {/* Left: copy */}
        <div className="lg:col-span-7">
          <div className="reveal mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-[11px] uppercase tracking-wider text-white/70">
            <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-rev-green" />
            Performance pricing · Built for independents
          </div>

          <h1
            className="reveal relative overflow-hidden font-display font-semibold leading-[1.02] tracking-tightest text-balance"
            style={{
              minHeight: "10rem",
              fontSize: "clamp(2.25rem, 5.5vw, 4.75rem)",
              transform: "translate3d(var(--mx,0), var(--my,0), 0)",
              transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1)",
            }}
          >
            {HEADLINES.map((text, i) => (
              <span
                key={text}
                className="absolute left-0 top-0 w-full transition-all duration-500 ease-out"
                style={{
                  opacity: i === headlineIndex ? 1 : 0,
                  transform:
                    i === headlineIndex
                      ? "translateY(0)"
                      : i < headlineIndex
                      ? "translateY(-110%)"
                      : "translateY(110%)",
                }}
              >
                <span className={i % 2 === 0 ? "text-gradient" : "text-gradient-green"}>{text}</span>
              </span>
            ))}
          </h1>

          <div className="reveal relative mt-6 h-7 overflow-hidden font-display text-[14px] uppercase tracking-[0.32em] text-white/55">
            <span className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: hasScrolled ? 0 : 1 }}>
              Scroll to explore the transformation.
            </span>
            <span className="absolute inset-0 transition-opacity duration-700 ease-out" style={{ opacity: hasScrolled ? 1 : 0 }}>
              {HEADLINES[headlineIndex]}
            </span>
          </div>

          <p
            className="reveal mt-6 max-w-xl text-pretty text-[17px] leading-relaxed text-white/65"
            style={{ transitionDelay: "120ms" }}
          >
            <span className="text-white">$0 fixed fees. Pay only a percentage of net profit after the car is sold.</span>{" "}
            If a car sits over 60 days, you pay nothing.
          </p>

          <div
            className="reveal mt-10 flex flex-wrap items-center gap-4"
            style={{ transitionDelay: "220ms" }}
          >
            <a
              href="#pilot"
              data-cursor="hover"
              className="group relative inline-flex h-12 items-center gap-2 overflow-hidden rounded-full bg-rev-green px-7 text-[14px] font-medium text-ink-900 transition-all duration-300 hover:pl-6 hover:pr-8 glow-green"
            >
              <span className="relative z-10">Claim 4‑week pilot at 10% commission</span>
              <ArrowRight className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-0" />
            </a>
            <a
              href="#engine"
              data-cursor="hover"
              className="group inline-flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.02] px-6 text-[14px] text-white/85 transition hover:bg-white/[0.05]"
            >
              See the engine
              <span className="text-white/40 transition group-hover:translate-x-0.5">→</span>
            </a>
          </div>

          {/* Tiny trust strip */}
          <div
            className="reveal mt-14 grid max-w-lg grid-cols-3 gap-4 text-[11px] uppercase tracking-[0.22em] text-white/40"
            style={{ transitionDelay: "320ms" }}
          >
            <div>
              <div className="font-display text-3xl font-semibold tabular-nums text-white">42d</div>
              <div className="mt-1">avg turnover</div>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold tabular-nums text-rev-green">$0</div>
              <div className="mt-1">fixed fees</div>
            </div>
            <div>
              <div className="font-display text-3xl font-semibold tabular-nums text-white">+50%</div>
              <div className="mt-1">volume lift</div>
            </div>
          </div>
        </div>

        {/* Right: tachometer */}
        <div className="reveal lg:col-span-5">
          <div className="relative mx-auto max-w-md">
            <div className="absolute -inset-10 rounded-full bg-rev-green/[0.05] blur-3xl" aria-hidden />
            <div className="relative aspect-square">
              <Speedometer progress={scrollProgress} />
              <div className="pointer-events-none absolute inset-0 animate-spin-slow opacity-[0.6]">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="96"
                    fill="none"
                    stroke="rgba(255,255,255,0.04)"
                    strokeDasharray="2 8"
                  />
                </svg>
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3 text-center text-[11px] uppercase tracking-[0.22em] text-white/45">
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-3">
                <div className="font-display text-base font-semibold text-white/90">Live</div>
                <div className="mt-0.5">market</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-3">
                <div className="font-display text-base font-semibold text-rev-green">AI</div>
                <div className="mt-0.5">pricing</div>
              </div>
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] px-3 py-3">
                <div className="font-display text-base font-semibold text-white/90">Pay</div>
                <div className="mt-0.5">after sale</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll cue */}
      <div
        aria-hidden
        className={`absolute bottom-6 left-1/2 hidden -translate-x-1/2 md:block transition-opacity duration-700 ${hasScrolled ? "opacity-0 pointer-events-none" : "opacity-90"}`}
      >
        <div className="flex flex-col items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-white/40">
          <span>Scroll</span>
          <span className="h-10 w-px bg-gradient-to-b from-white/40 to-transparent" />
        </div>
      </div>
    </section>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";

// Cash Velocity section for Revu landing page.
// Implements the exact timeline, markers, cards, and scroll-triggered animations.
type StatCardProps = {
  target: number;
  prefix?: string;
  suffix?: string;
  label: string;
  color: string;
  isProfit?: boolean;
  format?: (value: number) => string;
};

function useCountUp(target: number, active: boolean, duration = 1500) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    let raf = 0;
    const start = performance.now();

    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, active, duration]);

  return value;
}

const dayToX = (day: number) => 5 + (day / 90) * 90;

export default function ProblemInsight() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(
    () => ({
      currentDays: 64,
      industryDays: 55,
      revuDays: 42,
      daysSaved: 22,
      fasterTurnover: 34,
      extraCars: 5,
      monthlyProfit: 10000,
    }),
    []
  );

  const markerData = useMemo(
    () => [
      {
        id: "current",
        label: "Current",
        days: data.currentDays,
        fill: "#FF4D4D",
        x: dayToX(data.currentDays),
        labelX: dayToX(data.currentDays) + 0,
        delay: "0.2s",
      },
      {
        id: "industry",
        label: "Industry Avg",
        days: data.industryDays,
        fill: "#8E8E93",
        x: dayToX(data.industryDays),
        labelX: dayToX(data.industryDays) - 4,
        delay: "0.35s",
      },
      {
        id: "revu",
        label: "Revu Target",
        days: data.revuDays,
        fill: "#00FFAA",
        x: dayToX(data.revuDays),
        labelX: dayToX(data.revuDays) - 0,
        delay: "0.5s",
      },
    ],
    [data]
  );

  const stats: StatCardProps[] = useMemo(
    () => [
      { target: data.daysSaved, label: "SAVED PER CAR", color: "#00FFAA" },
      { target: data.fasterTurnover, prefix: "-", suffix: "%", label: "FASTER TURNOVER", color: "#FFB347" },
      { target: data.extraCars, prefix: "+", label: "EXTRA CARS / MONTH", color: "#00FFAA" },
      {
        target: data.monthlyProfit,
        prefix: "$",
        label: "ADDITIONAL MONTHLY PROFIT",
        color: "#FFD966",
        format: (value) => value.toLocaleString(),
        isProfit: true,
      },
    ],
    [data]
  );

  const currentX = dayToX(data.currentDays);
  const revuX = dayToX(data.revuDays);
  const startX = Math.min(currentX, revuX);
  const endX = Math.max(currentX, revuX);
  const arrowPath = `M ${currentX} 50 C ${currentX - 2} 20, ${revuX + 2} 20, ${revuX} 50`;

  return (
    <section className="bg-[#0A0C10] py-16 px-8" ref={containerRef}>
      <div className="mx-auto max-w-[1200px]">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className={`transition duration-700 ease-out ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
            <h2
              className="text-[2rem] leading-[1.05] tracking-[-0.03em] font-semibold"
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                backgroundImage: "linear-gradient(90deg, #00FFAA 0%, #FFB347 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                color: "transparent",
              }}
            >
              Cash velocity, visualized
            </h2>
            <p className="mt-6 text-base leading-[1.5] text-[#CCCCCC]" style={{ fontFamily: "Inter, sans-serif" }}>
              Revu turns a 64-day selling cycle into 42 days, outpacing the 55-day industry average and unlocking $10,000 in additional monthly profit.
            </p>

            <div className="mt-10 overflow-hidden rounded-[28px] border border-white/[0.1] bg-[rgba(20,22,27,0.8)] p-6 shadow-[0_30px_60px_rgba(0,0,0,0.18)]">
              <div className="overflow-x-auto">
                <svg
                  width="100%"
                  height="120"
                  viewBox="0 0 100 100"
                  role="img"
                  aria-label="Cash velocity timeline from 0 to 90 days"
                >
                  <line
                    x1="5"
                    x2="95"
                    y1="50"
                    y2="50"
                    stroke="#2A2D35"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="90"
                    strokeDashoffset={isVisible ? 0 : 90}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />

                  {[...Array(10)].map((_, index) => {
                    const x = 5 + index * 10;
                    return (
                      <g key={x}>
                        <line x1={x} y1="44" x2={x} y2="56" stroke="#44484F" strokeWidth="1" />
                        <text
                          x={x}
                          y="70"
                          fill="#CCCCCC"
                          fontSize="4.5"
                          fontFamily="Inter, sans-serif"
                          textAnchor="middle"
                        >
                          {index * 10}
                        </text>
                      </g>
                    );
                  })}

                  <line
                    x1={startX}
                    x2={endX}
                    y1="50"
                    y2="50"
                    stroke="#FFB347"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeDashoffset={isVisible ? 0 : 30}
                    strokeLinecap="round"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out 0.6s, opacity 0.6s ease-out 0.6s" }}
                  />

                  <path
                    d={arrowPath}
                    fill="none"
                    stroke="#FFB347"
                    strokeWidth="2"
                    strokeDasharray="5 5"
                    strokeDashoffset={isVisible ? 0 : 30}
                    strokeLinecap="round"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "stroke-dashoffset 1.2s ease-out 0.6s, opacity 0.6s ease-out 0.6s" }}
                  />

                  <circle
                    cx={currentX}
                    cy="50"
                    r="8"
                    fill="#FF4D4D"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 0.4s ease 0.2s" }}
                  />
                  <circle
                    cx={dayToX(data.industryDays)}
                    cy="50"
                    r="8"
                    fill="#8E8E93"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 0.4s ease 0.35s" }}
                  />
                  <circle
                    cx={revuX}
                    cy="50"
                    r="12"
                    fill="none"
                    stroke="#00FFAA"
                    strokeWidth="2"
                    opacity={isVisible ? 0.45 : 0}
                    style={{ transition: "opacity 0.4s ease 0.5s" }}
                  />
                  <circle
                    cx={revuX}
                    cy="50"
                    r="8"
                    fill="#00FFAA"
                    opacity={isVisible ? 1 : 0}
                    style={{ transition: "opacity 0.4s ease 0.5s" }}
                  />

                  {markerData.map((marker) => (
                    <g key={marker.id} opacity={isVisible ? 1 : 0} style={{ transition: `opacity 0.4s ease ${marker.delay}`, transformOrigin: `${marker.x}px 50px`, transform: isVisible ? "translateY(0)" : "translateY(12px)" }}>
                      <text
                        x={marker.labelX}
                        y="76"
                        fill="#CCCCCC"
                        fontSize="4.8"
                        fontFamily="Inter, sans-serif"
                        textAnchor="middle"
                      >
                        {marker.label}
                      </text>
                      <text
                        x={marker.labelX}
                        y="84"
                        fill="#FFFFFF"
                        fontSize="5.5"
                        fontFamily="'Space Grotesk', sans-serif"
                        fontWeight="700"
                        textAnchor="middle"
                      >
                        {marker.days} days
                      </text>
                    </g>
                  ))}
                </svg>
              </div>

              <p className="mt-4 text-[0.75rem] text-[#888888]">Days to sell (0-90 day horizon)</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} active={isVisible} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatCard({ target, prefix = "", suffix = "", label, color, isProfit, format }: StatCardProps & { active: boolean }) {
  const value = useCountUp(target, true, 1500);
  const displayValue = format ? format(value) : value.toString();

  return (
    <div className="rounded-[20px] border border-white/[0.1] bg-[rgba(20,22,27,0.8)] p-6 text-center">
      <div className="text-[2.5rem] font-semibold" style={{ color, fontFamily: "'Space Grotesk', sans-serif" }}>
        {prefix}
        {displayValue}
        {suffix}
      </div>
      <div className={`mt-3 uppercase tracking-[1px] ${isProfit ? "text-[0.75rem]" : "text-[0.7rem]"} text-[#CCCCCC]`} style={{ fontFamily: "Inter, sans-serif" }}>
        {label}
      </div>
    </div>
  );
}

import { useEffect, useRef } from "react";

/**
 * Subtle desktop-only cursor follower — a soft green glow that lags behind the pointer.
 * Disabled on touch devices and when prefers-reduced-motion is set.
 */
export default function CursorFollower() {
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(hover: none)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isTouch || reduced) return;

    const dot = dotRef.current;
    if (!dot) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let x = mx;
    let y = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };

    const onEnter = (e: Event) => {
      const t = e.target as HTMLElement;
      if (t.closest("a, button, [data-cursor='hover']")) {
        dot.style.transform += " scale(2.2)";
        dot.style.opacity = "0.9";
      }
    };
    const onLeave = () => {
      dot.style.opacity = "0.6";
    };

    const tick = () => {
      x += (mx - x) * 0.18;
      y += (my - y) * 0.18;
      dot.style.transform = `translate3d(${x - 8}px, ${y - 8}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onEnter);
    document.addEventListener("mouseout", onLeave);
    tick();
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onEnter);
      document.removeEventListener("mouseout", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden h-4 w-4 rounded-full md:block"
      style={{
        background: "rgba(0,240,176,0.85)",
        boxShadow: "0 0 24px 6px rgba(0,240,176,0.35)",
        mixBlendMode: "screen",
        opacity: 0.6,
        transition: "opacity 0.25s ease",
      }}
    />
  );
}

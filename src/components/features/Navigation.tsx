import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { cn } from "@/lib/utils";

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, open } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled ? "translate-y-3" : "translate-y-0"
      )}
    >
      <div
        className={cn(
          "mx-auto flex items-center justify-between px-6 transition-all duration-500 sm:px-8",
          scrolled
            ? "mx-3 mt-0 max-w-5xl rounded-full glass-strong py-2.5 sm:mx-auto"
            : "max-w-7xl py-5"
        )}
      >
        <a
          href="#top"
          className="group inline-flex items-center gap-2"
          aria-label="Revu home"
        >
          <span className="relative inline-flex h-7 w-7 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-rev-green/15 blur-md transition group-hover:bg-rev-green/30" />
            <svg viewBox="0 0 24 24" className="relative h-6 w-6" aria-hidden>
              <circle cx="12" cy="12" r="10" stroke="#00F0B0" strokeWidth="1.25" fill="none" />
              <path d="M12 12 L18 7" stroke="#00F0B0" strokeWidth="1.6" strokeLinecap="round" />
              <circle cx="12" cy="12" r="1.6" fill="#00F0B0" />
            </svg>
          </span>
          <span className="font-display text-[17px] font-semibold tracking-tightest">
            Revu
          </span>
        </a>

        <nav className="hidden items-center gap-7 text-[13px] tracking-wider text-mute md:flex">
          <a href="#engine" className="transition hover:text-white">Engine</a>
          <a href="#plan" className="transition hover:text-white">Pay plan</a>
          <a href="#numbers" className="transition hover:text-white">Numbers</a>
          <a href="#services" className="transition hover:text-white">Services</a>
          <a href="#pilot" className="transition hover:text-white">Pilot</a>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={open}
            data-cursor="hover"
            className="relative inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 text-[12.5px] text-white/85 transition hover:bg-white/[0.07]"
            aria-label={`Open cart (${totalItems} items)`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            <span className="tabular-nums">{totalItems}</span>
            {totalItems > 0 && (
              <span className="pointer-events-none absolute -right-1 -top-1 inline-flex h-2 w-2 animate-pulse rounded-full bg-rev-green shadow-[0_0_8px_rgba(0,240,176,0.8)]" />
            )}
          </button>
          <a
            href="#pilot"
            data-cursor="hover"
            className="hidden h-9 items-center rounded-full bg-rev-green px-4 text-[12.5px] font-medium text-ink-900 transition hover:brightness-110 sm:inline-flex"
          >
            Start pilot
          </a>
        </div>
      </div>
    </header>
  );
}

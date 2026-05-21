const NAV_LINKS = [
  { label: "Engine", href: "#engine" },
  { label: "Pay Plan", href: "#plan" },
  { label: "Numbers", href: "#numbers" },
  { label: "Services", href: "#services" },
  { label: "Pilot", href: "#pilot" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer data-section="footer" className="relative border-t border-white/[0.05]">
      {/* Gradient top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline-green" aria-hidden />

      <div className="container py-16 md:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1fr_1fr_1fr]">
          {/* Brand */}
          <div>
            <a href="#top" className="group inline-flex items-center gap-2" aria-label="Revu home">
              <span className="relative inline-flex h-7 w-7 items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-rev-green/15 blur-md transition group-hover:bg-rev-green/30" />
                <svg viewBox="0 0 24 24" className="relative h-6 w-6" aria-hidden>
                  <circle cx="12" cy="12" r="10" stroke="#00F0B0" strokeWidth="1.25" fill="none" />
                  <path d="M12 12 L18 7" stroke="#00F0B0" strokeWidth="1.6" strokeLinecap="round" />
                  <circle cx="12" cy="12" r="1.6" fill="#00F0B0" />
                </svg>
              </span>
              <span className="font-display text-[17px] font-semibold tracking-tightest">Revu</span>
            </a>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-white/40">
              Performance-based inventory management for independent auto dealers. Pay only when
              cars sell.
            </p>
          </div>

          {/* Navigation */}
          <nav aria-label="Footer navigation">
            <p className="mb-4 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/30">
              Navigation
            </p>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[14px] text-white/55 transition hover:text-rev-green"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <p className="mb-4 text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/30">
              Contact
            </p>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <a
                  href="mailto:contact@revu.com"
                  className="text-white/55 transition hover:text-rev-green"
                >
                  contact@revu.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15550000000"
                  className="text-white/55 transition hover:text-white"
                >
                  +1 (555) 000‑0000
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/55 transition hover:text-white"
                  aria-label="Revu on LinkedIn"
                >
                  LinkedIn ↗
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex flex-col items-start justify-between gap-4 border-t border-white/[0.05] pt-6 md:flex-row md:items-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-white/25">
            © {year} Revu — All rights reserved
          </p>
          <div className="flex items-center gap-5 text-[11px] uppercase tracking-[0.18em] text-white/25">
            <a href="#" className="transition hover:text-white/60">Privacy</a>
            <a href="#" className="transition hover:text-white/60">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

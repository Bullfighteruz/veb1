export default function Footer() {
  return (
    <footer data-section="footer" className="relative border-t border-white/[0.05] py-12">
      <section className="container">
        <section className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <section>
            <section className="flex items-center gap-2 text-white/55">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
                <circle cx="12" cy="12" r="10" stroke="#00F0B0" strokeWidth="1.25" fill="none" />
                <path d="M12 12 L18 7" stroke="#00F0B0" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <span className="font-display text-[13px] font-semibold tracking-tightest text-white/80">
                Revu
              </span>
            </section>
            <p className="mt-2 text-[13px] text-white/40">Revving up your revenue.</p>
          </section>

          <section className="flex flex-col gap-2 text-[14px] text-white/55">
            <a href="mailto:contact@revu.com" className="transition hover:text-rev-green">
              contact@revu.com
            </a>
            <a href="tel:+15550000000" className="transition hover:text-white">
              +1 (555) 000-0000
            </a>
            <a href="#" className="transition hover:text-white" aria-label="LinkedIn">
              LinkedIn
            </a>
          </section>

          <p className="text-[11px] uppercase tracking-[0.22em] text-white/30">
            © {new Date().getFullYear()} Revu
          </p>
        </section>
      </section>
    </footer>
  );
}

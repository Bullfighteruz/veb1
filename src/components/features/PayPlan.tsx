const ROWS = [
  { range: "1–10 days", commission: "30%", highlight: true },
  { range: "11–30 days", commission: "20%" },
  { range: "31–60 days", commission: "15%" },
  { range: "60+ days", commission: "$0", zero: true },
];

export default function PayPlan() {
  return (
    <section id="plan" data-section="plan" className="relative py-32 md:py-40">
      <div className="container">
        <div className="mx-auto max-w-3xl text-center reveal">
          <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
            03 — The pay plan
          </p>
          <h2 className="font-display text-balance text-4xl font-semibold leading-[1.05] tracking-tighter md:text-6xl">
            Skin in the game.{" "}
            <span className="text-gradient">Priced by performance.</span>
          </h2>
        </div>

        <div className="mt-16 reveal mx-auto max-w-2xl">
          <div className="overflow-hidden rounded-3xl border border-white/[0.06] glass">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10.5px] uppercase tracking-[0.28em] text-white/40">
                  <th className="px-6 py-4 font-normal">Days to Sell</th>
                  <th className="px-6 py-4 text-right font-normal">Revu Share</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((r) => (
                  <tr
                    key={r.range}
                    className={`border-t border-white/[0.04] ${
                      r.zero ? "bg-rev-green/[0.04]" : ""
                    }`}
                  >
                    <td className="px-6 py-5 text-[15px] text-white/85">{r.range}</td>
                    <td
                      className={`px-6 py-5 text-right font-display text-2xl font-semibold tabular-nums ${
                        r.zero || r.highlight ? "text-rev-green" : "text-white"
                      }`}
                    >
                      {r.commission}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-6 text-center text-[15px] leading-relaxed text-white/60">
            If a car sits over 60 days → <span className="text-rev-green font-medium">$0</span>.
            Full transparency: net profit = sale price − buy price − recon − shipping − fees.
          </p>
        </div>
      </div>
    </section>
  );
}

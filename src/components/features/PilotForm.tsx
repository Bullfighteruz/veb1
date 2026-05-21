import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

type FormState = {
  dealerName: string;
  contactPerson: string;
  email: string;
  phone: string;
};

export default function PilotForm() {
  const [form, setForm] = useState<FormState>({
    dealerName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { items, totalItems, totalPrice, clear } = useCart();

  const cartJson = JSON.stringify(items);

  const valid =
    form.dealerName.trim().length >= 2 &&
    form.contactPerson.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim().length >= 7;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);

    await new Promise((r) => setTimeout(r, 900));

    const lead = {
      dealerName: form.dealerName,
      contactPerson: form.contactPerson,
      email: form.email,
      phone: form.phone,
      cart: items,
      cartTotal: totalPrice,
      createdAt: new Date().toISOString(),
    };

    // REPLACE WITH REAL FORM HANDLER
    console.log("[Revu pilot lead]", lead);

    try {
      const existing = JSON.parse(localStorage.getItem("revu_leads") || "[]");
      existing.push(lead);
      localStorage.setItem("revu_leads", JSON.stringify(existing));
    } catch {
      // ignore quota errors
    }

    setSubmitting(false);
    setDone(true);
    toast.success("We'll call within 24h");
  };

  return (
    <section id="pilot" data-section="pilot" className="relative py-32 md:py-40">
      <section className="container">
        <section className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          <section className="reveal lg:col-span-6">
            <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
              07 — Start your pilot
            </p>
            <h2
              className="font-display font-semibold leading-[1.02] tracking-tightest text-balance"
              style={{ fontSize: "clamp(2.2rem, 5vw, 4rem)" }}
            >
              Start a 4‑week pilot at{" "}
              <span className="text-gradient-green">10% commission.</span>
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-white/60">
              We onboard your inventory, deploy the five‑department engine, and prove the math in
              28 days. If a car sits past 60, you pay $0.
            </p>
          </section>

          <section className="reveal lg:col-span-6">
            <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] glass-strong p-6 md:p-10">
              {!done ? (
                <form onSubmit={onSubmit} className="space-y-5">
                  <input type="hidden" name="cart" value={cartJson} readOnly />

                  <Field
                    id="dealerName"
                    label="Dealer name"
                    value={form.dealerName}
                    onChange={(v) => setForm({ ...form, dealerName: v })}
                    placeholder="Reyes Auto Group"
                    required
                  />
                  <Field
                    id="contactPerson"
                    label="Contact person"
                    value={form.contactPerson}
                    onChange={(v) => setForm({ ...form, contactPerson: v })}
                    placeholder="Marcus Reyes"
                    required
                  />
                  <section className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      id="email"
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => setForm({ ...form, email: v })}
                      placeholder="you@dealership.com"
                      required
                    />
                    <Field
                      id="phone"
                      label="Phone"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => setForm({ ...form, phone: v })}
                      placeholder="(555) 123‑4567"
                      required
                    />
                  </section>

                  {totalItems > 0 && (
                    <section className="rounded-2xl border border-white/5 bg-white/[0.025] p-4 text-[13px]">
                      <section className="mb-2 flex items-center justify-between text-white/60">
                        <span className="text-[11px] uppercase tracking-[0.22em] text-white/40">
                          Pilot loadout
                        </span>
                        <button
                          type="button"
                          onClick={clear}
                          className="text-[11px] uppercase tracking-[0.18em] text-white/40 transition hover:text-white"
                        >
                          Clear
                        </button>
                      </section>
                      <ul className="space-y-1.5">
                        {items.map((i) => (
                          <li key={i.id} className="flex items-center justify-between text-white/75">
                            <span>
                              {i.name} <span className="text-white/35">×{i.qty}</span>
                            </span>
                            <span className="tabular-nums text-white/55">
                              ${(i.price * i.qty).toLocaleString()}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  <button
                    type="submit"
                    disabled={!valid || submitting}
                    data-cursor="hover"
                    className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-rev-green text-[14px] font-medium text-ink-900 transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 glow-green"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>Claim 4‑week pilot at 10% commission</>
                    )}
                  </button>
                </form>
              ) : (
                <section className="flex flex-col items-center justify-center py-10 text-center">
                  <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-rev-green/15 text-rev-green">
                    <Check className="h-7 w-7" />
                  </span>
                  <h3 className="font-display text-3xl font-semibold tracking-tightest">
                    We'll call within 24h
                  </h3>
                  <p className="mt-3 max-w-sm text-[14.5px] text-white/65">
                    A Revu specialist will reach out to schedule your 4‑week pilot onboarding.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDone(false);
                      setForm({ dealerName: "", contactPerson: "", email: "", phone: "" });
                    }}
                    className="mt-8 text-[12px] uppercase tracking-[0.22em] text-white/45 transition hover:text-white"
                  >
                    Submit another
                  </button>
                </section>
              )}
            </section>
          </section>
        </section>
      </section>
    </section>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <section>
      <label
        htmlFor={id}
        className="mb-2 block text-[10.5px] uppercase tracking-[0.28em] text-white/40"
      >
        {label}
        {required && <span className="text-rev-green"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="block h-12 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-[15px] text-white placeholder:text-white/30 outline-none transition focus:border-rev-green/40 focus:bg-white/[0.04] focus:ring-2 focus:ring-rev-green/20"
      />
    </section>
  );
}

import { useState } from "react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import { Loader2, Check, ShoppingBag, AlertCircle } from "lucide-react";

type FormState = {
  dealerName: string;
  contactPerson: string;
  email: string;
  phone: string;
};

type FieldError = Partial<Record<keyof FormState, string>>;

function validateForm(form: FormState): FieldError {
  const errors: FieldError = {};
  if (form.dealerName.trim().length < 2)
    errors.dealerName = "Dealer name must be at least 2 characters";
  if (form.contactPerson.trim().length < 2)
    errors.contactPerson = "Contact name must be at least 2 characters";
  if (!/\S+@\S+\.\S+/.test(form.email))
    errors.email = "Please enter a valid email address";
  if (form.phone.replace(/\D/g, "").length < 7)
    errors.phone = "Please enter a valid phone number";
  return errors;
}

export default function PilotForm() {
  const [form, setForm] = useState<FormState>({
    dealerName: "",
    contactPerson: "",
    email: "",
    phone: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const { items, totalItems, totalPrice, clear } = useCart();

  const errors = validateForm(form);
  const valid = Object.keys(errors).length === 0;

  const touch = (field: keyof FormState) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const update = (field: keyof FormState, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all fields as touched to show all errors
    setTouched({ dealerName: true, contactPerson: true, email: true, phone: true });
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

    // ─── BACKEND INTEGRATION POINT ──────────────────────────────────────────
    // Replace this block with your real API call, e.g.:
    //   await fetch("/api/leads", { method: "POST", body: JSON.stringify(lead) })
    // Or integrate with HubSpot, Salesforce, or any CRM webhook here.
    console.log("[Revu pilot lead]", lead);
    // ────────────────────────────────────────────────────────────────────────

    try {
      const existing = JSON.parse(localStorage.getItem("revu_leads") || "[]");
      existing.push(lead);
      localStorage.setItem("revu_leads", JSON.stringify(existing));
    } catch {
      // Ignore storage quota errors gracefully
    }

    setSubmitting(false);
    setDone(true);
    clear(); // Reset cart after successful submission
    toast.success("We'll call within 24h — watch your inbox.");
  };

  return (
    <section id="pilot" data-section="pilot" className="relative py-28 md:py-36 section-glow-top">
      {/* Background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[400px] w-[700px] -translate-x-1/2 rounded-full opacity-[0.055] blur-3xl"
        style={{ background: "radial-gradient(ellipse, #00F0B0, transparent 70%)" }}
      />

      <div className="container">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Left: pitch */}
          <div className="reveal lg:col-span-6">
            <p className="mb-5 text-[11px] uppercase tracking-[0.32em] text-white/40">
              07 — Start your pilot
            </p>
            <h2
              className="font-display font-semibold leading-[1.02] tracking-tightest text-balance"
              style={{ fontSize: "clamp(2.2rem, 4.5vw, 3.75rem)" }}
            >
              Start a 4‑week pilot at{" "}
              <span className="text-gradient-green">10% commission.</span>
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-white/60">
              We onboard your inventory, deploy the five‑department engine, and prove the math
              in 28 days. If a car sits past 60 days, you pay $0.
            </p>

            {/* Value bullets */}
            <ul className="mt-8 space-y-3">
              {[
                "Zero fixed fees — pay only when a car sells",
                "Full 5-department engine from day one",
                "Dedicated onboarding specialist assigned to you",
                "Cancel any time after the pilot period",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-[14px] text-white/65">
                  <span className="mt-1 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-rev-green/15">
                    <Check className="h-2.5 w-2.5 text-rev-green" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Cart summary if items */}
            {totalItems > 0 && (
              <div className="mt-8 flex items-center gap-3 rounded-2xl border border-rev-green/15 bg-rev-green/[0.05] px-5 py-3.5">
                <ShoppingBag className="h-4 w-4 flex-shrink-0 text-rev-green" />
                <p className="text-[13px] text-white/70">
                  You have{" "}
                  <span className="font-semibold text-white">{totalItems} optional service{totalItems > 1 ? "s" : ""}</span>{" "}
                  in your loadout —{" "}
                  <span className="font-semibold text-rev-green">${totalPrice.toLocaleString()} est.</span>
                </p>
              </div>
            )}
          </div>

          {/* Right: form */}
          <div className="reveal reveal-d2 lg:col-span-6">
            <div className="relative overflow-hidden rounded-[28px] border border-white/[0.07] glass-strong p-7 md:p-10 shadow-card-dark">
              {/* Top hairline */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px hairline-green" aria-hidden />

              {!done ? (
                <form onSubmit={onSubmit} className="space-y-5" noValidate>
                  <input type="hidden" name="cart" value={JSON.stringify(items)} readOnly />

                  <Field
                    id="dealerName"
                    label="Dealer name"
                    value={form.dealerName}
                    onChange={(v) => update("dealerName", v)}
                    onBlur={() => touch("dealerName")}
                    placeholder="Reyes Auto Group"
                    error={touched.dealerName ? errors.dealerName : undefined}
                    required
                  />
                  <Field
                    id="contactPerson"
                    label="Contact person"
                    value={form.contactPerson}
                    onChange={(v) => update("contactPerson", v)}
                    onBlur={() => touch("contactPerson")}
                    placeholder="Marcus Reyes"
                    error={touched.contactPerson ? errors.contactPerson : undefined}
                    required
                  />
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      id="email"
                      label="Email"
                      type="email"
                      value={form.email}
                      onChange={(v) => update("email", v)}
                      onBlur={() => touch("email")}
                      placeholder="you@dealership.com"
                      error={touched.email ? errors.email : undefined}
                      required
                    />
                    <Field
                      id="phone"
                      label="Phone"
                      type="tel"
                      value={form.phone}
                      onChange={(v) => update("phone", v)}
                      onBlur={() => touch("phone")}
                      placeholder="(555) 123‑4567"
                      hint="US or international format"
                      error={touched.phone ? errors.phone : undefined}
                      required
                    />
                  </div>

                  {/* Cart loadout in form */}
                  {totalItems > 0 && (
                    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-[13px]">
                      <div className="mb-3 flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/40">
                          Pilot loadout
                        </span>
                        <button
                          type="button"
                          onClick={clear}
                          className="text-[11px] uppercase tracking-[0.18em] text-white/35 transition hover:text-white"
                        >
                          Clear all
                        </button>
                      </div>
                      <ul className="space-y-2">
                        {items.map((i) => (
                          <li key={i.id} className="flex items-center justify-between">
                            <span className="text-white/65">
                              {i.name}{" "}
                              <span className="text-white/30">× {i.qty}</span>
                            </span>
                            <span className="tabular-nums text-white/55 font-display">
                              ${(i.price * i.qty).toLocaleString()}
                            </span>
                          </li>
                        ))}
                        <li className="flex items-center justify-between border-t border-white/[0.06] pt-2 mt-2">
                          <span className="text-[11px] uppercase tracking-wider text-white/40">
                            Est. total
                          </span>
                          <span className="font-display font-semibold tabular-nums text-rev-green">
                            ${totalPrice.toLocaleString()}
                          </span>
                        </li>
                      </ul>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    data-cursor="hover"
                    className="group relative inline-flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-rev-green text-[14px] font-semibold text-ink-900 transition-all duration-300 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 glow-green-intense"
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

                  <p className="text-center text-[11px] text-white/30">
                    By submitting, you agree to be contacted by a Revu specialist within 24 hours.
                  </p>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <span className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-rev-green/15 text-rev-green shadow-[0_0_32px_rgba(0,240,176,0.2)]">
                    <Check className="h-8 w-8" />
                  </span>
                  <h3 className="font-display text-3xl font-semibold tracking-tightest">
                    We'll call within 24h
                  </h3>
                  <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-white/60">
                    A Revu specialist will reach out to schedule your 4‑week pilot onboarding.
                    Check your inbox for a confirmation.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setDone(false);
                      setForm({ dealerName: "", contactPerson: "", email: "", phone: "" });
                      setTouched({});
                    }}
                    className="mt-10 text-[12px] uppercase tracking-[0.22em] text-white/40 transition hover:text-white"
                  >
                    Submit another dealer
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Field component with inline validation ───────────────────────────────────
function Field({
  id,
  label,
  value,
  onChange,
  onBlur,
  type = "text",
  placeholder,
  hint,
  error,
  required,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  type?: string;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}) {
  const hasError = !!error;

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.28em] text-white/40"
      >
        {label}
        {required && <span className="ml-0.5 text-rev-green">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-describedby={hasError ? `${id}-error` : hint ? `${id}-hint` : undefined}
        aria-invalid={hasError}
        className={`block h-12 w-full rounded-xl border bg-white/[0.025] px-4 text-[15px] text-white placeholder:text-white/25 outline-none transition-all duration-200 ${
          hasError
            ? "border-red-500/50 focus:border-red-400/70 focus:ring-2 focus:ring-red-500/20"
            : "border-white/[0.07] focus:border-rev-green/50 focus:bg-white/[0.04] focus:ring-2 focus:ring-rev-green/15"
        }`}
      />
      {hasError ? (
        <div
          id={`${id}-error`}
          role="alert"
          className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-red-400"
        >
          <AlertCircle className="h-3 w-3 flex-shrink-0" />
          {error}
        </div>
      ) : hint ? (
        <div id={`${id}-hint`} className="mt-1.5 text-[11px] text-white/30">
          {hint}
        </div>
      ) : null}
    </div>
  );
}

import { useEffect } from "react";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/hooks/useCart";

export default function CartDrawer() {
  const { isOpen, close, items, setQty, totalPrice, clear } = useCart();

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, close]);

  return (
    <div
      className={`fixed inset-0 z-[80] transition-opacity duration-300 ${
        isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label="Close cart"
        onClick={close}
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
      />
      <aside
        role="dialog"
        aria-label="Pilot loadout"
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-white/[0.06] bg-ink-900 transition-transform duration-500 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-rev-green" />
            <div className="font-display text-[15px] font-semibold tracking-tight">
              Pilot loadout
            </div>
          </div>
          <button
            onClick={close}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.02] text-white/70 transition hover:bg-white/[0.08]"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center py-20 text-center">
              <div className="font-display text-3xl font-semibold tracking-tightest text-white/70">
                Empty.
              </div>
              <p className="mt-3 max-w-xs text-[14px] text-white/45">
                Add services from the engine or services rail to assemble your pilot.
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li
                  key={i.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-white/[0.05] bg-white/[0.02] p-4"
                >
                  <div>
                    <div className="font-display text-[15px] font-semibold tracking-tight">
                      {i.name}
                    </div>
                    <div className="mt-0.5 text-[11.5px] uppercase tracking-[0.2em] text-white/40">
                      ${i.price.toLocaleString()} · {i.unit}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="tabular-nums font-display text-[15px] font-semibold text-rev-green">
                      ${(i.price * i.qty).toLocaleString()}
                    </div>
                    <div className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.02]">
                      <button
                        onClick={() => setQty(i.id, i.qty - 1)}
                        className="inline-flex h-7 w-7 items-center justify-center text-white/70 transition hover:text-white"
                        aria-label="Decrease"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-[12.5px] tabular-nums">{i.qty}</span>
                      <button
                        onClick={() => setQty(i.id, i.qty + 1)}
                        className="inline-flex h-7 w-7 items-center justify-center text-white/70 transition hover:text-white"
                        aria-label="Increase"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <footer className="border-t border-white/[0.06] px-6 py-5">
          <div className="mb-4 flex items-end justify-between">
            <div className="text-[11px] uppercase tracking-[0.28em] text-white/40">
              Subtotal
            </div>
            <div className="font-display text-3xl font-semibold tabular-nums">
              ${totalPrice.toLocaleString()}
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={clear}
              className="h-11 flex-1 rounded-full border border-white/10 bg-white/[0.02] text-[13px] text-white/70 transition hover:bg-white/[0.06]"
            >
              Clear Cart
            </button>
            <a
              href="#pilot"
              onClick={close}
              className="inline-flex h-11 flex-[2] items-center justify-center rounded-full bg-rev-green text-[13px] font-medium text-ink-900 transition hover:brightness-110 glow-green"
            >
              Proceed to Pilot Request
            </a>
          </div>
        </footer>
      </aside>
    </div>
  );
}

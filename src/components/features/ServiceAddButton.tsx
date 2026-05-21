import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type ServicePayload = {
  id: string;
  name: string;
  price: number;
  unit: string;
  priceLabel: string;
  qtyLabel?: string;
  defaultQty?: number;
  minQty?: number;
  maxQty?: number;
};

type Props = {
  service: ServicePayload;
  className?: string;
  variant?: "dark" | "light";
};

export default function ServiceAddButton({
  service,
  className = "",
  variant = "dark",
}: Props) {
  const { add, open } = useCart();
  const [qty, setQty] = useState(service.defaultQty ?? 1);
  const [openPopover, setOpenPopover] = useState(false);

  const min = service.minQty ?? 1;
  const max = service.maxQty ?? 99;
  const qtyLabel = service.qtyLabel ?? "Quantity";

  const confirm = () => {
    add(
      {
        id: service.id,
        name: service.name,
        price: service.price,
        unit: service.unit,
      },
      qty
    );
    setOpenPopover(false);
    open();
    toast.success(`${service.name} added`, {
      description: `${qty} × ${service.priceLabel}`,
    });
  };

  const btnClass =
    variant === "light"
      ? "inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-medium text-ink-900 transition hover:bg-rev-green active:scale-95"
      : "inline-flex h-10 items-center gap-2 rounded-full bg-rev-green px-4 text-[13px] font-medium text-ink-900 transition hover:brightness-110 active:scale-95";

  return (
    <Popover open={openPopover} onOpenChange={setOpenPopover}>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-cursor="hover"
          aria-label={`Add ${service.name}`}
          className={`${btnClass} ${className}`}
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-64 border-white/10 bg-ink-800/95 text-white backdrop-blur-xl"
      >
        <p className="font-display text-[15px] font-semibold">{service.name}</p>
        <p className="mt-0.5 text-[12px] text-white/50">{service.priceLabel}</p>
        <label className="mt-4 block text-[10px] uppercase tracking-[0.24em] text-white/40">
          {qtyLabel}
        </label>
        <div className="mt-2 inline-flex items-center rounded-full border border-white/10 bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(min, q - 1))}
            className="inline-flex h-9 w-9 items-center justify-center text-white/70 transition hover:text-white"
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-[2.5rem] text-center font-display text-lg tabular-nums">
            {qty}
          </span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(max, q + 1))}
            className="inline-flex h-9 w-9 items-center justify-center text-white/70 transition hover:text-white"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
        <button
          type="button"
          onClick={confirm}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-full bg-rev-green text-[13px] font-medium text-ink-900 transition hover:brightness-110"
        >
          Add to cart
        </button>
      </PopoverContent>
    </Popover>
  );
}

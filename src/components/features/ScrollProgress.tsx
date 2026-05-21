import { useScrollProgress } from "@/hooks/useScrollProgress";

export default function ScrollProgress() {
  const p = useScrollProgress();
  return (
    <div
      aria-hidden
      className="fixed left-0 top-0 z-[90] h-px w-full bg-transparent"
    >
      <div
        className="h-full origin-left bg-rev-green"
        style={{
          transform: `scaleX(${p})`,
          transition: "transform 0.08s linear",
          boxShadow: "0 0 12px rgba(0,240,176,0.5)",
        }}
      />
    </div>
  );
}

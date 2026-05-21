import { useEffect, useRef, useState } from "react";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function getSpeedLabel(percent: number) {
  if (percent >= 100) return "Full power! Claim your 4‑week pilot now";
  if (percent >= 81) return "Almost there – ready to claim pilot";
  if (percent >= 61) return "Near full throttle – your profit gains visibility";
  if (percent >= 41) return "Accelerating – you're seeing the engine";
  return "Starting boost – discover how Revu works";
}

const CANVAS_BASE = 240;
const START_PERCENT = 30;
const MAX_PERCENT = 100;

export default function Speedometer({ progress = 0 }: { progress?: number }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef(0);
  const targetRef = useRef(START_PERCENT);
  const currentRef = useRef(START_PERCENT);
  const [displayPercent, setDisplayPercent] = useState(START_PERCENT);

  const targetPercent = clamp(START_PERCENT + progress * (MAX_PERCENT - START_PERCENT), START_PERCENT, MAX_PERCENT);

  useEffect(() => {
    targetRef.current = targetPercent;
  }, [targetPercent]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = CANVAS_BASE * dpr;
    canvas.height = CANVAS_BASE * dpr;
    canvas.style.width = "100%";
    canvas.style.height = "auto";

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const drawFrame = (percent: number) => {
      const size = CANVAS_BASE;
      const center = size / 2;
      const radius = 102;
      const baseAngle = (-120 * Math.PI) / 180;
      const sweep = (240 * Math.PI) / 180;
      const angle = baseAngle + (percent / 100) * sweep;

      ctx.clearRect(0, 0, size, size);

      const glow = ctx.createRadialGradient(center, center, radius * 0.15, center, center, radius * 1.2);
      glow.addColorStop(0, "rgba(0,255,170,0.22)");
      glow.addColorStop(0.65, "rgba(0,255,170,0.05)");
      glow.addColorStop(1, "rgba(0,255,170,0)");
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(center, center, radius * 1.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.fillStyle = "rgba(5, 8, 15, 0.55)";
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(center, center, radius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(255,255,255,0.12)";
      ctx.beginPath();
      ctx.arc(center, center, radius, baseAngle, baseAngle + sweep);
      ctx.stroke();
      ctx.restore();

      const trackGradient = ctx.createLinearGradient(0, 0, size, size);
      trackGradient.addColorStop(0, "rgba(0,255,170,0.65)");
      trackGradient.addColorStop(0.45, "rgba(0,255,170,0.42)");
      trackGradient.addColorStop(1, "rgba(255,255,255,0.95)");

      ctx.save();
      ctx.strokeStyle = trackGradient;
      ctx.lineWidth = 12;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.arc(center, center, radius, baseAngle, angle);
      ctx.stroke();
      ctx.restore();

      for (let i = 0; i <= 20; i += 1) {
        const tickAngle = baseAngle + (sweep * i) / 20;
        const inner = radius - (i % 5 === 0 ? 14 : 10);
        const outer = radius + 4;
        const startX = center + Math.cos(tickAngle) * inner;
        const startY = center + Math.sin(tickAngle) * inner;
        const endX = center + Math.cos(tickAngle) * outer;
        const endY = center + Math.sin(tickAngle) * outer;
        ctx.strokeStyle = i % 5 === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)";
        ctx.lineWidth = i % 5 === 0 ? 2 : 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }

      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle);
      ctx.strokeStyle = "#00FFAA";
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(-12, 0);
      ctx.lineTo(radius - 18, 0);
      ctx.stroke();

      ctx.fillStyle = "rgba(0,255,170,0.95)";
      ctx.beginPath();
      ctx.arc(radius - 18, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = "rgba(0,255,170,0.95)";
      ctx.shadowColor = "rgba(0,255,170,0.35)";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(center, center, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    drawFrame(currentRef.current);

    const animate = (now: number) => {
      if (!lastFrameRef.current) lastFrameRef.current = now;
      const elapsed = now - lastFrameRef.current;
      if (elapsed >= 16) {
        lastFrameRef.current = now;
        const target = targetRef.current;
        const current = currentRef.current;
        const delta = target - current;
        const step = Math.sign(delta) * Math.min(Math.abs(delta), Math.max(0.15, Math.abs(delta) * 0.18));
        const next = Math.abs(delta) < 0.12 ? target : current + step;
        currentRef.current = next;
        setDisplayPercent(Math.round(next));
        drawFrame(next);
      }
      rafRef.current = window.requestAnimationFrame(animate);
    };

    rafRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = CANVAS_BASE * dpr;
      canvas.height = CANVAS_BASE * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawCanvas(canvas, currentRef.current);
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const drawCanvas = (canvas: HTMLCanvasElement, percent: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const size = CANVAS_BASE;
    const center = size / 2;
    const radius = 102;
    const baseAngle = (-120 * Math.PI) / 180;
    const sweep = (240 * Math.PI) / 180;
    const angle = baseAngle + (percent / 100) * sweep;

    ctx.clearRect(0, 0, size, size);

    const glow = ctx.createRadialGradient(center, center, radius * 0.15, center, center, radius * 1.2);
    glow.addColorStop(0, "rgba(0,255,170,0.22)");
    glow.addColorStop(0.65, "rgba(0,255,170,0.05)");
    glow.addColorStop(1, "rgba(0,255,170,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(center, center, radius * 1.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.save();
    ctx.fillStyle = "rgba(5, 8, 15, 0.55)";
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, radius + 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(255,255,255,0.12)";
    ctx.beginPath();
    ctx.arc(center, center, radius, baseAngle, baseAngle + sweep);
    ctx.stroke();
    ctx.restore();

    const trackGradient = ctx.createLinearGradient(0, 0, size, size);
    trackGradient.addColorStop(0, "rgba(0,255,170,0.65)");
    trackGradient.addColorStop(0.45, "rgba(0,255,170,0.42)");
    trackGradient.addColorStop(1, "rgba(255,255,255,0.95)");

    ctx.save();
    ctx.strokeStyle = trackGradient;
    ctx.lineWidth = 12;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(center, center, radius, baseAngle, angle);
    ctx.stroke();
    ctx.restore();

    for (let i = 0; i <= 20; i += 1) {
      const tickAngle = baseAngle + (sweep * i) / 20;
      const inner = radius - (i % 5 === 0 ? 14 : 10);
      const outer = radius + 4;
      const startX = center + Math.cos(tickAngle) * inner;
      const startY = center + Math.sin(tickAngle) * inner;
      const endX = center + Math.cos(tickAngle) * outer;
      const endY = center + Math.sin(tickAngle) * outer;
      ctx.strokeStyle = i % 5 === 0 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.45)";
      ctx.lineWidth = i % 5 === 0 ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(startX, startY);
      ctx.lineTo(endX, endY);
      ctx.stroke();
    }

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(angle);
    ctx.strokeStyle = "#00FFAA";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(radius - 18, 0);
    ctx.stroke();

    ctx.fillStyle = "rgba(0,255,170,0.95)";
    ctx.beginPath();
    ctx.arc(radius - 18, 0, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(0,255,170,0.95)";
    ctx.shadowColor = "rgba(0,255,170,0.35)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(center, center, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    drawCanvas(canvas, currentRef.current);
  }, []);

  const labelText = getSpeedLabel(Math.round(displayPercent));

  return (
    <div className="relative mx-auto max-w-[260px] w-full rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-[0_28px_80px_rgba(0,0,0,0.24)] backdrop-blur-xl">
      <div className="relative overflow-hidden rounded-[22px] bg-black/20 p-4">
        <canvas ref={canvasRef} className="mx-auto block max-w-full" width={CANVAS_BASE} height={CANVAS_BASE} />
      </div>
      <div className="mt-5 text-center">
        <div className="text-[32px] font-display font-semibold tracking-[-0.03em] text-white">{Math.round(displayPercent)}%</div>
        <div className="mt-2 text-sm leading-6 text-white/70">{labelText}</div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";

// The margins take ink: drag on empty paper (mouse or pen only) and the page
// takes a ballpoint line that dries and fades a few seconds later. Strokes
// live in document coordinates, so they scroll with the paper.

type Point = { x: number; y: number; w: number };
type InkStroke = { points: Point[]; color: string; ended: number | null };

const HOLD_MS = 2600;
const FADE_MS = 1400;
const BLOCKED = "a,button,input,textarea,select,label,summary,[contenteditable],[role=button],[data-no-doodle],p,h1,h2,h3,h4,li,span,svg,img,cursor-avatar,canvas";

function isPaper(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target.closest(BLOCKED)) return false;
  return true;
}

export function PaperDoodles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const fine = window.matchMedia("(pointer: fine)");

    const strokes: InkStroke[] = [];
    let active: InkStroke | null = null;
    let frame = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      schedule();
    };

    const render = (now: number) => {
      frame = 0;
      ctx.setTransform(dpr, 0, 0, dpr, 0, -window.scrollY * dpr);
      ctx.clearRect(0, window.scrollY, window.innerWidth, window.innerHeight);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      for (let i = strokes.length - 1; i >= 0; i--) {
        const s = strokes[i];
        const age = s.ended == null ? 0 : now - s.ended;
        if (age > HOLD_MS + FADE_MS) {
          strokes.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = age < HOLD_MS ? 0.92 : 0.92 * (1 - (age - HOLD_MS) / FADE_MS);
        ctx.strokeStyle = s.color;
        const pts = s.points;
        for (let j = 1; j < pts.length; j++) {
          const a = pts[j - 1];
          const b = pts[j];
          const prev = pts[j - 2] ?? a;
          ctx.lineWidth = (a.w + b.w) / 2;
          ctx.beginPath();
          ctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
          ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
          ctx.stroke();
        }
      }
      if (strokes.length) schedule();
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType === "touch" || !fine.matches) return;
      if (!isPaper(e.target)) return;
      e.preventDefault();
      const color = getComputedStyle(document.body).color;
      active = { points: [{ x: e.pageX, y: e.pageY, w: 1.4 }], color, ended: null };
      strokes.push(active);
      document.documentElement.style.cursor = "crosshair";
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      if (!active) return;
      const last = active.points[active.points.length - 1];
      const dist = Math.hypot(e.pageX - last.x, e.pageY - last.y);
      if (dist < 1.5) return;
      // Ballpoints lay down less ink the faster they move.
      const w = Math.max(0.7, Math.min(1.8, 2.1 - dist * 0.05));
      active.points.push({ x: e.pageX, y: e.pageY, w: last.w * 0.6 + w * 0.4 });
      schedule();
    };

    const onUp = () => {
      if (!active) return;
      active.ended = performance.now();
      active = null;
      document.documentElement.style.cursor = "";
      schedule();
    };

    resize();
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", schedule);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 h-full w-full"
    />
  );
}

"use client";

import { useEffect, useRef } from "react";

// The margins take ink: drag on empty paper (mouse or pen only) and the page
// takes a ballpoint line that dries and fades a few seconds later. Strokes
// live in document coordinates, so they scroll with the paper. Over empty
// paper the cursor turns into a pen, which is the only invitation.

// w: line width, ink: how much ink the ball laid down (1 = full, lower = starved).
type Point = { x: number; y: number; w: number; ink: number };
type InkStroke = { points: Point[]; color: string; ended: number | null };

const HOLD_MS = 2600;
const FADE_MS = 1400;
const DRY_MS = 500;
const BLOCKED = "a,button,input,textarea,select,label,summary,[contenteditable],[role=button],[data-no-doodle],p,h1,h2,h3,h4,li,span,svg,img,cursor-avatar,canvas";

function isPaper(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target.closest(BLOCKED)) return false;
  return true;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Resolve any CSS color (oklch included) to rgb() so it survives inside an SVG data URI. */
function toRgb(color: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return color;
  x.fillStyle = color;
  x.fillRect(0, 0, 1, 1);
  const [r, g, b] = x.getImageData(0, 0, 1, 1).data;
  return `rgb(${r},${g},${b})`;
}

/** A small ballpoint, tip at the bottom-left hotspot. */
function penCursor(ink: string, paper: string) {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='${ink}' stroke-width='1.1' stroke-linejoin='round' stroke-linecap='round'><path d='M3.6 17.2 16.4 4.4a1.9 1.9 0 0 1 2.7 0l.5.5a1.9 1.9 0 0 1 0 2.7L6.8 20.4Z' fill='${paper}'/><path d='m3.6 17.2-.9 4.1 4.1-.9M14.5 6.3l3.2 3.2'/><circle cx='2.7' cy='21.3' r='.7' fill='${ink}' stroke='none'/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") 2 22, crosshair`;
}

/** Paper tooth the ball skips over: mostly clean, a few pits that take no ink. */
function grainTile() {
  const size = 96;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const x = c.getContext("2d");
  if (!x) return null;
  const img = x.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const r = Math.random();
    img.data[i + 3] = r < 0.07 ? 150 + Math.random() * 105 : r * 46;
  }
  x.putImageData(img, 0, 0);
  return c;
}

export function PaperDoodles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    // Each stroke is laid down opaque on a scratch layer, pitted by the grain,
    // then composited with its own opacity, so overlapping segments never bead.
    const layer = document.createElement("canvas");
    const lctx = layer.getContext("2d");
    const tile = grainTile();
    if (!canvas || !ctx || !lctx || !tile) return;
    const fine = window.matchMedia("(pointer: fine)");
    const grain = lctx.createPattern(tile, "repeat");

    const strokes: InkStroke[] = [];
    let active: InkStroke | null = null;
    let pen = { x: 0, y: 0, t: 0, v: 0 };
    let frame = 0;
    let dpr = 1;
    let hovering = false;
    let lastTarget: EventTarget | null = null;
    let cursorKey = "";
    let cursor = "";

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = layer.width = Math.round(window.innerWidth * dpr);
      canvas.height = layer.height = Math.round(window.innerHeight * dpr);
      // One grain cell per device pixel, whatever the zoom.
      grain?.setTransform(new DOMMatrix().scale(1 / dpr));
      schedule();
    };

    const drawStroke = (s: InkStroke) => {
      const top = window.scrollY;
      const pts = s.points;
      lctx.setTransform(dpr, 0, 0, dpr, 0, -top * dpr);
      lctx.globalCompositeOperation = "source-over";
      lctx.globalAlpha = 1;
      lctx.clearRect(0, top, window.innerWidth, window.innerHeight);
      lctx.lineCap = "round";
      lctx.lineJoin = "round";
      lctx.strokeStyle = lctx.fillStyle = s.color;

      // The ball rests a moment before it moves: a small gob where the pen landed.
      lctx.beginPath();
      lctx.arc(pts[0].x, pts[0].y, pts[0].w * 0.62, 0, Math.PI * 2);
      lctx.fill();

      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        const prev = pts[j - 2] ?? a;
        lctx.lineWidth = (a.w + b.w) / 2;
        lctx.beginPath();
        lctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
        lctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        lctx.stroke();
      }

      // Fast passages starve the ball: lift ink out where it ran thin.
      lctx.globalCompositeOperation = "destination-out";
      lctx.lineCap = "butt";
      for (let j = 1; j < pts.length; j++) {
        const a = pts[j - 1];
        const b = pts[j];
        const thin = 1 - (a.ink + b.ink) / 2;
        if (thin < 0.04) continue;
        const prev = pts[j - 2] ?? a;
        lctx.globalAlpha = thin;
        lctx.lineWidth = Math.max(a.w, b.w) + 1;
        lctx.beginPath();
        lctx.moveTo((prev.x + a.x) / 2, (prev.y + a.y) / 2);
        lctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
        lctx.stroke();
      }

      if (grain) {
        lctx.globalAlpha = 1;
        lctx.fillStyle = grain;
        lctx.fillRect(0, top, window.innerWidth, window.innerHeight);
      }
    };

    const render = (now: number) => {
      frame = 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = strokes.length - 1; i >= 0; i--) {
        const s = strokes[i];
        const age = s.ended == null ? 0 : now - s.ended;
        if (age > HOLD_MS + FADE_MS) {
          strokes.splice(i, 1);
          continue;
        }
        // Wet ink sits a touch darker, then dries into the page and fades out.
        const dried = 1 - 0.12 * clamp(age / DRY_MS, 0, 1);
        ctx.globalAlpha = age < HOLD_MS ? dried : dried * (1 - (age - HOLD_MS) / FADE_MS);
        drawStroke(s);
        ctx.drawImage(layer, 0, 0);
      }
      if (strokes.length) schedule();
    };

    function schedule() {
      if (!frame) frame = requestAnimationFrame(render);
    }

    const setHover = (on: boolean) => {
      if (on === hovering) return;
      hovering = on;
      if (on) {
        const body = getComputedStyle(document.body);
        const key = `${body.color}|${body.backgroundColor}`;
        if (key !== cursorKey) {
          cursorKey = key;
          cursor = penCursor(toRgb(body.color), toRgb(body.backgroundColor));
        }
      }
      document.documentElement.style.cursor = on ? cursor : "";
    };

    const addPoint = (e: PointerEvent) => {
      if (!active) return;
      const dt = Math.max(e.timeStamp - pen.t, 1);
      // A hand drags the pen a beat behind the pointer; that lag smooths mouse jitter.
      const x = pen.x + (e.pageX - pen.x) * 0.55;
      const y = pen.y + (e.pageY - pen.y) * 0.55;
      const dist = Math.hypot(x - pen.x, y - pen.y);
      if (dist < 0.8) return;
      const v = pen.v * 0.7 + (dist / dt) * 0.3;
      pen = { x, y, t: e.timeStamp, v };
      // Ballpoints lay down a thinner, fainter line the faster they move.
      let w = clamp(1.65 - v * 0.3, 0.8, 1.65);
      if (e.pointerType === "pen" && e.pressure > 0) w *= 0.55 + e.pressure * 0.9;
      const ink = clamp(1.2 - v * 0.28, 0.4, 1);
      const last = active.points[active.points.length - 1];
      active.points.push({ x, y, w: last.w * 0.65 + w * 0.35, ink: last.ink * 0.6 + ink * 0.4 });
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.pointerType === "touch" || !fine.matches) return;
      if (!isPaper(e.target)) return;
      e.preventDefault();
      const color = getComputedStyle(document.body).color;
      pen = { x: e.pageX, y: e.pageY, t: e.timeStamp, v: 0 };
      const w = e.pointerType === "pen" && e.pressure > 0 ? 1.4 * (0.55 + e.pressure * 0.9) : 1.8;
      active = { points: [{ x: e.pageX, y: e.pageY, w, ink: 1 }], color, ended: null };
      strokes.push(active);
      schedule();
    };

    const onMove = (e: PointerEvent) => {
      if (!active) {
        if (e.pointerType === "touch" || !fine.matches || e.target === lastTarget) return;
        lastTarget = e.target;
        setHover(isPaper(e.target));
        return;
      }
      const samples = e.getCoalescedEvents?.() ?? [];
      for (const sample of samples.length ? samples : [e]) addPoint(sample);
      schedule();
    };

    const onUp = (e: Event) => {
      if (!active) return;
      const pts = active.points;
      const last = pts[pts.length - 1];
      if (e instanceof PointerEvent) {
        // Catch the pen up to where the hand stopped, flicking off thin if it was moving.
        pts.push({ x: e.pageX, y: e.pageY, w: last.w * (pen.v > 0.9 ? 0.45 : 0.9), ink: last.ink });
      }
      active.ended = performance.now();
      active = null;
      lastTarget = null;
      schedule();
    };

    const onLeave = () => {
      lastTarget = null;
      setHover(false);
    };

    resize();
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerleave", onLeave);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    window.addEventListener("resize", resize);
    window.addEventListener("scroll", schedule, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      document.documentElement.style.cursor = "";
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerleave", onLeave);
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

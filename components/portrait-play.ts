import { penCursor, toRgb } from "@/components/paper-doodles";
import { isDarkTheme } from "@/lib/theme";

/**
 * The portrait as something you can mess with, the way every textbook
 * portrait eventually gets a pen moustache.
 *
 * - Idle: he blinks now and then (only while facing you, since the blink
 *   frame is drawn from the front).
 * - Hover with a mouse or stylus: he notices, and gives you a knowing look.
 *   The cursor turns into a ballpoint.
 * - Drag: you draw on his face in ballpoint. He squeezes his eyes shut until
 *   you stop, then goes back to the look. The ink dries and fades a few
 *   seconds later. A plain click still sends him looking around.
 *
 * Expressions are frames in /avatar/ink/expr-{theme}.webp (blink, amused,
 * wince), redrawn from the front-facing pose so only the face changes. The
 * portrait shows one by setting data-expr; CSS swaps it in over the live
 * sketch, the way hand-drawn frames swap.
 */

export type Expression = "blink" | "amused" | "wince";

type Theme = "light" | "dark";

// The follower faces you while the pointer is within 0.75 × its 164px size.
const FACING_RADIUS = 123;
const HOLD_MS = 4200;
const FADE_MS = 1400;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function attachPortraitPlay(root: HTMLElement, slot: HTMLElement, canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const timers = new Set<number>();
  const later = (fn: () => void, ms: number) => {
    const t = window.setTimeout(() => {
      timers.delete(t);
      fn();
    }, ms);
    timers.add(t);
    return t;
  };
  const cancel = (t: number) => {
    window.clearTimeout(t);
    timers.delete(t);
  };

  // Expression frames load in the background; until a theme's sheet has
  // decoded, that theme simply shows no expressions.
  const loaded: Record<Theme, boolean> = { light: false, dark: false };
  const load = (theme: Theme) => {
    const img = new Image();
    img.src = `/avatar/ink/expr-${theme}.webp`;
    img.decode().then(
      () => (loaded[theme] = true),
      () => {},
    );
  };
  const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200));
  idle(() => {
    load(isDarkTheme() ? "dark" : "light");
    load(isDarkTheme() ? "light" : "dark");
  });

  let expr: Expression | null = null;
  let hovering = false;
  let drawing = false;
  let dragged = false;
  let pointer: { x: number; y: number } | null = null;

  const show = (next: Expression | null) => {
    if (next && !loaded[isDarkTheme() ? "dark" : "light"]) next = null;
    expr = next;
    if (next) root.dataset.expr = next;
    else delete root.dataset.expr;
  };
  // What he does when nothing is happening.
  const rest = () => show(hovering ? "amused" : null);

  // ── Blinking ─────────────────────────────────────────────────────────
  const facing = () => {
    if (!pointer) return true;
    const r = slot.getBoundingClientRect();
    return Math.hypot(pointer.x - (r.left + r.width / 2), pointer.y - (r.top + r.height / 2)) < FACING_RADIUS;
  };
  const blinkOnce = (then?: () => void) => {
    show("blink");
    later(() => {
      if (expr === "blink") rest();
      then?.();
    }, 120);
  };
  const blink = () => {
    if (!document.hidden && !reduce.matches && !drawing && !hovering && expr === null && facing()) {
      // Now and then a double blink, the way people actually do it.
      blinkOnce(Math.random() < 0.22 ? () => later(() => expr === null && blinkOnce(), 160) : undefined);
    }
    later(blink, 2600 + Math.random() * 4400);
  };
  later(blink, 1800 + Math.random() * 2000);

  const onPointerMove = (e: PointerEvent) => {
    pointer = { x: e.clientX, y: e.clientY };
  };

  // ── Hover: he notices ────────────────────────────────────────────────
  let noticeTimer = 0;
  const onEnter = (e: PointerEvent) => {
    if (e.pointerType === "touch") return;
    hovering = true;
    const paper = getComputedStyle(document.documentElement).backgroundColor;
    root.style.cursor = penCursor(toRgb(getComputedStyle(document.body).color), toRgb(paper));
    cancel(noticeTimer);
    noticeTimer = later(() => hovering && !drawing && show("amused"), 160);
  };
  const onLeave = () => {
    hovering = false;
    cancel(noticeTimer);
    if (!drawing) show(null);
  };

  // ── Drawing on his face ─────────────────────────────────────────────
  let dpr = 1;
  const fit = () => {
    const r = canvas.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(r.width * dpr);
    canvas.height = Math.round(r.height * dpr);
  };
  fit();
  const ro = new ResizeObserver(fit);
  ro.observe(canvas);

  type P = { x: number; y: number; w: number };
  let last: P | null = null;
  let prev: P | null = null;
  let start = { x: 0, y: 0 };
  let pen = { t: 0, v: 0 };
  let fadeTimer = 0;
  let clearTimer = 0;

  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    // The canvas sits inside a scaled box; map back to its own pixels.
    return { x: ((e.clientX - r.left) / r.width) * (canvas.width / dpr), y: ((e.clientY - r.top) / r.height) * (canvas.height / dpr) };
  };

  const segment = (a: P, b: P, before: P) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = (a.w + b.w) / 2;
    ctx.beginPath();
    ctx.moveTo((before.x + a.x) / 2, (before.y + a.y) / 2);
    ctx.quadraticCurveTo(a.x, a.y, (a.x + b.x) / 2, (a.y + b.y) / 2);
    ctx.stroke();
  };

  const freshInk = () => {
    cancel(fadeTimer);
    cancel(clearTimer);
    canvas.classList.remove("is-fading");
  };
  const dryLater = () => {
    cancel(fadeTimer);
    fadeTimer = later(() => {
      canvas.classList.add("is-fading");
      clearTimer = later(() => {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.remove("is-fading");
      }, FADE_MS);
    }, HOLD_MS);
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || e.pointerType === "touch") return;
    e.preventDefault();
    drawing = true;
    dragged = false;
    root.setPointerCapture(e.pointerId);
    freshInk();
    const p = local(e);
    start = p;
    pen = { t: e.timeStamp, v: 0 };
    ctx.strokeStyle = ctx.fillStyle = getComputedStyle(document.body).color;
    last = { ...p, w: 2.2 };
    prev = last;
  };

  const onDraw = (e: PointerEvent) => {
    if (!drawing || !last || !prev) return;
    let a: P = last;
    let before: P = prev;
    const samples = e.getCoalescedEvents?.() ?? [];
    for (const sample of samples.length ? samples : [e]) {
      const p = local(sample);
      const dist = Math.hypot(p.x - a.x, p.y - a.y);
      if (dist < 0.7) continue;
      if (!dragged && Math.hypot(p.x - start.x, p.y - start.y) > 3) {
        dragged = true;
        root.classList.add("is-drawn-on");
        show("wince");
        // The pen landed: a small gob of ink where it went down.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.beginPath();
        ctx.arc(start.x, start.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      const dt = Math.max(sample.timeStamp - pen.t, 1);
      pen = { t: sample.timeStamp, v: pen.v * 0.7 + (dist / dt) * 0.3 };
      // Ballpoints run thinner the faster they move.
      let w = clamp(2.5 - pen.v * 0.55, 1, 2.5);
      if (sample.pointerType === "pen" && sample.pressure > 0) w *= 0.5 + sample.pressure;
      const next: P = { ...p, w: a.w * 0.6 + w * 0.4 };
      if (dragged) segment(a, next, before);
      before = a;
      a = next;
    }
    prev = before;
    last = a;
  };

  const onUp = () => {
    if (!drawing) return;
    drawing = false;
    root.classList.remove("is-drawn-on");
    if (dragged) {
      dryLater();
      // A beat with his eyes still shut, then the look again.
      later(() => !drawing && rest(), 220);
    }
  };

  // A drag is a drawing, not a click: keep it from setting off the look-around.
  const onClickCapture = (e: MouseEvent) => {
    if (!dragged) return;
    dragged = false;
    e.stopPropagation();
  };

  document.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerenter", onEnter);
  root.addEventListener("pointerleave", onLeave);
  root.addEventListener("pointerdown", onDown);
  root.addEventListener("pointermove", onDraw);
  root.addEventListener("pointerup", onUp);
  root.addEventListener("pointercancel", onUp);
  root.addEventListener("click", onClickCapture, true);

  return () => {
    timers.forEach((t) => window.clearTimeout(t));
    ro.disconnect();
    document.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerenter", onEnter);
    root.removeEventListener("pointerleave", onLeave);
    root.removeEventListener("pointerdown", onDown);
    root.removeEventListener("pointermove", onDraw);
    root.removeEventListener("pointerup", onUp);
    root.removeEventListener("pointercancel", onUp);
    root.removeEventListener("click", onClickCapture, true);
    root.style.cursor = "";
    delete root.dataset.expr;
  };
}

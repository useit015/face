"use client";

import { createContext, createElement, startTransition, useCallback, useContext, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { hashSeed } from "@/lib/ink-sketch";

export type InkSize = readonly [number, number];

// ─── Measuring ──────────────────────────────────────────────────────────

// One ResizeObserver for every drawn box on the page. An element can carry
// several overlays, so each keeps its own set of listeners.
const listeners = new WeakMap<Element, Set<(size: InkSize) => void>>();
let resizes: ResizeObserver | undefined;

function observe(el: Element, onSize: (size: InkSize) => void) {
  resizes ??= new ResizeObserver((entries) => {
    for (const entry of entries) {
      const box = entry.borderBoxSize?.[0];
      const size: InkSize = box ? [box.inlineSize, box.blockSize] : [entry.contentRect.width, entry.contentRect.height];
      listeners.get(entry.target)?.forEach((fn) => fn(size));
    }
  });
  let set = listeners.get(el);
  if (!set) {
    set = new Set();
    listeners.set(el, set);
    resizes.observe(el);
  }
  set.add(onSize);
  return () => {
    set.delete(onSize);
    if (set.size) return;
    listeners.delete(el);
    resizes?.unobserve(el);
  };
}

// Drawings far down (or up) the page are redrawn to their real size when
// one IntersectionObserver sees them come within a screen of the viewport.
// The rest are woken a few at a time while the page is idle, as a transition
// React can interrupt, so a jump down the page doesn't find them unsized.
const approaching = new Map<Element, Set<() => void>>();
let nearby: IntersectionObserver | undefined;
let draining = false;

function wake(el: Element) {
  const set = approaching.get(el);
  approaching.delete(el);
  nearby?.unobserve(el);
  set?.forEach((fn) => fn());
}

function whenIdle(fn: () => void) {
  if (typeof requestIdleCallback === "function") requestIdleCallback(fn);
  else setTimeout(fn, 50);
}

function drain() {
  startTransition(() => {
    let n = 0;
    for (const el of approaching.keys()) {
      if (n++ === 8) break;
      wake(el);
    }
  });
  draining = approaching.size > 0;
  if (draining) whenIdle(drain);
}

function approach(el: Element, onNear: () => void) {
  nearby ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) if (entry.isIntersecting) wake(entry.target);
    },
    { rootMargin: "100% 0px" },
  );
  let set = approaching.get(el);
  if (!set) {
    set = new Set();
    approaching.set(el, set);
    nearby.observe(el);
  }
  set.add(onNear);
  if (!draining) {
    draining = true;
    whenIdle(drain);
  }
  return () => {
    set.delete(onNear);
    if (set.size || approaching.get(el) !== set) return;
    approaching.delete(el);
    nearby?.unobserve(el);
  };
}

// One IntersectionObserver releases every pending ("auto") drawing the
// first time it scrolls into view. The attribute is dropped straight from
// the DOM: React rendered it and never changes it, so it won't put it back,
// and a few hundred components don't re-render just to start drawing.
//
// What's in view is drawn the way one pen would go down the page: in
// reading order, each drawing starting once the one before is under way
// (LEAD of the time it takes, MAX_LEAD at most). The first waits the same
// way for whatever the page is still drawing as it loads. A drawing
// scrolled out of view before its turn waits to be seen again, and once
// what the pen is busy with has scrolled out of view, it moves on.
const LEAD = 0.35;
const MAX_LEAD = 450;
const waiting = new WeakMap<Element, Element[]>();
const queued = new WeakSet<Element>();
let views: IntersectionObserver | undefined;
// In view and waiting their turn, in reading order; what the pen last
// drew, and when it's free of it.
let line: Element[] = [];
let busy: Element | undefined;
let penFree: number | undefined;
let turn: ReturnType<typeof setTimeout> | undefined;
let looking = false;

/** A CSS time in ms ("300ms", "0.3s"); 0 when unset. */
function ms(time: string) {
  const n = parseFloat(time);
  if (Number.isNaN(n)) return 0;
  return time.trim().endsWith("ms") ? n : n * 1000;
}

const PARTS = ".ink-draw, .ink-write, .ink-land";

/**
 * When the pen is done with what's in (or is) el: the latest delay plus
 * duration, read off the parts' own styles (where Stroke and friends set
 * them; unset, they're --ink-d's 500ms and no delay).
 */
function penTime(el: Element) {
  let end = 0;
  for (const part of [el, ...el.querySelectorAll(PARTS)]) {
    if (!part.matches(PARTS) || !(part instanceof HTMLElement || part instanceof SVGElement)) continue;
    end = Math.max(end, ms(part.style.getPropertyValue("--ink-dd")) + ms(part.style.getPropertyValue("--ink-d") || "500ms"));
  }
  return end / (parseFloat(getComputedStyle(el).getPropertyValue("--ink-speed")) || 1);
}

/** When the pen is free of what the page drew as it loaded ("mount" drawings, words written in), each held for its LEAD. */
function loaded() {
  const now = performance.now();
  const parts = new Map<Element, [number, number]>();
  for (const a of document.getAnimations()) {
    const el = a.effect instanceof KeyframeEffect ? a.effect.target : null;
    if (!el || !(a instanceof CSSAnimation) || !/^ink-(draw|write|land)$/.test(a.animationName)) continue;
    const { delay = 0, duration } = a.effect!.getComputedTiming();
    const start = (a.startTime === null ? now : Number(a.startTime)) + delay;
    // A drawing's strokes are one part, timed from its first to its last.
    const part = (el instanceof SVGElement && el.ownerSVGElement) || el;
    const [from, to] = parts.get(part) ?? [Infinity, 0];
    parts.set(part, [Math.min(from, start), Math.max(to, start + Number(duration))]);
  }
  let free = now;
  for (const [from, to] of parts.values()) free = Math.max(free, from + Math.min(MAX_LEAD, (to - from) * LEAD));
  return free;
}

/** In view by the observer's measure (the bottom 6% of the screen doesn't count). */
function inView(el: Element) {
  if (!el.getClientRects().length) return false;
  const { top, bottom } = el.getBoundingClientRect();
  return bottom >= 0 && top <= innerHeight * 0.94;
}

function draw(el: Element) {
  queued.delete(el);
  waiting.get(el)?.forEach((s) => s.removeAttribute("data-ink-pending"));
  waiting.delete(el);
}

// The pen's next turn: the next drawing still in view is drawn, and the
// pen is busy with it for its lead. Any scrolled away meanwhile go back to
// waiting to be seen.
function next() {
  turn = undefined;
  const now = performance.now();
  if (penFree! > now) return void (turn = setTimeout(next, penFree! - now));
  while (line.length) {
    const el = line.shift()!;
    if (!waiting.has(el)) {
      queued.delete(el);
      continue;
    }
    if (!inView(el)) {
      queued.delete(el);
      views?.observe(el);
      continue;
    }
    draw(el);
    busy = el;
    penFree = now + Math.min(MAX_LEAD, penTime(el) * LEAD);
    if (line.length) turn = setTimeout(next, penFree - now);
    return;
  }
}

// The page scrolled while drawings wait their turn: if what the pen is
// busy with (or, before it has drawn anything, what loaded) is out of view
// now, there's no point waiting on it.
function scrolled() {
  if (looking || !turn) return;
  looking = true;
  requestAnimationFrame(() => {
    looking = false;
    if (!turn || (busy && inView(busy))) return;
    clearTimeout(turn);
    penFree = performance.now();
    next();
  });
}

function queue(els: Element[]) {
  // Reduced motion: everything is shown drawn anyway, so nothing waits.
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return els.forEach(draw);
  for (const el of els) queued.add(el);
  line = [...line, ...els].sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_PRECEDING ? 1 : -1));
  if (penFree === undefined) {
    penFree = loaded();
    addEventListener("scroll", scrolled, { passive: true });
  }
  if (!turn) next();
}

// What comes into view in the same frame is queued together, so it can be put in order.
let seen: Element[] = [];

function release(el: Element, drawing: Element) {
  views ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        views?.unobserve(entry.target);
        if (queued.has(entry.target) || seen.includes(entry.target)) continue;
        if (!seen.length)
          requestAnimationFrame(() => {
            const els = seen;
            seen = [];
            queue(els);
          });
        seen.push(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
  );
  const list = waiting.get(el);
  if (list) {
    if (!list.includes(drawing)) list.push(drawing);
  } else {
    waiting.set(el, [drawing]);
    views.observe(el);
  }
  return () => {
    const list = waiting.get(el);
    if (!list) return;
    const i = list.indexOf(drawing);
    if (i >= 0) list.splice(i, 1);
    // A re-render lets go and registers again straight after: stay observed
    // (observing anew would report it in a frame of its own, out of order).
    queueMicrotask(() => {
      if (waiting.get(el) !== list || list.length) return;
      waiting.delete(el);
      views?.unobserve(el);
    });
  };
}

/**
 * The size of the element an ink overlay is drawn around (the SVG's
 * parent), so strokes can be regenerated for the real box as fonts swap in,
 * text wraps, or the layout resizes.
 *
 * The server and the first client render use `estimate`, stretched to fit,
 * so there is never an empty frame. Sizes snap to `step` px, so a box that
 * is animating its size redraws every few pixels rather than every frame.
 * A box more than a screen away from the viewport is redrawn to its real
 * size once it comes that close, or once the page is idle, so a long page
 * hydrates without redrawing what nobody can see yet. A `pending` InkSvg is
 * released to draw once it scrolls into view and the pen gets to it.
 */
export function useInkBox(estimate: InkSize, { step = 2 }: { step?: number } = {}) {
  const drawing = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState<InkSize>(estimate);

  const ref = useCallback((svg: SVGSVGElement | null) => {
    drawing.current = svg;
    const el = svg?.parentElement;
    if (!svg || !el) return;
    const snap = (v: number) => Math.max(step, Math.round(v / step) * step);
    const update = ([w, h]: InkSize) => {
      if (!w || !h) return;
      const next: InkSize = [snap(w), snap(h)];
      setSize((prev) => (prev[0] === next[0] && prev[1] === next[1] ? prev : next));
    };
    let measured: InkSize = [el.offsetWidth, el.offsetHeight];
    const { top, bottom } = el.getBoundingClientRect();
    let near = bottom >= -innerHeight && top <= innerHeight * 2;
    const resize = (size: InkSize) => (near ? update(size) : void (measured = size));
    const unapproach = near
      ? undefined
      : approach(el, () => {
          near = true;
          update(measured);
        });
    if (near) update(measured);
    // Once a stroke has drawn itself in, drop its dash pattern: it looks the
    // same, but guarantees a fresh paint (Chrome can leave a small SVG on an
    // early frame of a dash animation) and stops paying for dash geometry.
    // A ribbon's guide (InkMarks) takes the ribbon's mask with it.
    const settle = (e: AnimationEvent) => {
      if (e.animationName !== "ink-draw" || !(e.target instanceof SVGElement)) return;
      e.target.classList.add("ink-drawn");
      const mask = e.target.parentElement;
      if (!(mask instanceof SVGMaskElement)) return;
      for (const ribbon of svg.querySelectorAll(".ink-reveal")) if (ribbon.getAttribute("mask") === `url(#${mask.id})`) ribbon.classList.add("ink-drawn");
    };
    svg.addEventListener("animationend", settle);
    const unobserve = observe(el, resize);
    return () => {
      unobserve();
      unapproach?.();
      svg.removeEventListener("animationend", settle);
      drawing.current = null;
    };
  }, [step]);

  // Recheck after every commit: draw mode can add pending to an existing SVG,
  // and conditional drawings can attach after the hook's first render.
  useLayoutEffect(() => {
    const svg = drawing.current;
    const el = svg?.parentElement;
    if (!svg || !el || !svg.hasAttribute("data-ink-pending")) return;
    return release(el, svg);
  });

  return [ref, size] as const;
}

/**
 * An overlay frame for useInkBox: the measured size, plus the props that
 * place an InkSvg `pad` px outside its element on every side (room for
 * overshooting corners and shadows), stretched so it always covers it:
 *   <InkSvg ref={ref} {...frame}>
 */
export function useInkFrame(estimate: InkSize, { pad = 10, step = 2 }: { pad?: number; step?: number } = {}) {
  const [ref, [w, h]] = useInkBox(estimate, { step });
  return {
    ref,
    w,
    h,
    /** Spread onto the InkSvg alongside `ref`. */
    frame: {
      box: [-pad, -pad, w + pad * 2, h + pad * 2] as const,
      stretch: true,
      style: { left: -pad, top: -pad, width: `calc(100% + ${pad * 2}px)`, height: `calc(100% + ${pad * 2}px)` },
    },
  };
}

/**
 * Holds what lands inside an element (.ink-land, or the element itself)
 * until it scrolls into view and the pen gets to it, in turn with the
 * drawings around it, the way a pending drawing waits. For content that
 * has no drawing of its own to wait for: a list that settles in under a
 * heading. Spread onto it:
 *   <ul {...useInkStage()}>
 *     <li className="ink-land" style={{ "--ink-dd": "80ms" }}>…</li>
 * Nothing waits when the pen draws on "mount" or not at "none".
 */
export function useInkStage({ draw }: Pick<Pen, "draw"> = {}) {
  const pen = usePen({ draw });
  const node = useRef<HTMLElement | null>(null);
  const ref = useCallback((el: HTMLElement | null) => void (node.current = el), []);
  useLayoutEffect(() => {
    const el = node.current;
    if (!el?.hasAttribute("data-ink-pending")) return;
    return release(el, el);
  });
  return { ref, "data-ink-stage": "", "data-ink-pending": pen.draw === "mount" || pen.draw === "none" ? undefined : "" };
}

// ─── Pen settings ───────────────────────────────────────────────────────

/** How an area is coloured in. */
export type InkFill = "shade" | "hatch" | "scribble" | "flat";
/** What a lifted box leaves on the paper. "none" also turns the lift off. */
export type InkShadow = "hatch" | "solid" | "none";
/** When strokes draw themselves in. */
export type InkDraw = "auto" | "mount" | "none";

export type Pen = {
  /** 0 is ruler-neat, 1 a quick confident hand, 2 a scrawl. */
  roughness?: number;
  /** How many times an outline is gone over. */
  passes?: 1 | 2 | 3;
  /** Corner radius in px, or "full" for pills. */
  radius?: number | "full";
  /** Square corners: sides pulled separately past each other, or one joined motion. */
  corners?: "crossed" | "joined";
  fill?: InkFill;
  shadow?: InkShadow;
  draw?: InkDraw;
  /** Line weight multiplier (sets --ink-weight). */
  weight?: number;
  /** Drawing speed multiplier (sets --ink-speed). */
  speed?: number;
};

export const penKeys = ["roughness", "passes", "radius", "corners", "fill", "shadow", "draw", "weight", "speed"] as const satisfies readonly (keyof Pen)[];

type PenContextValue = Pen & { salt?: string };
const PenContext = createContext<PenContextValue>({});

/** Only the keys that were actually given, so undefined never overrides. */
function given<T extends object>(value: T): Partial<T> {
  return Object.fromEntries(Object.entries(value).filter(([, v]) => v !== undefined)) as Partial<T>;
}

/**
 * Pen settings for everything inside: any of the Pen keys, and a `salt`
 * that redraws every seed beneath in a slightly different hand (change it,
 * and remount with a `key`, to replay drawings with fresh strokes).
 * Providers nest; the nearest wins, and component props win over both.
 */
export function InkProvider({ children, salt, ...pen }: Pen & { salt?: string | number; children: ReactNode }) {
  const parent = useContext(PenContext);
  const { roughness, passes, radius, corners, fill, shadow, draw, weight, speed } = pen;
  const value = useMemo(
    () => ({ ...parent, ...given({ roughness, passes, radius, corners, fill, shadow, draw, weight, speed, salt: salt === undefined ? undefined : String(salt) }) }),
    [parent, roughness, passes, radius, corners, fill, shadow, draw, weight, speed, salt],
  );
  return createElement(PenContext, { value }, children);
}

/** A component's pen: its own props over the nearest InkProvider. */
export function usePen(props: Pen): Pen {
  const context = useContext(PenContext);
  return { ...context, ...given(props) };
}

/** CSS variables for the paint-only settings, when they were given. */
export function penStyle(pen: Pen) {
  return given({ "--ink-weight": pen.weight, "--ink-speed": pen.speed }) as Record<string, number>;
}

/**
 * The seed a drawn part should use: the `seed` prop when given, otherwise
 * one derived from the component's place in the tree (stable between server
 * and client), salted by the nearest InkProvider.
 */
export function useInkSeed(seed?: string | number) {
  const uid = useId();
  const { salt } = useContext(PenContext);
  const base = seed ?? uid;
  return hashSeed(salt ? `${salt}:${base}` : base);
}

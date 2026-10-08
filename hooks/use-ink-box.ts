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
const waiting = new WeakMap<Element, SVGSVGElement[]>();
let views: IntersectionObserver | undefined;

function release(el: Element, svg: SVGSVGElement) {
  views ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        waiting.get(entry.target)?.forEach((s) => s.removeAttribute("data-ink-pending"));
        waiting.delete(entry.target);
        views?.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -6% 0px", threshold: 0.01 },
  );
  const list = waiting.get(el);
  if (list) list.push(svg);
  else {
    waiting.set(el, [svg]);
    views.observe(el);
  }
  return () => {
    const rest = waiting.get(el)?.filter((s) => s !== svg);
    if (rest?.length) return void waiting.set(el, rest);
    waiting.delete(el);
    views?.unobserve(el);
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
 * released to draw once it scrolls into view.
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

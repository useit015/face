"use client";

import { useEffect, useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { flushSync } from "react-dom";
import { SeeMore } from "@/components/ink/see-more";
import { SectionHeader } from "@/components/ink/heading";

// Height and flights share one curve and one duration, so an item in flight
// never strays outside the box that is growing or shrinking around it.
const MOVE_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";
// Entering content settles in, softly out of focus.
const SETTLE: Keyframe[] = [
  { opacity: 0, filter: "blur(2.5px)", translate: "0 3px" },
  { opacity: 1, filter: "blur(0)", translate: "0 0" },
];
const SETTLE_EASE = "cubic-bezier(0.2, 0.7, 0.3, 1)";
// Entrances outlive a run: if the section is toggled back mid-entrance, the
// content keeps fading in under the leaving pane's fade instead of popping.
const ENTER_ID = "expandable-enter";

type PaneState = "flow" | "overlay" | "hidden";

// While moving, the pane being shown is already in flow at its final layout
// and the one being left overlays it, fading out. At rest, the other pane is
// out of the way (it keeps its natural layout, so it can be measured).
const PANE_CLASS: Record<PaneState, string> = {
  flow: "relative",
  // left-3/right-3 (not inset-x-0): the container is -mx-3 px-3, so this
  // keeps the overlay exactly where the pane sits in flow.
  overlay: "pointer-events-none absolute left-3 right-3 top-0",
  hidden: "pointer-events-none invisible absolute left-3 right-3 top-0 h-0 overflow-hidden",
};

type Run = { animations: Animation[]; fade: Animation | null; hidden: HTMLElement[]; holding: boolean };

// While a section moves, the page holds still: the toggle you pressed stays
// where it is and only what's below slides. Left on, the browser's scroll
// anchoring may latch onto content below (or onto an item in flight) and
// scroll the page along with the animation.
let holds = 0;
function holdScroll() {
  if (holds++ === 0) document.documentElement.style.overflowAnchor = "none";
}
function releaseScroll() {
  if (--holds === 0) document.documentElement.style.removeProperty("overflow-anchor");
}

// Settle a finished run: the left pane goes out of the way, its twins show
// again; entrances may keep playing.
function settleRun(r: Run) {
  r.fade?.cancel();
  r.fade = null;
  for (const el of r.hidden) el.style.removeProperty("visibility");
  r.hidden = [];
  if (r.holding) releaseScroll();
  r.holding = false;
}

// Undo a run: cancel the move (entrances are left to finish).
function stopRun(run: RefObject<Run | null>) {
  const r = run.current;
  if (!r) return;
  for (const a of r.animations) a.cancel();
  settleRun(r);
  run.current = null;
}

/**
 * A section whose body swaps between a compact and a full version, moving
 * what they share instead of crossfading it. Inside the panes:
 * - `data-flip="key"` marks an item present in both versions; it flies from
 *   where it was to where it lands (FLIP). Unmatched, it enters like below.
 * - `data-enter` marks content that only one version has; it settles in,
 *   staggered by the inherited `--i`.
 * Don't nest these marks: an item's own animation would fight its parent's.
 */
export function Expandable({
  headingId,
  title,
  children,
  collapsed,
  label = "See more",
  duration = 0.55,
  specks,
}: {
  headingId: string;
  title: ReactNode;
  children: ReactNode;
  collapsed: ReactNode;
  label?: ReactNode;
  duration?: number;
  specks?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [moving, setMoving] = useState(false);
  const regionRef = useRef<HTMLDivElement | null>(null);
  const longRef = useRef<HTMLDivElement | null>(null);
  const shortRef = useRef<HTMLDivElement | null>(null);
  const run = useRef<Run | null>(null);
  const regionId = useId();

  const stop = () => stopRun(run);
  useEffect(
    () => () => {
      stopRun(run);
      for (const pane of [longRef.current, shortRef.current])
        for (const a of pane?.getAnimations({ subtree: true }) ?? []) if (a.id === ENTER_ID) a.cancel();
    },
    [],
  );

  const toggle = () => {
    const region = regionRef.current;
    const next = !open;
    const from = next ? shortRef.current : longRef.current;
    const to = next ? longRef.current : shortRef.current;
    if (!region || !from || !to) {
      setOpen(next);
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stop();
      flushSync(() => {
        setOpen(next);
        setMoving(false);
      });
      to.animate({ opacity: [0, 1] }, { duration: 200, easing: "ease-out" });
      return;
    }

    // First: where everything is right now (mid-flight, if interrupted).
    const startHeight = region.getBoundingClientRect().height;
    const fromOpacity = getComputedStyle(from).opacity;
    const firsts = new Map<string, { el: HTMLElement; rect: DOMRect }>();
    for (const el of from.querySelectorAll<HTMLElement>("[data-flip]")) {
      const rect = el.getBoundingClientRect();
      if (rect.width && rect.height) firsts.set(el.dataset.flip!, { el, rect });
    }

    stop();
    holdScroll();
    // Hold the box at its current height through the swap: if layout ever
    // saw it at the new height before the animation starts, the browser's
    // scroll anchoring would "correct" for that and jolt the page.
    region.style.height = `${startHeight}px`;
    flushSync(() => {
      setOpen(next);
      setMoving(true);
    });

    // Last: the new layout, at rest. Then play it back from First.
    const ms = duration * 1000;
    const animations: Animation[] = [];
    const hidden: HTMLElement[] = [];
    const endHeight = to.getBoundingClientRect().height;
    const resize = region.animate({ height: [`${startHeight}px`, `${endHeight}px`] }, { duration: ms, easing: MOVE_EASE });
    region.style.removeProperty("height");
    animations.push(resize);
    // What's left behind clears out quickly, before items fly across it.
    const fade = from.animate({ opacity: [fromOpacity, "0"] }, { duration: 140, easing: "ease-out", fill: "forwards" });

    for (const el of to.querySelectorAll<HTMLElement>("[data-flip], [data-enter]")) {
      // Not laid out (a stop the narrow timeline has no room for).
      if (!el.getClientRects().length) continue;
      const last = el.getBoundingClientRect();
      const first = el.dataset.flip && last.height ? firsts.get(el.dataset.flip) : undefined;
      if (first) {
        // Only one copy is ever visible: the twin left behind hides.
        first.el.style.visibility = "hidden";
        hidden.push(first.el);
        const dx = first.rect.left - last.left;
        const dy = first.rect.top - last.top;
        // Uniform scale from the heights: type sizes differ between
        // versions, but a truncated label shouldn't squash.
        const s = first.rect.height / last.height;
        const scale = Math.abs(s - 1) < 0.02 ? 1 : s;
        if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5 && scale === 1) continue;
        animations.push(
          el.animate(
            {
              transformOrigin: ["0 0", "0 0"],
              transform: [`translate(${dx}px, ${dy}px) scale(${scale})`, "none"],
            },
            { duration: ms, easing: MOVE_EASE },
          ),
        );
      } else {
        for (const a of el.getAnimations()) if (a.id === ENTER_ID) a.cancel();
        const i = parseFloat(getComputedStyle(el).getPropertyValue("--i")) || 0;
        el.animate(SETTLE, {
          id: ENTER_ID,
          duration: 520,
          easing: SETTLE_EASE,
          delay: ms * 0.25 + Math.min(i, 10) * 55,
          fill: "backwards",
        });
      }
    }

    const current: Run = { animations, fade, hidden, holding: true };
    run.current = current;
    resize.onfinish = () => {
      if (run.current !== current) return;
      // Hide the left pane before its fade is dropped, or it flashes back.
      flushSync(() => setMoving(false));
      settleRun(current);
    };
  };

  const paneState = (isLong: boolean): PaneState => (open === isLong ? "flow" : moving ? "overlay" : "hidden");

  return (
    <div className="expander relative" data-open={open} data-moving={moving || undefined}>
      <SectionHeader
        id={headingId}
        title={title}
        action={<SeeMore open={open} label={label} controls={regionId} onToggle={toggle} />}
        specks={specks}
      />
      <div ref={regionRef} id={regionId} className={`relative -mx-3 px-3 ${moving ? "overflow-clip" : ""}`}>
        <div ref={longRef} inert={!open} className={PANE_CLASS[paneState(true)]}>
          {children}
        </div>
        <div ref={shortRef} inert={open} className={PANE_CLASS[paneState(false)]}>
          {collapsed}
        </div>
      </div>
    </div>
  );
}

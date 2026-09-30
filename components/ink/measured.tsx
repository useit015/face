"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { boxStroke, hashSeed, loopStroke, scribbleFill } from "@/lib/sketch";
import { SketchSvg, Stroke, type DrawMode } from "@/components/ink/sketch";

type Size = readonly [number, number];

/**
 * Tracks the parent element's size so a sketch can be regenerated for the
 * real box (fonts swapping in, wrapping, resizes). SSR draws with the
 * estimate, stretched to fit, so there is never an empty frame.
 */
function useParentSize(estimate: Size) {
  const ref = useRef<SVGSVGElement | null>(null);
  const [size, setSize] = useState<Size>(estimate);

  useLayoutEffect(() => {
    const parent = ref.current?.parentElement;
    if (!parent) return;
    const measure = () => {
      const w = Math.round(parent.offsetWidth);
      const h = Math.round(parent.offsetHeight);
      if (!w || !h) return;
      setSize((prev) => (Math.abs(prev[0] - w) < 1 && Math.abs(prev[1] - h) < 1 ? prev : [w, h]));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(parent);
    return () => ro.disconnect();
  }, []);

  return [ref, size] as const;
}

/**
 * Button box sized to its parent: a drawn outline, optionally shaded solid
 * like a pen-filled button. Underneath sits a solid ink shadow of the same
 * shape that only shows when the button lifts on hover.
 */
export function MeasuredBox({
  seed,
  estimate,
  mode = "reveal",
  delay = 0,
  filled = false,
  pad = 4,
}: {
  seed: string;
  estimate: Size;
  mode?: DrawMode;
  delay?: number;
  filled?: boolean;
  pad?: number;
}) {
  const [ref, [w, h]] = useParentSize(estimate);
  const clipId = useId();
  const s = hashSeed(seed);
  const body = `${boxStroke(s + 7, w, h, { overshoot: 0, jitter: 0.9 })}Z`;
  return (
    <SketchSvg
      box={[-pad, -pad, w + pad * 2, h + pad * 2]}
      stretch
      ref={ref}
      className="sketch-box"
      style={{ left: -pad, top: -pad, width: `calc(100% + ${pad * 2}px)`, height: `calc(100% + ${pad * 2}px)` }}
    >
      <g className="btn-shadow" aria-hidden="true">
        <path d={body} className="shadow-fill" />
      </g>
      <g>
        {/* An opaque face so the shadow never shows through the label (or
            through the slightly translucent pen shading). */}
        <path d={body} className="face-fill" />
        {filled && (
          <>
            {/* Shading stays inside a slightly loose version of the box. */}
            <clipPath id={clipId}>
              <rect x={-0.5} y={-0.5} width={w + 1} height={h + 1} rx={1.5} />
            </clipPath>
            <path d={body} className="ink-fill" />
            <g clipPath={`url(#${clipId})`}>
              <Stroke d={scribbleFill(s + 3, w, h)} mode={mode} delay={delay + 120} duration={620} width={1.1} className="scribble" />
            </g>
          </>
        )}
        <Stroke d={boxStroke(s, w, h)} mode={mode} delay={delay} duration={480} />
        <Stroke d={boxStroke(s + 1, w, h, { overshoot: 1.4 })} mode={mode} delay={delay + 340} duration={380} opacity={0.5} width={0.9} />
      </g>
    </SketchSvg>
  );
}

/** A pen loop that circles its parent on hover/focus. */
export function HoverLoop({ seed, estimate, pad = 5 }: { seed: string; estimate: Size; pad?: number }) {
  const [ref, [w, h]] = useParentSize(estimate);
  const m = pad + 4;
  return (
    <SketchSvg ref={ref} box={[-m, -m, w + m * 2, h + m * 2]} stretch className="hover-loop" style={{ left: -m, top: -m, width: `calc(100% + ${m * 2}px)`, height: `calc(100% + ${m * 2}px)` }}>
      <g>
        <Stroke d={loopStroke(hashSeed(seed), w, h, { pad })} mode="hover" duration={340} width={1.2} />
      </g>
    </SketchSvg>
  );
}

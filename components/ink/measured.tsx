"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { boxStroke, cornerTicks, crossedBoxStroke, hashSeed, loopStroke, shadeFill } from "@/lib/sketch";
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
  const maskId = useId();
  const hatchId = useId();
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
      {/* The hover shadow is pen hatching, masked out under the face rather
          than covered by it, so the face stays the paper itself. Inline
          styles: `.sketch path` would otherwise blank these fills. */}
      <defs>
        <pattern id={hatchId} patternUnits="userSpaceOnUse" width={3.2} height={3.2} patternTransform="rotate(-45)">
          <path d="M0 -1V4.2" style={{ strokeWidth: 1.05 }} />
        </pattern>
        <mask id={maskId} maskUnits="userSpaceOnUse" x={-pad - 20} y={-pad - 20} width={w + pad * 2 + 40} height={h + pad * 2 + 40}>
          <rect x={-pad - 20} y={-pad - 20} width={w + pad * 2 + 40} height={h + pad * 2 + 40} fill="#fff" />
          <path d={body} style={{ fill: "#000", stroke: "#000", strokeWidth: 1.5 }} />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <g className="btn-shadow" aria-hidden="true">
          <path d={body} style={{ fill: `url(#${hatchId})`, stroke: "none" }} />
          <path d={crossedBoxStroke(s + 9, w, h, { overshoot: 2, jitter: 1 })} style={{ strokeWidth: 1 }} />
        </g>
      </g>
      <g>
        {filled && (
          <>
            {/* Shading stays inside a slightly loose version of the box. */}
            <clipPath id={clipId}>
              <rect x={-1.5} y={-1.5} width={w + 3} height={h + 3} rx={1.5} />
            </clipPath>
            <path d={body} className="ink-fill" />
            <g clipPath={`url(#${clipId})`}>
              <Stroke d={shadeFill(s + 3, w, h, { gap: 2.3, angle: -14 })} mode={mode} delay={delay + 120} duration={620} width={1.5} className="scribble" />
              <Stroke d={shadeFill(s + 4, w, h, { gap: 4.2, angle: -26 })} mode={mode} delay={delay + 300} duration={520} width={1} opacity={0.7} className="scribble" />
            </g>
          </>
        )}
        {/* Three passes that never quite line up, each running past its
            corners, the way a box gets gone over when it matters. */}
        <Stroke d={crossedBoxStroke(s, w, h, { overshoot: 4 })} mode={mode} delay={delay} duration={480} width={1.4} />
        <Stroke d={crossedBoxStroke(s + 1, w, h, { overshoot: 7, jitter: 1.6, shift: [1.8, -1.6] })} mode={mode} delay={delay + 300} duration={420} opacity={0.8} width={1.1} />
        <Stroke d={crossedBoxStroke(s + 2, w, h, { overshoot: 5, jitter: 1.8, shift: [-1.4, 2.2] })} mode={mode} delay={delay + 520} duration={380} opacity={0.55} width={1} />
        {!filled && <Stroke d={cornerTicks(s + 5, w, h)} mode={mode} delay={delay + 760} duration={260} opacity={0.7} width={1} />}
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

"use client";

import { useId, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useInkBox, useInkSeed } from "@/hooks/use-ink-box";
import { InkMarks, InkSvg } from "@/lib/ink";
import { flickPulls, inkPulls, signaturePulls } from "@/lib/ink-sketch";

type Draw = "auto" | "mount" | "none";

/** Three quick flicks beside something, the way a pen marks "look here". */
export function Flicks({ seed, delay = 0, draw = "auto", className }: { seed: string; delay?: number; draw?: Draw; className?: string }) {
  const s = useInkSeed(seed);
  const id = useId().replace(/[^\w-]/g, "");
  const [ref] = useInkBox([28, 28]);
  const strokes = useMemo(() => inkPulls(s, flickPulls(s), { weight: 2.1, dur: 120, gap: 40 }), [s]);
  return (
    <span aria-hidden="true" className={cn("pointer-events-none absolute size-7", className)}>
      <InkSvg ref={ref} pending={draw === "auto"} box={[0, 0, 28, 28]} className="inset-0 size-full">
        <InkMarks id={`fl${id}`} strokes={strokes} draw={draw} delay={delay} />
      </InkSvg>
    </span>
  );
}

const SIGNATURE = 760;

/**
 * A rule run out to a scribbled knot, the way a page gets signed off. Drawn
 * at 1:1 and anchored right, so the knot keeps its size and a narrow footer
 * just shows less of the rule (faded in where it's cut).
 */
export function SignatureRule({ seed, delay = 0, className }: { seed: string; delay?: number; className?: string }) {
  const s = useInkSeed(seed);
  const id = useId().replace(/[^\w-]/g, "");
  const [ref] = useInkBox([SIGNATURE, 54]);
  const { rule, knot } = useMemo(() => {
    const { rule, knot } = signaturePulls(s, SIGNATURE);
    return {
      rule: inkPulls(s, rule, { weight: 1.25, opacity: 0.85, dur: 520, gap: -260, bow: 0.4 }),
      knot: inkPulls(s + 1, knot, { weight: 1, opacity: 0.8, dur: 260, gap: -60, retrace: 0.5, wander: 2.5 }).map((k) => ({ ...k, at: k.at + 700 })),
    };
  }, [s]);
  return (
    <span aria-hidden="true" className={cn("signature-rule pointer-events-none relative -my-8 block h-20 overflow-hidden", className)}>
      <span className="absolute top-[13px] right-0 h-[54px] w-[760px] origin-[100%_76%] text-ink-2 max-sm:scale-[0.72]">
        <InkSvg ref={ref} pending box={[0, -36, SIGNATURE, 54]} className="inset-0 size-full">
          <InkMarks id={`sr${id}`} strokes={rule} draw="auto" delay={delay} />
          <InkMarks id={`sk${id}`} strokes={knot} draw="auto" delay={delay} guide={6} />
        </InkSvg>
      </span>
    </span>
  );
}

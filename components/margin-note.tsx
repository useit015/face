import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { SketchSvg, Stroke } from "@/components/ink/sketch";
import { createRng, hashSeed } from "@/lib/sketch";

function curvedArrow(seed: number, flip: boolean) {
  const r = createRng(seed);
  const j = () => (r() - 0.5) * 3;
  const s = flip ? -1 : 1;
  const sx = 36 + 34 * s;
  const ex = 36 - 30 * s;
  const shaft = `M${sx} 6C${36 + 20 * s + j()} 30 ${36 - 6 * s + j()} 40 ${ex} 44`;
  const head = `M${ex + 9 * s} ${37 + j() * 0.4}L${ex} 44L${ex + 10 * s} ${49 + j() * 0.4}`;
  return { shaft, head };
}

/**
 * A handwritten aside in the page gutter, with an arrow curling toward the
 * section it teases. Wide screens only; purely decorative.
 */
export function MarginNote({
  children,
  side,
  seed,
  className = "",
}: {
  children: ReactNode;
  side: "left" | "right";
  seed: string;
  className?: string;
}) {
  const { shaft, head } = curvedArrow(hashSeed(seed), side === "left");
  return (
    <Reveal
      variant="plain"
      aria-hidden="true"
      className={`pointer-events-none absolute hidden w-36 xl:block ${
        side === "right" ? "-right-44 rotate-[4deg]" : "-left-44 -rotate-[5deg] text-right"
      } ${className}`}
    >
      <p className="write-text text-meta font-normal text-ink-3" style={{ "--write-d": "650ms", "--write-dd": "350ms" } as React.CSSProperties}>
        {children}
      </p>
      <SketchSvg
        box={[0, 0, 72, 52]}
        className={`top-7 text-ink-3 ${side === "right" ? "left-0" : "right-0"}`}
        style={{ width: 72, height: 52 }}
      >
        <Stroke d={shaft} delay={900} duration={420} width={1.2} />
        <Stroke d={head} delay={1280} duration={180} width={1.2} />
      </SketchSvg>
    </Reveal>
  );
}

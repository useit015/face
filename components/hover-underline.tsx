"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useInkBox, useInkSeed } from "@/hooks/use-ink-box";
import { InkSvg, Stroke } from "@/lib/ink";
import { linkStroke } from "@/lib/ink-sketch";

/**
 * A pen line under its parent (which must be positioned), drawn in while
 * the nearest .ink-hover is hovered or focused, and pulled back out after.
 * The same line Ballpoint's link button inks over on hover, without the
 * light one at rest: for names that are links but shouldn't all shout it.
 */
export function HoverUnderline({ seed, className }: { seed?: string; className?: string }) {
  const s = useInkSeed(seed);
  const [ref, [w]] = useInkBox([120, 6]);
  const d = useMemo(() => linkStroke(s, w), [s, w]);
  return (
    <InkSvg ref={ref} box={[0, -2, w, 6]} stretch className={cn("inset-x-0 top-full -mt-0.5 h-1.5 w-full", className)}>
      <Stroke d={d} draw="hover" duration={280} width={1.5} />
    </InkSvg>
  );
}

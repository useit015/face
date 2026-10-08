"use client";

import type { ComponentProps } from "react";
import { useInkStage } from "@/hooks/use-ink-box";

/**
 * Words and lists with no drawing of their own, held until the pen gets to
 * them: in reading order, after the heading above them has been written.
 * What inside has .ink-land (or the stage itself, given .ink-land) settles
 * in then, each after its own --ink-dd.
 */
export function Stage({ as = "div", ...props }: ComponentProps<"div"> & { as?: "div" | "p" | "ul" }) {
  const Tag = as as "div";
  return <Tag {...useInkStage()} {...props} />;
}

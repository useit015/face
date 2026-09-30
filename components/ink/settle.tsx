"use client";

import { useEffect } from "react";

/**
 * Once a reveal stroke finishes drawing, drop its dash pattern. The stroke
 * looks identical, but it guarantees a fresh paint (Chrome can leave small
 * SVGs showing an early frame of a dash animation) and stops paying for dash
 * geometry on every later repaint.
 */
export function InkSettle() {
  useEffect(() => {
    // Tells the inline failsafe in the layout that reveals are being driven.
    document.documentElement.classList.add("hydrated");
    const onEnd = (e: AnimationEvent) => {
      if (e.animationName !== "draw") return;
      const target = e.target;
      if (target instanceof SVGElement) target.classList.add("drawn");
    };
    document.addEventListener("animationend", onEnd);
    return () => document.removeEventListener("animationend", onEnd);
  }, []);
  return null;
}

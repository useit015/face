"use client";

import { createElement, useEffect, useRef } from "react";

type CursorAvatarProps = {
  size?: number;
  label?: string;
  className?: string;
};

type AvatarFollower = {
  face: (pose: string) => void;
  ring: () => string[];
  setStepMs: (ms: number) => void;
};

const DEFAULT_STEP_MS = 70;
const PLAYFUL_STEP_MS = 45;
const QUEUE_MARGIN_MS = 25;

export function CursorAvatar({ size = 240, label, className }: CursorAvatarProps) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let walking = false;
    let direction = 1;

    const onClick = () => {
      const follower = (el as HTMLElement & { follower?: AvatarFollower | null })
        .follower;
      if (!follower || walking) return;
      // Respect reduced motion: skip the playful full-ring walk.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        follower.face("center");
        return;
      }
      walking = true;
      direction = -direction;

      const ring = follower.ring();
      const stops = direction > 0 ? ring : [...ring].reverse();
      const pace = PLAYFUL_STEP_MS + QUEUE_MARGIN_MS;

      follower.setStepMs(PLAYFUL_STEP_MS);
      stops.forEach((pose, i) => {
        window.setTimeout(() => follower.face(pose), i * pace);
      });
      window.setTimeout(() => follower.face("center"), stops.length * pace);
      window.setTimeout(() => {
        follower.setStepMs(DEFAULT_STEP_MS);
        walking = false;
      }, (stops.length + 1) * pace + 100);
    };

    el.addEventListener("click", onClick);
    return () => el.removeEventListener("click", onClick);
  }, []);

  // Render the intrinsic size from React too: the element sets the identical
  // inline style in connectedCallback, and SSR'ing it up front keeps the
  // hydration diff clean even if the module upgrades the element first.
  const elementProps: {
    size: number;
    theme: string;
    style: { width: string; height: string };
    label?: string;
    class?: string;
  } = {
    size,
    theme: "dark",
    style: { width: `${size}px`, height: `${size}px` },
  };
  if (label) elementProps.label = label;
  if (className) elementProps.class = className;

  return (
    <>
      <script async type="module" src="/cursor-avatar.js" />

      {createElement("cursor-avatar", { ...elementProps, ref })}
    </>
  );
}

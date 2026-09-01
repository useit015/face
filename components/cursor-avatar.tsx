"use client";

import { createElement } from "react";

type CursorAvatarProps = {
  size?: number;
  label?: string;
  className?: string;
};

export function CursorAvatar({ size = 240, label, className }: CursorAvatarProps) {
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

      {createElement("cursor-avatar", elementProps)}
    </>
  );
}

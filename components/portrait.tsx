"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { preloadModule } from "react-dom";
import { SketchBox } from "@/components/ink/sketch";
import { isDarkTheme } from "@/lib/theme";

type Theme = "light" | "dark";

type AvatarElement = HTMLElement & {
  ready?: Promise<void>;
  follower?: {
    face: (pose: string) => void;
    ring: () => string[];
    setStepMs: (ms: number) => void;
  } | null;
};

const MODULE_SRC = "/cursor-avatar.js";
const SHEET_BASE = "/avatar/ink/";
const THEMES: Theme[] = ["light", "dark"];
// The element renders at this size; the mobile frame scales it down.
const AVATAR_PX = 164;
const DEFAULT_STEP_MS = 70;
const PLAYFUL_STEP_MS = 45;
const QUEUE_MARGIN_MS = 25;

function ensureModule() {
  if (customElements.get("cursor-avatar") || document.querySelector(`script[src="${MODULE_SRC}"]`)) return;
  const script = document.createElement("script");
  script.type = "module";
  script.src = MODULE_SRC;
  document.head.appendChild(script);
}

/**
 * The cursor-following portrait as a ballpoint sketch. Each frame is an ink
 * mask with the backdrop hatching baked in and knocked out around the figure,
 * so nothing ever shows through the face.
 *
 * Each theme has its own sheet: blue ink on the paper by day, white ink on
 * the night paper (the light drawn in, hair and shadows left dark). Both live
 * in the same box and follow the same cursor, so theme CSS can swap them
 * instantly, inside the ink-blot transition. The inactive one loads at idle.
 *
 * A still of the centre pose renders on the server and crossfades to the live
 * element once its sheet has decoded.
 */
export function Portrait({ label, className = "" }: { label: string; className?: string }) {
  preloadModule(MODULE_SRC, { as: "script" });
  const slotRef = useRef<HTMLDivElement | null>(null);
  const [ready, setReady] = useState<Record<Theme, boolean>>({ light: false, dark: false });

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;
    let cancelled = false;
    const avatars: Partial<Record<Theme, AvatarElement>> = {};
    const timers: number[] = [];

    const mount = (theme: Theme) => {
      if (avatars[theme]) return;
      const el = document.createElement("cursor-avatar") as AvatarElement;
      el.setAttribute("size", String(AVATAR_PX));
      el.setAttribute("sheet-base", SHEET_BASE);
      el.setAttribute("theme", theme);
      el.setAttribute("label", label);
      el.className = `portrait-avatar portrait-avatar--${theme}`;
      slot.appendChild(el);
      avatars[theme] = el;
      const reveal = () => {
        if (!cancelled) setReady((r) => (r[theme] ? r : { ...r, [theme]: true }));
      };
      customElements
        .whenDefined("cursor-avatar")
        .then(() => el.ready)
        .then(reveal, reveal);
      timers.push(window.setTimeout(reveal, 5000));
    };

    const current: Theme = isDarkTheme() ? "dark" : "light";
    mount(current);
    ensureModule();

    const idle = window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1500));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const idleId = idle(() => mount(current === "dark" ? "light" : "dark"), { timeout: 4000 });
    // A switch before idle fired still gets its sheet straight away.
    const onTheme = () => mount(isDarkTheme() ? "dark" : "light");
    window.addEventListener("themechange", onTheme);

    // Click: a quick look all the way around the ring, on both sheets so they
    // stay in step.
    let walking = false;
    let direction = 1;
    const onClick = () => {
      const followers = THEMES.map((t) => avatars[t]?.follower).filter((f) => f != null);
      const lead = followers[0];
      if (!lead || walking) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        followers.forEach((f) => f.face("center"));
        return;
      }
      walking = true;
      direction = -direction;
      const ring = lead.ring();
      const stops = direction > 0 ? ring : [...ring].reverse();
      const pace = PLAYFUL_STEP_MS + QUEUE_MARGIN_MS;
      followers.forEach((f) => f.setStepMs(PLAYFUL_STEP_MS));
      stops.forEach((pose, i) =>
        timers.push(window.setTimeout(() => followers.forEach((f) => f.face(pose)), i * pace)),
      );
      timers.push(window.setTimeout(() => followers.forEach((f) => f.face("center")), stops.length * pace));
      timers.push(
        window.setTimeout(() => {
          followers.forEach((f) => f.setStepMs(DEFAULT_STEP_MS));
          walking = false;
        }, (stops.length + 1) * pace + 100),
      );
    };
    slot.addEventListener("click", onClick);

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      cancelIdle(idleId as number);
      window.removeEventListener("themechange", onTheme);
      slot.removeEventListener("click", onClick);
      THEMES.forEach((t) => avatars[t]?.remove());
    };
  }, [label]);

  return (
    <div className={`portrait relative size-[132px] shrink-0 sm:size-[176px] ${className}`}>
      <div className="absolute inset-[5px] overflow-hidden sm:inset-[6px]">
        {THEMES.map((theme) => (
          <Image
            key={theme}
            src={`/avatar/ink/still-${theme}.webp`}
            alt=""
            aria-hidden="true"
            width={164}
            height={164}
            loading="eager"
            unoptimized
            draggable={false}
            data-hidden={ready[theme]}
            className={`portrait-still portrait-still--${theme} absolute inset-0 size-full select-none`}
          />
        ))}
        <div
          ref={slotRef}
          data-ready-light={ready.light}
          data-ready-dark={ready.dark}
          className="portrait-slot relative origin-top-left scale-[0.7439] cursor-pointer select-none sm:scale-100"
          style={{ width: AVATAR_PX, height: AVATAR_PX }}
        />
      </div>
      <div className="absolute inset-0 text-ink">
        <SketchBox w={132} h={132} seed="portrait-frame-sm" delay={180} pad={5} className="sm:hidden" />
        <SketchBox w={176} h={176} seed="portrait-frame" delay={180} pad={5} className="hidden sm:block" />
      </div>
    </div>
  );
}

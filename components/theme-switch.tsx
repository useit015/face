"use client";

import { useSyncExternalStore } from "react";
import { InkThemeToggle } from "@/components/ui/ink-theme-toggle";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { isDarkTheme, subscribeTheme } from "@/lib/theme";

/** Ballpoint's theme toggle, sized to sit with the hand-drawn icons beside it. */
export function ThemeSwitch({ className }: { className?: string }) {
  const dark = useSyncExternalStore(subscribeTheme, isDarkTheme, () => false);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <InkThemeToggle
            seed="theme-toggle"
            className={className}
          />
        }
      />
      <TooltipContent side="bottom" seed="theme-tip">
        {dark ? "Light theme" : "Dark theme"}
      </TooltipContent>
    </Tooltip>
  );
}

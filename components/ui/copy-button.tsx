"use client";

import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { InkGlyph } from "@/lib/ink-glyphs";
import { Button } from "@/components/ui/button";
import { InkIcon } from "@/components/ui/ink-icons";

const swap = "flex items-center justify-center gap-1.5 transition-[opacity,translate] duration-(--dur-hover) ease-out [grid-area:1/1] motion-reduce:transition-none";

/** Puts text on the clipboard; falls back to a hidden selection where the Clipboard API isn't allowed (plain http). */
async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const area = Object.assign(document.createElement("textarea"), { value: text, readOnly: true });
    area.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.append(area);
    area.select();
    try {
      return document.execCommand("copy");
    } catch {
      return false;
    } finally {
      area.remove();
    }
  }
}

/**
 * A button that copies `value`. Its label swaps for a pen-drawn tick and
 * "Copied" (the button keeps its width), then swaps back; icon sizes swap
 * the copy icon for the tick. Screen readers hear "Copied to clipboard".
 */
function CopyButton({
  value,
  children = "Copy",
  copiedLabel = "Copied",
  timeout = 1600,
  onCopy,
  onClick,
  variant = "outline",
  size,
  className,
  "aria-label": ariaLabel,
  ...props
}: Omit<ComponentProps<typeof Button>, "value" | "children" | "onCopy"> & {
  /** The text to copy, or a function that returns it when clicked. */
  value: string | (() => string);
  /** The label. Icon sizes show the copy icon instead and use this as the accessible name. */
  children?: ReactNode;
  copiedLabel?: ReactNode;
  /** ms before it goes back to the label. */
  timeout?: number;
  onCopy?: (value: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  // Bumped on every copy, so the tick draws in again each time.
  const [round, setRound] = useState(0);
  const [status, setStatus] = useState("");
  const timer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timer.current), []);

  const icon = typeof size === "string" && size.startsWith("icon");

  async function copy() {
    const text = typeof value === "function" ? value() : value;
    const ok = await writeClipboard(text);
    window.clearTimeout(timer.current);
    setStatus(ok ? "Copied to clipboard" : "Couldn't copy");
    if (ok) {
      onCopy?.(text);
      setCopied(true);
      setRound((r) => r + 1);
    }
    timer.current = window.setTimeout(() => {
      setCopied(false);
      setStatus("");
    }, timeout);
  }

  return (
    <>
      <Button
        data-slot="copy-button"
        data-copied={copied ? "" : undefined}
        variant={variant}
        size={size}
        className={cn("inline-grid place-items-center", className)}
        aria-label={icon ? (ariaLabel ?? (typeof children === "string" ? children : "Copy")) : ariaLabel}
        onClick={(event) => {
          onClick?.(event);
          void copy();
        }}
        {...props}
      >
        <span aria-hidden={copied || undefined} className={cn(swap, copied ? "-translate-y-1 opacity-0" : "opacity-100")}>
          {icon ? <InkIcon name="copy" /> : children}
        </span>
        <span aria-hidden={!copied || undefined} className={cn(swap, copied ? "opacity-100" : "translate-y-1 opacity-0")}>
          {copied && <InkGlyph key={round} name="check" draw="mount" duration={300} />}
          {!icon && copiedLabel}
        </span>
      </Button>
      <span role="status" className="sr-only">
        {status}
      </span>
    </>
  );
}

export { CopyButton };

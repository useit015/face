"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

const labelSwap =
  "inline-flex items-center gap-1.5 whitespace-nowrap transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none";

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
    } catch {
      window.location.href = `mailto:${email}`;
      return;
    }
    setCopied(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <>
      <button
        type="button"
        onClick={copy}
        title="Copy email address"
        className="squircle relative inline-flex h-8 shrink-0 cursor-pointer items-center rounded-lg border border-border px-2.5 text-body font-medium whitespace-nowrap text-foreground-secondary outline-none select-none before:absolute before:-inset-y-[6px] before:-inset-x-1 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] transition-[background-color,color,transform] duration-200"
      >
        {/* Both labels share one grid cell: the button never changes width,
            and the swap reads as a small vertical hand-off. */}
        <span className="grid justify-items-center">
          <span
            aria-hidden={copied}
            style={{ gridArea: "1 / 1" }}
            className={`${labelSwap} ${
              copied ? "opacity-0 -translate-y-1" : "opacity-100 translate-y-0"
            }`}
          >
            Copy email
          </span>
          <span
            aria-hidden={!copied}
            style={{ gridArea: "1 / 1" }}
            className={`${labelSwap} ${
              copied ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
            }`}
          >
            <Check className="size-3.5" aria-hidden="true" />
            Copied.
          </span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Copied to clipboard." : ""}
      </span>
    </>
  );
}

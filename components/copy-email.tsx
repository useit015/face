"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

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
    <button
      type="button"
      onClick={copy}
      title="Copy email address"
      aria-live="polite"
      className="squircle relative inline-flex h-8 shrink-0 cursor-pointer items-center rounded-lg border border-border px-2.5 text-body font-medium whitespace-nowrap text-foreground-secondary outline-none select-none before:absolute before:-inset-y-[6px] before:-inset-x-1 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] transition-[background-color,color,transform] duration-200"
    >
      {copied ? (
        <span className="inline-flex items-center gap-1.5">
          <Check className="size-3.5" aria-hidden="true" />
          Copied.
        </span>
      ) : (
        "Copy email"
      )}
    </button>
  );
}

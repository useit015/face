"use client";

import { useEffect, useRef, useState } from "react";

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
      className="squircle inline-flex h-8 shrink-0 cursor-pointer items-center whitespace-nowrap rounded-lg border border-border px-2.5 text-body font-medium text-foreground-secondary transition-[background-color,color,transform] duration-200 outline-none select-none hover:bg-muted hover:text-foreground active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {copied ? "Copied." : "Copy email"}
    </button>
  );
}

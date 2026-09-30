"use client";

import { useEffect, useRef, useState } from "react";
import { MeasuredBox } from "@/components/ink/measured";
import { hashSeed, lineStroke } from "@/lib/sketch";

const labelSwap =
  "inline-flex items-center gap-1.5 whitespace-nowrap transition-[opacity,translate] duration-200 ease-out motion-reduce:transition-none";

const tick = [
  lineStroke(hashSeed("tick-a"), [1, 7], [5, 11], { bow: 0.3, jitter: 0.3 }),
  lineStroke(hashSeed("tick-b"), [5, 11], [13, 1], { bow: 0.6, jitter: 0.3 }),
];

export function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);
  const [round, setRound] = useState(0);
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
    setRound((r) => r + 1);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <>
      <button type="button" onClick={copy} title={`Copy ${email}`} className="ink-btn text-ink">
        <MeasuredBox seed="copy-email" estimate={[124, 44]} delay={660} />
        {/* Both labels share one grid cell so the button never changes width. */}
        <span className="grid justify-items-center">
          <span
            aria-hidden={copied}
            style={{ gridArea: "1 / 1" }}
            className={`${labelSwap} ${copied ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"}`}
          >
            Copy email
          </span>
          <span
            aria-hidden={!copied}
            style={{ gridArea: "1 / 1" }}
            className={`${labelSwap} ${copied ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
          >
            <svg key={round} viewBox="0 0 14 12" aria-hidden="true" className="sketch copied-tick size-3.5 overflow-visible">
              {tick.map((d, i) => (
                <path key={i} d={d} pathLength={1} strokeWidth={1.6} style={{ animationDelay: `${i * 110}ms` }} />
              ))}
            </svg>
            Copied.
          </span>
        </span>
      </button>
      <span role="status" className="sr-only">
        {copied ? "Email address copied to clipboard." : ""}
      </span>
    </>
  );
}

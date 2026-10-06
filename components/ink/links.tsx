import type { ReactNode } from "react";
import { hashSeed, lineStroke } from "@/lib/sketch";
import { MeasuredBox } from "@/components/ink/measured";

const external = { target: "_blank", rel: "noreferrer" } as const;

/** Inline text link: lightly underlined at rest, inked over on hover. */
export function InkLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} {...(href.startsWith("http") ? external : {})} className="ink-link text-ink">
      {children}
    </a>
  );
}

const arrow = [
  lineStroke(hashSeed("cta-shaft"), [1, 11], [11, 1], { bow: 0.5, jitter: 0.3 }),
  `M4.2 0.8C6.8 0.9 9.3 0.6 11.2 0.9C11.4 3 11 5.6 11.3 7.9`,
];

/** Primary action: a box shaded solid with pen strokes, paper-coloured type. */
export function InkButton({
  href,
  children,
  seed,
  estimate,
  delay = 0,
}: {
  href: string;
  children: ReactNode;
  seed: string;
  estimate: readonly [number, number];
  delay?: number;
}) {
  return (
    <a href={href} {...(href.startsWith("http") ? external : {})} className="ink-btn ink-btn--solid">
      <MeasuredBox seed={seed} estimate={estimate} filled delay={delay} />
      <span className="relative">{children}</span>
      <svg viewBox="-1 -1 14 14" aria-hidden="true" className="sketch nudge relative size-3.5 overflow-visible !text-paper">
        {arrow.map((d, i) => (
          <path key={i} d={d} style={{ strokeWidth: 1.6 }} />
        ))}
      </svg>
    </a>
  );
}

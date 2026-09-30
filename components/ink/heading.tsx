import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { Underline } from "@/components/ink/sketch";

/** Section title in block capitals, written in and underlined with a swoosh. */
export function SectionHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <Reveal variant="plain" className="relative inline-block">
      <h2 id={id} className="write-text text-heading font-bold uppercase tracking-[0.07em]">
        {children}
      </h2>
      <Underline seed={`${id}-underline`} delay={420} className="top-full -mt-0.5" />
    </Reveal>
  );
}

export function SectionHeader({ id, title, action }: { id: string; title: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <SectionHeading id={id}>{title}</SectionHeading>
      {action}
    </div>
  );
}

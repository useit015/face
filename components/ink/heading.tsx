import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { Specks, Underline } from "@/components/ink/sketch";

/** Section title in block capitals, written in and underlined with a swoosh. */
export function SectionHeading({ id, specks = false, children }: { id: string; specks?: boolean; children: ReactNode }) {
  return (
    <Reveal variant="plain" className="relative inline-block">
      <h2 id={id} className="write-text text-heading font-bold uppercase tracking-[0.07em]">
        {children}
      </h2>
      <Underline seed={`${id}-underline`} w={typeof children === "string" ? children.length * 17 : 140} delay={420} className="top-full -mt-1" />
      {specks && <Specks seed={`${id}-specks`} delay={1150} className="top-full -right-14 mt-0.5" />}
    </Reveal>
  );
}

export function SectionHeader({ id, title, action, specks }: { id: string; title: ReactNode; action?: ReactNode; specks?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <SectionHeading id={id} specks={specks}>
        {title}
      </SectionHeading>
      {action}
    </div>
  );
}

import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";
import { Expandable } from "@/components/expandable";
import { Glyph } from "@/components/glyph";
import { HoverUnderline } from "@/components/hover-underline";
import { Period } from "@/components/period";
import { Stack } from "@/components/stack";
import { InkIcon } from "@/components/ui/ink-icons";
import { Timeline, TimelineItem } from "@/components/ui/timeline";
import { Stroke } from "@/lib/ink";
import { InkOutline } from "@/lib/ink-outline";
import { hashSeed, lineStroke } from "@/lib/ink-sketch";
import { experience, type Role } from "@/lib/content";

// The collapsed view shows the latest few roles: across the page on a
// hand-drawn arrow where there's room, down a line where there isn't.
const LATEST = 4;
const latest = experience.slice(0, LATEST);

// A short dash for a bullet, the same one on every line.
const dash = lineStroke(hashSeed("bullet"), [0.5, 3], [8.5, 2.4], { bow: 0.4, jitter: 0.3 });

/** The company's mark in a box gone over twice. */
function RoleTile({ role, className }: { role: Role; className?: string }) {
  return (
    <span data-flip={`tile-${role.company}`} className={cn("relative flex size-[46px] shrink-0 items-center justify-center", className)}>
      <InkOutline pen={{ draw: "none", passes: 2 }} seed={`tile-${role.company}`} estimate={[46, 46]} pad={8} className="text-ink" />
      <Glyph name={role.icon} className="boil size-[38px]" />
    </span>
  );
}

/** The company, linked to its site when it has one. */
function Company({ role, className }: { role: Role; className?: string }) {
  const flip = `name-${role.company}`;
  if (!role.url)
    return (
      <span data-flip={flip} className={className}>
        {role.company}
      </span>
    );
  return (
    <a
      data-flip={flip}
      href={role.url}
      target="_blank"
      rel="noreferrer"
      className={cn("ink-hover group/co inline-flex w-fit max-w-full items-baseline gap-1 text-ink outline-none focus-visible:outline-solid", className)}
    >
      <span className="relative min-w-0">
        {role.company}
        <HoverUnderline seed={`co-${role.company}`} />
      </span>
      <InkIcon
        name="arrow-up-right"
        className="size-3.5 shrink-0 translate-y-[-0.1em] text-ink-4 transition-[color,translate] duration-(--dur-hover) ease-out group-hover/co:translate-x-0.5 group-hover/co:-translate-y-[0.2em] group-hover/co:text-ink group-focus-visible/co:text-ink motion-reduce:transition-none"
      />
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function When({ role, className }: { role: Role; className?: string }) {
  return (
    <span data-flip={`period-${role.company}`} className={cn("block", className)}>
      <Period period={role.period} />
    </span>
  );
}

/** Collapsed: the latest roles, landing as the pen reaches them. */
function Latest() {
  return (
    <div className="pt-1">
      {/* Wide: across the page. */}
      <Timeline seed="experience-arrow" className="@max-[40rem]:hidden" aria-label="Latest roles">
        {latest.map((role) => (
          <TimelineItem key={role.company} className="gap-0">
            <RoleTile role={role} className="mb-3" />
            <Company role={role} className="text-xl leading-tight font-bold" />
            <When role={role} className="mt-0.5 text-sm text-ink-2" />
          </TimelineItem>
        ))}
      </Timeline>
      {/* Narrow: down the side. */}
      <Timeline orientation="vertical" seed="experience-line" className="mt-5 @min-[40rem]:hidden" aria-label="Latest roles">
        {latest.map((role) => (
          <TimelineItem key={role.company} className="[&>svg]:top-4">
            <div className="flex min-w-0 items-center gap-3.5">
              <RoleTile role={role} />
              <div className="min-w-0">
                <Company role={role} className="text-xl leading-tight font-bold" />
                <When role={role} className="text-ink-2" />
              </div>
            </div>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

/** Expanded: every role, with what was done there. */
function AllRoles() {
  return (
    <div className="pt-6">
      {/* Drawn finished: the section's own move brings each role in. */}
      <Timeline orientation="vertical" seed="experience-line" draw="none" aria-label="All roles">
        {experience.map((role, i) => (
          <TimelineItem key={role.company} className="gap-0 [&>svg]:top-4" style={{ "--i": i } as CSSProperties}>
            <div className="flex min-w-0 items-center gap-3.5">
              <RoleTile role={role} />
              <div className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="min-w-0 text-xl leading-tight font-bold">
                  <Company role={role} />
                </h3>
                <When role={role} className="text-sm text-ink-3" />
                <p data-enter className="w-full text-ink-2">
                  {role.title}
                </p>
              </div>
            </div>
            <p data-enter className="mt-3 max-w-[62ch]">
              {role.summary}
            </p>
            <ul data-enter className="mt-2 flex max-w-[62ch] flex-col gap-1.5 text-ink-2">
              {role.bullets.map((bullet) => (
                <li key={bullet} className="flex gap-2.5">
                  <svg aria-hidden="true" viewBox="0 0 9 5" className="ink-sketch mt-[0.7em] h-[5px] w-[9px] shrink-0 text-ink-3">
                    <Stroke d={dash} width={1.3} />
                  </svg>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
            <span data-enter className="mt-2.5 block">
              <Stack items={role.stack} />
            </span>
          </TimelineItem>
        ))}
      </Timeline>
    </div>
  );
}

export function Experience() {
  return (
    <section aria-labelledby="experience-heading" className="@container">
      <Expandable headingId="experience-heading" title="Experience" label={`See ${experience.length - LATEST} more`} collapsed={<Latest />} duration={0.65}>
        <AllRoles />
      </Expandable>
    </section>
  );
}

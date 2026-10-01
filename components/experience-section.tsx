import type { CSSProperties } from "react";
import { Expandable } from "@/components/expandable";
import { Reveal } from "@/components/reveal";
import { Glyph } from "@/components/ink/glyph";
import { IconTile, InkDot, SketchSvg, Stroke, TimelineArrow } from "@/components/ink/sketch";
import { hashSeed, lineStroke } from "@/lib/sketch";
import { experience, type Role } from "@/lib/content";

const STRIP = 4;
// The timeline arrow draws over ARROW_MS on a steady curve (--ease-write);
// these are the fractions of that time at which the pen passes each column's
// dot (0, ¼, ½, ¾ of the width), so each column lands as the line reaches it.
const ARROW_DELAY = 120;
const ARROW_MS = 1000;
const ARRIVE = [0.06, 0.335, 0.5, 0.665];
const arrival = (i: number) => Math.round(ARROW_DELAY + ARROW_MS * ARRIVE[i]);

function CompanyName({ role, className = "" }: { role: Role; className?: string }) {
  if (!role.url) return <span className={className}>{role.company}</span>;
  return (
    <a
      href={role.url}
      target="_blank"
      rel="noreferrer"
      className={`ink-hover group/co inline-flex min-w-0 items-baseline gap-1 text-ink ${className}`}
    >
      <span className="pen-underline truncate">{role.company}</span>
      <Glyph
        name="external-link"
        className="size-3 shrink-0 translate-y-[-1px] text-ink-3 opacity-0 transition-[opacity,translate] duration-200 group-hover/co:translate-x-0.5 group-hover/co:opacity-100 group-focus-visible/co:opacity-100 motion-reduce:transition-none"
      />
    </a>
  );
}

/** The collapsed view: four stops on a hand-drawn timeline arrow. */
function Strip() {
  return (
    <Reveal variant="plain" className="relative pt-7">
      <TimelineArrow seed="experience-arrow" delay={ARROW_DELAY} className="left-0 top-[22px] hidden h-3 min-[860px]:block" />
      <ol className="grid grid-cols-2 gap-x-4 gap-y-7 min-[860px]:grid-cols-4 min-[860px]:gap-y-0">
        {experience.slice(0, STRIP).map((role, i) => (
          <li
            key={role.company}
            className="strip-col close-in relative flex min-w-0 flex-col gap-2 min-[860px]:pt-6"
            style={{ "--i": i, "--col-delay": `${arrival(i) - 40}ms` } as CSSProperties}
          >
            <InkDot seed={`dot-${role.company}`} r={4.4} delay={arrival(i)} className="-top-[6.5px] left-0 hidden min-[860px]:block" />
            <div className="flex min-w-0 items-center gap-3.5">
              <IconTile seed={`tile-${role.company}`} size={46} delay={arrival(i) + 80}>
                <Glyph name={role.icon} className="boil size-[38px]" />
              </IconTile>
              <CompanyName role={role} className="text-body leading-tight font-bold sm:text-[1.5rem]" />
            </div>
            <p className="truncate text-body text-ink-2">{role.period}</p>
          </li>
        ))}
      </ol>
    </Reveal>
  );
}

const bulletDash = lineStroke(hashSeed("bullet"), [0.5, 3], [8.5, 2.4], { bow: 0.4, jitter: 0.3 });

/** The expanded view: every role, with the timeline turned vertical. */
function Details() {
  return (
    <div className="relative pt-8">
      <SketchSvg box={[0, 0, 3, 600]} stretch className="left-[22px] top-14 h-[calc(100%-6rem)] w-[3px] text-ink-4">
        <Stroke d={lineStroke(hashSeed("experience-spine"), [1.5, 0], [1.5, 600], { bow: 0.3, jitter: 0.6 })} mode="static" />
      </SketchSvg>
      <ol className="relative flex flex-col gap-8">
        {experience.map((role, i) => (
          <li key={role.company} className="open-in relative flex gap-4" style={{ "--i": i } as CSSProperties}>
            <IconTile seed={`tile-${role.company}`} size={46} mode="static" className="mt-0.5 bg-paper">
              <Glyph name={role.icon} className="boil size-[38px]" />
            </IconTile>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="min-w-0 text-[1.5rem] leading-tight font-bold">
                  <CompanyName role={role} />
                </h3>
                <p className="shrink-0 text-meta font-normal text-ink-3">{role.period}</p>
              </div>
              <p className="text-body font-normal text-ink-2">{role.title}</p>
              <ul className="mt-2 flex max-w-[62ch] flex-col gap-1.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-body text-ink-2">
                    <svg aria-hidden="true" viewBox="0 0 9 5" className="sketch mt-[0.72em] h-[5px] w-[9px] shrink-0 overflow-visible text-ink-3">
                      <path d={bulletDash} strokeWidth={1.3} />
                    </svg>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function ExperienceSection() {
  return (
    <section aria-labelledby="experience-heading">
      <Expandable
        headingId="experience-heading"
        title="Experience"
        label={`See ${experience.length - STRIP} more`}
        collapsed={<Strip />}
        duration={0.65}
      >
        <Details />
      </Expandable>
    </section>
  );
}

import type { CSSProperties } from "react";
import { Expandable } from "@/components/expandable";
import { Reveal } from "@/components/reveal";
import { Glyph } from "@/components/ink/glyph";
import { IconTile, InkDot, SketchSvg, Stroke, TimelineArrow } from "@/components/ink/sketch";
import { hashSeed, lineStroke } from "@/lib/sketch";
import { experience, type Role } from "@/lib/content";

// The collapsed timeline shows as many stops as fit the section: 2, 3 or 4
// columns, switched by container queries (thresholds in globals.css and the
// classes below), so it never squeezes a company name.
const STRIP = 4;
const LAYOUTS = [2, 3, 4] as const;

// The timeline arrow draws over ARROW_MS on a steady curve (--ease-write,
// cubic-bezier(0.37, 0, 0.63, 1)). A column lands when the pen passes its
// dot, at i/cols of the width, so invert the curve to find that moment.
const ARROW_DELAY = 120;
const ARROW_MS = 1000;
function penReaches(fraction: number) {
  const bez = (t: number, a: number, b: number) => 3 * (1 - t) ** 2 * t * a + 3 * (1 - t) * t * t * b + t ** 3;
  let lo = 0;
  let hi = 1;
  for (let k = 0; k < 24; k++) {
    const mid = (lo + hi) / 2;
    // Progress along the line at curve parameter `mid`, versus the target.
    if (bez(mid, 0, 1) < fraction) lo = mid;
    else hi = mid;
  }
  return bez(lo, 0.37, 0.63);
}
const arrival = (i: number, cols: number) => Math.round(ARROW_DELAY + ARROW_MS * Math.max(0.06, penReaches(i / cols)));

// Hide the stops a narrower layout has no room for.
const hiddenBelow = (i: number) => (i >= 3 ? "@max-[45rem]:hidden" : i >= 2 ? "@max-[33rem]:hidden" : "");

function CompanyName({ role, className = "" }: { role: Role; className?: string }) {
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

/** The collapsed view: the first few stops on a hand-drawn timeline arrow. */
function Strip() {
  return (
    <Reveal variant="plain" className="relative pt-7">
      <div data-enter className="absolute inset-x-0 top-[22px] h-3">
        <TimelineArrow seed="experience-arrow" delay={ARROW_DELAY} className="left-0 top-0 h-3" />
      </div>
      <ol className="grid grid-cols-2 gap-x-4 @min-[33rem]:grid-cols-3 @min-[45rem]:grid-cols-4">
        {experience.slice(0, STRIP).map((role, i) => (
          <li
            key={role.company}
            className={`strip-col relative flex min-w-0 flex-col gap-2 pt-6 ${hiddenBelow(i)}`}
            // When the pen reaches this stop in each layout; CSS picks one
            // and offsets the stop's own strokes (dot, tile) by it.
            style={
              {
                "--i": i,
                ...Object.fromEntries(LAYOUTS.map((cols) => [`--at-${cols}`, `${arrival(Math.min(i, cols - 1), cols)}ms`])),
              } as CSSProperties
            }
          >
            <span data-enter className="absolute -top-[6.5px] left-0">
              <InkDot seed={`dot-${role.company}`} r={4.4} />
            </span>
            <div className="flex min-w-0 items-center gap-3.5">
              <IconTile seed={`tile-${role.company}`} size={46} delay={80} flip={`tile-${role.company}`}>
                <Glyph name={role.icon} className="boil size-[38px]" />
              </IconTile>
              <CompanyName role={role} className="text-body leading-tight font-bold sm:text-[1.5rem]" />
            </div>
            <p data-flip={`period-${role.company}`} className="truncate text-body text-ink-2">
              {role.period}
            </p>
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
      <div data-enter className="absolute inset-0">
        <SketchSvg box={[0, 0, 3, 600]} stretch className="left-[22px] top-14 h-[calc(100%-6rem)] w-[3px] text-ink-4">
          <Stroke d={lineStroke(hashSeed("experience-spine"), [1.5, 0], [1.5, 600], { bow: 0.3, jitter: 0.6 })} mode="static" />
        </SketchSvg>
      </div>
      <ol className="relative flex flex-col gap-8">
        {experience.map((role, i) => (
          <li key={role.company} className="relative flex gap-4" style={{ "--i": i } as CSSProperties}>
            <IconTile seed={`tile-${role.company}`} size={46} mode="static" className="mt-0.5 bg-paper" flip={`tile-${role.company}`}>
              <Glyph name={role.icon} className="boil size-[38px]" />
            </IconTile>
            <div className="min-w-0 flex-1">
              <div className="flex min-w-0 flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="min-w-0 text-[1.5rem] leading-tight font-bold">
                  <CompanyName role={role} />
                </h3>
                <p data-flip={`period-${role.company}`} className="shrink-0 text-meta font-normal text-ink-3">
                  {role.period}
                </p>
              </div>
              <p data-enter className="text-body font-normal text-ink-2">
                {role.title}
              </p>
              <ul data-enter className="mt-2 flex max-w-[62ch] flex-col gap-1.5">
                {role.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2.5 text-body text-ink-2">
                    <svg aria-hidden="true" viewBox="0 0 9 5" className="sketch mt-[0.72em] h-[5px] w-[9px] shrink-0 overflow-visible text-ink-3">
                      <path d={bulletDash} style={{ strokeWidth: 1.3 }} />
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
    <section aria-labelledby="experience-heading" className="@container">
      <Expandable
        headingId="experience-heading"
        title="Experience"
        label={
          <>
            <span className="@min-[33rem]:hidden">See {experience.length - 2} more</span>
            <span className="@max-[33rem]:hidden @min-[45rem]:hidden">See {experience.length - 3} more</span>
            <span className="@max-[45rem]:hidden">See {experience.length - STRIP} more</span>
          </>
        }
        collapsed={<Strip />}
        duration={0.65}
      >
        <Details />
      </Expandable>
    </section>
  );
}

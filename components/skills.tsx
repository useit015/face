import type { CSSProperties } from "react";
import { Expandable } from "@/components/expandable";
import { Glyph } from "@/components/glyph";
import { HoverUnderline } from "@/components/hover-underline";
import { ScrollFadeX } from "@/components/scroll-fade-x";
import { Stage } from "@/components/stage";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { skillGroups } from "@/lib/content";
import type { GlyphName } from "@/lib/glyphs";

type Skill = { readonly name: string; readonly icon: GlyphName; readonly url: string };

/** When a part lands, ms from when the pen gets to the list. */
const lands = (ms: number) => ({ className: "ink-land", style: { "--ink-d": "460ms", "--ink-dd": `${ms}ms` } as CSSProperties });

/** A skill: its glyph and name, the name underlined with the pen on hover. Links to the tool's own site. */
function SkillChip({ skill, flip, style, className }: { skill: Skill; flip: string; style?: CSSProperties; className?: string }) {
  return (
    <li data-flip={flip} className={cn("shrink-0", className)} style={style}>
      <a
        href={skill.url}
        target="_blank"
        rel="noreferrer"
        className="ink-hover relative flex h-11 items-center gap-2 px-2.5 whitespace-nowrap text-ink outline-none focus-visible:outline-solid focus-visible:outline-[1.5px] focus-visible:-outline-offset-2 focus-visible:outline-ring focus-visible:[border-radius:var(--hand-radius)]"
      >
        <Glyph name={skill.icon} className="boil size-[30px]" />
        <span className="relative">
          {skill.name}
          <HoverUnderline seed={`skill-${skill.name}`} />
        </span>
        <span className="sr-only"> (opens in a new tab)</span>
      </a>
    </li>
  );
}

/** A group's name and, beside it on wider screens, a rule; ruled `rule` ms after the pen gets to the list, when given. */
function RowLabel({ label, rule, className, style }: { label: string; rule?: number; className?: string; style?: CSSProperties }) {
  return (
    <div className={cn("flex items-start justify-between gap-2 min-[30rem]:pt-3 min-[30rem]:pr-1", className)} style={style}>
      <h3 data-flip={`label-${label}`} className="text-sm font-bold tracking-[0.06em] uppercase">
        {label}
      </h3>
      <span data-flip={`rule-${label}`} className="-mt-1.5 hidden h-9 min-[30rem]:flex">
        <Separator orientation="vertical" seed={`rule-${label}`} {...(rule === undefined ? {} : { draw: "mount", delay: rule })} />
      </span>
    </div>
  );
}

const rowGrid = "grid grid-cols-1 gap-y-0.5 min-[30rem]:grid-cols-[11rem_minmax(0,1fr)] min-[30rem]:gap-x-3";

/**
 * Collapsed: each group on one line, the core of it, scrolled sideways if
 * it must be. Once the title is written the rows settle in, top to bottom,
 * each label then its skills left to right, ruled off as they come.
 */
function CoreRows() {
  return (
    <Stage className="flex flex-col gap-3 pt-3">
      {skillGroups.map((group, i) => (
        <div key={group.label} className={rowGrid} style={{ "--i": i } as CSSProperties}>
          <RowLabel label={group.label} rule={i * 110 + 120} {...lands(i * 110)} />
          <ScrollFadeX as="ul" className="no-scrollbar -mx-3 flex flex-nowrap overflow-x-auto px-0.5 py-1">
            {group.skills.map((skill, j) => (
              <SkillChip key={skill.name} skill={skill} flip={`${group.label}/${skill.name}`} {...lands(i * 110 + 50 + j * 35)} />
            ))}
          </ScrollFadeX>
        </div>
      ))}
    </Stage>
  );
}

/** Expanded: every group in full, wrapping. */
function AllSkills() {
  return (
    <div className="flex flex-col gap-3 pt-3">
      {skillGroups.map((group, i) => (
        <div key={group.label} className={rowGrid} style={{ "--i": i } as CSSProperties}>
          <RowLabel label={group.label} />
          <ul className="-mx-2.5 flex flex-wrap px-0 py-1">
            {group.skills.map((skill) => (
              <SkillChip key={skill.name} skill={skill} flip={`${group.label}/${skill.name}`} />
            ))}
            {/* Only in the full list, so these settle in once the rest have moved. */}
            {group.more.map((skill, j) => (
              <SkillChip key={skill.name} skill={skill} flip={`${group.label}/${skill.name}`} style={{ "--i": i + 2 + j * 0.6 } as CSSProperties} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Skills() {
  return (
    <section aria-labelledby="skills-heading">
      <Expandable headingId="skills-heading" title="Skills" label="See more" collapsed={<CoreRows />} specks>
        <AllSkills />
      </Expandable>
    </section>
  );
}

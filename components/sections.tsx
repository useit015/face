import type { CSSProperties } from "react";
import { Expandable } from "@/components/expandable";
import { Reveal } from "@/components/reveal";
import { ScrollFadeX } from "@/components/scroll-fade-x";
import { Glyph } from "@/components/ink/glyph";
import { VRule } from "@/components/ink/sketch";
import { skillGroups } from "@/lib/content";
import type { GlyphName } from "@/lib/glyphs";

type Skill = { readonly name: string; readonly icon: GlyphName; readonly url: string };

function SkillChip({ skill, className = "", style }: { skill: Skill; className?: string; style?: CSSProperties }) {
  return (
    <li className={`shrink-0 ${className}`} style={style}>
      <a
        href={skill.url}
        target="_blank"
        rel="noopener noreferrer"
        className="ink-hover inline-flex items-center gap-1.5 py-0.5 text-body text-ink-2 transition-colors duration-200 hover:text-ink"
      >
        <Glyph name={skill.icon} className="boil size-[25px]" />
        <span className="pen-underline">{skill.name}</span>
      </a>
    </li>
  );
}

function RowLabel({ label, seed }: { label: string; seed: string }) {
  return (
    <div className="flex items-start justify-between gap-2 min-[480px]:pt-[7px] min-[480px]:pr-1">
      <h3 className="text-label font-bold tracking-[0.06em] text-ink-2 uppercase">{label}</h3>
      <span className="relative -mt-[5px] hidden h-[30px] w-[3px] shrink-0 min-[480px]:block">
        <VRule seed={seed} h={28} className="left-0 top-0" />
      </span>
    </div>
  );
}

const rowGrid = "grid grid-cols-1 gap-y-1 min-[480px]:grid-cols-[10.75rem_minmax(0,1fr)] min-[480px]:gap-x-4";

function CompactRows() {
  return (
    <Reveal variant="stagger" className="flex flex-col gap-3.5 pt-7">
      {skillGroups.map((group, i) => (
        <div key={group.label} className={`close-in ${rowGrid}`} style={{ "--i": i } as CSSProperties}>
          <RowLabel label={group.label} seed={`vr-${group.label}`} />
          <ScrollFadeX as="ul" className="no-scrollbar flex flex-nowrap gap-x-4 overflow-x-auto">
            {group.skills.map((skill) => (
              <SkillChip key={skill.name} skill={skill} />
            ))}
          </ScrollFadeX>
        </div>
      ))}
    </Reveal>
  );
}

function FullRows() {
  return (
    <div className="flex flex-col gap-4 pt-7">
      {skillGroups.map((group, i) => (
        <div key={group.label} className={`open-in ${rowGrid}`} style={{ "--i": i } as CSSProperties}>
          <RowLabel label={group.label} seed={`vr-${group.label}`} />
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5">
            {group.skills.map((skill) => (
              <SkillChip key={skill.name} skill={skill} />
            ))}
            {group.more.map((skill, j) => (
              <SkillChip
                key={skill.name}
                skill={skill}
                className="open-in"
                style={{ "--i": i + 2 + j * 0.6 } as CSSProperties}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function SkillsSection() {
  return (
    <section aria-labelledby="skills-heading">
      <Expandable headingId="skills-heading" title="Skills" label="See more" collapsed={<CompactRows />}>
        <FullRows />
      </Expandable>
    </section>
  );
}

import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import { Reveal } from "@/components/reveal";
import { Expandable } from "@/components/expandable";
import { SkillIcon } from "@/components/icons";
import { experience, skillGroups, type Role } from "@/lib/content";

function TimelineDot({ active }: { active?: boolean }) {
  return (
    <span className="relative -mt-1 inline-flex size-[7px] items-center justify-center">
      {active && (
        <span
          aria-hidden="true"
          className="timeline-status-halo absolute size-6 rounded-full"
        />
      )}
      <span
        className={`relative z-10 inline-block size-[7px] rounded-full squircle ${
          active ? "bg-foreground" : "bg-foreground-quaternary"
        }`}
      />
    </span>
  );
}

function RoleDetail({ role }: { role: Role }) {
  return (
    <div className="group/role relative flex min-w-0 gap-3 before:absolute before:-inset-x-3 before:-inset-y-2.5 before:squircle before:rounded-xl before:content-[''] hover:before:bg-timeline-hover [&>*]:relative">
      <span className="squircle mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
        <SkillIcon name={role.icon} className="size-4 text-foreground-secondary" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <h3 className="flex min-w-0 items-center gap-1.5 text-sm font-medium tracking-tight">
            {role.company}
            {role.url && (
              <ArrowUpRight className="size-3 shrink-0 text-foreground-tertiary" />
            )}
          </h3>
          <p className="shrink-0 text-[12px] text-foreground-tertiary tabular-nums">
            {role.period}
          </p>
        </div>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">{role.title}</p>
        {role.bullets.length > 0 && (
          <ul className="mt-2.5 flex flex-col gap-1">
            {role.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-2 text-[13px] leading-relaxed text-foreground-tertiary"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.45em] size-1 shrink-0 rounded-full bg-foreground-quaternary"
                />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SkillRow({
  label,
  skills,
  more,
  expanded,
}: {
  label: string;
  skills: readonly { readonly name: string; readonly icon: string }[];
  more?: readonly { readonly name: string; readonly icon: string }[];
  expanded?: boolean;
}) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-x-3 min-[480px]:grid-cols-[8rem_minmax(0,1fr)]">
      <h3 className="pt-0.5 text-[13px] text-muted-foreground">{label}</h3>
      <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
        {skills.map((skill) => (
          <li key={skill.name}>
            <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground-secondary">
              <SkillIcon name={skill.icon} className="size-3.5 shrink-0 text-foreground-tertiary" />
              {skill.name}
            </span>
          </li>
        ))}
        {expanded &&
          more?.map((skill, i) => (
            <li key={skill.name} className="chip-in" style={{ "--i": i } as CSSProperties}>
              <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground-secondary">
                <SkillIcon name={skill.icon} className="size-3.5 shrink-0 text-foreground-tertiary" />
                {skill.name}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}

export function ExperienceSection() {
  const strip = experience.slice(0, 4);
  return (
    <section aria-labelledby="experience-heading" className="flex flex-col gap-5">
      <Reveal variant="fade">
        <Expandable
          label="See more"
          header={
            <h2 className="text-sm font-medium tracking-tight">
              <span id="experience-heading">Experience</span>
            </h2>
          }
          collapsed={
            <div className="relative mt-5 pt-1">
              <div className="absolute left-[3px] right-0 top-[3px] h-px bg-timeline-line" />
              <div
                className="absolute left-[3px] top-[3px] h-px w-[calc(25%-3px)]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, var(--foreground) 0%, var(--timeline-line) 70%, var(--timeline-line) 100%)",
                }}
              />
              <div className="grid grid-cols-4">
                {strip.map((entry, i) => (
                  <div key={entry.company} className="flex min-w-0 flex-col gap-2.5">
                    <TimelineDot active={i === 0} />
                    <div className="flex items-center gap-1.5">
                      <span className="squircle flex size-6 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                        <SkillIcon name={entry.icon} className="size-3.5 text-foreground-secondary" />
                      </span>
                      <span className="truncate text-[13px] font-medium">{entry.company}</span>
                    </div>
                    <p className="text-[12px] whitespace-nowrap text-foreground-tertiary tabular-nums">
                      {entry.period}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          }
        >
          <ol className="flex flex-col gap-y-2 pt-5">
            {experience.map((role, i) => (
              <li
                key={`${role.company}-${role.period}`}
                className={`stagger-in relative ${i === 0 ? "" : "pt-6"}`}
                style={{ "--i": i } as CSSProperties}
              >
                <RoleDetail role={role} />
              </li>
            ))}
          </ol>
        </Expandable>
      </Reveal>
    </section>
  );
}

export function SkillsSection() {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-5">
      <Reveal variant="fade">
        <Expandable
          label="See more"
          header={
            <h2 className="text-sm font-medium tracking-tight">
              <span id="skills-heading">Skills</span>
            </h2>
          }
          collapsed={
            <div className="flex flex-col gap-3 pt-5">
              {skillGroups.map((group) => (
                <SkillRow key={group.label} label={group.label} skills={group.skills} />
              ))}
            </div>
          }
        >
          <div className="flex flex-col gap-3 pt-5">
            {skillGroups.map((group) => (
              <SkillRow
                key={group.label}
                label={group.label}
                skills={group.skills}
                more={group.more}
                expanded
              />
            ))}
          </div>
        </Expandable>
      </Reveal>
    </section>
  );
}

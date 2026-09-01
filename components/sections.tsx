import { Reveal } from "@/components/reveal";
import { Expandable } from "@/components/expandable";
import { SkillIcon } from "@/components/icons";
import { experience, skillGroups, timeline, type Role } from "@/lib/content";

function TimelineDot({ active }: { active?: boolean }) {
  return (
    <span
      className={`relative z-10 -mt-1 inline-block size-[7px] rounded-full squircle ${
        active ? "bg-foreground" : "bg-foreground-quaternary"
      }`}
    />
  );
}

function RoleDetail({ role }: { role: Role }) {
  return (
    <div className="relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-[10px] min-[360px]:grid-cols-[auto_minmax(0,1fr)_auto]">
      <div className="relative z-10 -mt-1 flex size-5 items-center justify-center">
        <div className="size-[7px] rounded-full squircle bg-foreground-quaternary" />
      </div>
      <div className="relative min-w-0 pt-6">
        <div className="absolute left-3 top-1 h-px w-[calc(100%+0.5rem)] -translate-y-1/2 bg-timeline-line" />
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <h3 className="text-sm font-medium tracking-tight">{role.company}</h3>
          <p className="shrink-0 text-[12px] text-foreground-tertiary">{role.period}</p>
        </div>
        <p className="mt-0.5 text-[13px] text-foreground-secondary">
          {role.title} · {role.summary}
        </p>
        <ul className="mt-2 flex flex-col gap-1">
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
      </div>
    </div>
  );
}

export function ExperienceSection() {
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
        >
          <ol className="flex flex-col gap-2 pt-6">
            {experience.map((role) => (
              <li key={`${role.company}-${role.period}`}>
                <Reveal variant="fade">
                  <RoleDetail role={role} />
                </Reveal>
              </li>
            ))}
          </ol>
        </Expandable>
      </Reveal>
      <Reveal variant="fade" delay={75}>
        <div className="relative pt-1">
          <div className="absolute left-[3px] right-0 top-[3px] h-px bg-timeline-line" />
          <div className="grid grid-flow-col auto-cols-max justify-between gap-x-6">
            {timeline.map((entry, i) => (
              <div key={entry.label} className="flex min-w-0 flex-col gap-2.5">
                <TimelineDot active={i === 0} />
                <div className="flex items-center gap-1.5">
                  <span className="squircle flex size-5 shrink-0 items-center justify-center rounded-md border border-border bg-card">
                    <SkillIcon name={entry.icon} className="size-3 text-foreground-secondary" />
                  </span>
                  <span className="truncate text-[13px] font-medium">{entry.label}</span>
                </div>
                <p className="text-[12px] whitespace-nowrap text-foreground-tertiary">
                  {entry.period}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

export function SkillsSection() {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-5">
      <Reveal variant="fade">
        <h2 className="text-sm font-medium tracking-tight">
          <span id="skills-heading">Skills</span>
        </h2>
      </Reveal>
      <div className="flex flex-col gap-3">
        {skillGroups.map((group, i) => (
          <Reveal key={group.label} variant="fade" delay={Math.min(i * 40, 160)}>
            <div className="grid grid-cols-[7rem_minmax(0,1fr)] items-start gap-x-3 min-[480px]:grid-cols-[8rem_minmax(0,1fr)]">
              <h3 className="pt-0.5 text-[13px] text-muted-foreground">{group.label}</h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-1.5">
                {group.skills.map((skill) => (
                  <li key={skill.name}>
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground-secondary">
                      <SkillIcon
                        name={skill.icon}
                        className="size-3.5 shrink-0 text-foreground-tertiary"
                      />
                      {skill.name}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

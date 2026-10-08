import type { CSSProperties } from "react";
import { Glyph, ProjectGlyph } from "@/components/glyph";
import { HoverUnderline } from "@/components/hover-underline";
import { SectionHeading } from "@/components/ui/section-heading";
import { Separator } from "@/components/ui/separator";
import { InkIcon } from "@/components/ui/ink-icons";
import { Stack } from "@/components/stack";
import { projects, type Project } from "@/lib/content";

function Stars({ count }: { count: number }) {
  const label = count.toLocaleString("en-US");
  return (
    // Clicks pass through to the row's link.
    <span className="pointer-events-none flex shrink-0 items-center gap-1 text-ink">
      <span aria-hidden="true" className="relative inline-flex size-8">
        <span className="star-fill absolute inset-[7px] text-ink" />
        <Glyph name="star" className="star-glyph relative size-8" />
      </span>
      {label}
      <span className="sr-only"> {count === 1 ? "star" : "stars"} on GitHub</span>
    </span>
  );
}

function ProjectRow({ project, stars, index }: { project: Project; stars?: number; index: number }) {
  const href = project.url ?? project.repo?.url;
  return (
    <li
      className="project-row ink-hover group/row relative rounded-[var(--hand-radius)] outline-offset-4 has-[a:focus-visible]:outline-[1.5px] has-[a:focus-visible]:outline-ring has-[a:focus-visible]:outline-solid"
      style={{ "--i": index } as CSSProperties}
    >
      {index > 0 && (
        // Ruled from the text, not under the glyph.
        <Separator seed={`rule-${project.name}`} className="absolute top-0 left-15 data-[orientation=horizontal]:w-[calc(100%-3.75rem)] sm:left-[4.75rem] sm:data-[orientation=horizontal]:w-[calc(100%-4.75rem)]" />
      )}
      <div className="flex min-w-0 items-start gap-4 py-4 sm:items-center sm:gap-5">
        <ProjectGlyph name={project.icon} className="project-glyph mt-1 size-11 sm:mt-0 sm:size-14" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-xl leading-tight font-bold">
              {href ? (
                // The whole row is the link; its name is the link's name.
                <a href={href} target="_blank" rel="noreferrer" className="outline-none after:absolute after:inset-0">
                  <span className="relative">
                    {project.name}
                    <HoverUnderline seed={`project-${project.name}`} />
                  </span>
                  <InkIcon
                    name="arrow-up-right"
                    className="ml-1 inline size-3.5 -translate-y-[0.1em] align-baseline text-ink-4 transition-colors duration-(--dur-hover) group-hover/row:text-ink group-has-[a:focus-visible]/row:text-ink"
                  />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                project.name
              )}
            </h3>
            {typeof stars === "number" && stars > 0 ? <Stars count={stars} /> : project.note && <span className="shrink-0 text-sm text-ink-2">{project.note}</span>}
          </div>
          <p className="leading-snug text-ink-2">{project.description}</p>
          <Stack items={project.stack} className="mt-1" />
        </div>
      </div>
    </li>
  );
}

export function Projects({ stars }: { stars: Record<string, number> }) {
  return (
    <section aria-labelledby="projects-heading" className="relative flex flex-col gap-1">
      <SectionHeading id="projects-heading">Projects</SectionHeading>
      <ul className="flex flex-col">
        {projects.map((project, i) => (
          <ProjectRow key={project.name} project={project} index={i} stars={project.repo ? stars[`${project.repo.owner}/${project.repo.name}`] : undefined} />
        ))}
      </ul>
    </section>
  );
}

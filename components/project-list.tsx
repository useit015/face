import type { CSSProperties } from "react";
import { Reveal } from "@/components/reveal";
import { Glyph, ProjectGlyph } from "@/components/ink/glyph";
import { Rule } from "@/components/ink/sketch";
import { projects, type Project } from "@/lib/content";

function Meta({ project, stars }: { project: Project; stars?: number }) {
  if (typeof stars === "number" && stars > 0) {
    return (
      <span
        className="flex shrink-0 items-center gap-1.5 text-body text-ink"
        title={`${stars.toLocaleString("en-US")} GitHub stars`}
      >
        <span className="relative inline-flex size-8 self-center">
          {/* A pen scribble fills the star on hover. */}
          <span aria-hidden="true" className="star-fill absolute inset-[7px]" />
          <Glyph name="star" className="star-glyph relative size-8" />
        </span>
        {stars.toLocaleString("en-US")}
        <span className="sr-only"> stars</span>
      </span>
    );
  }
  if (project.note) return <span className="shrink-0 text-meta text-ink-2">{project.note}</span>;
  return null;
}

function ProjectRow({ project, stars, index }: { project: Project; stars?: number; index: number }) {
  const href = project.repo?.url ?? project.url;
  const body = (
    <div className="flex min-w-0 items-center gap-4 py-3 sm:gap-5">
      <ProjectGlyph name={project.icon} className="project-glyph size-11 text-ink sm:size-14" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[1.5rem] leading-tight font-bold text-ink">
            <span className={href ? "pen-underline" : ""}>{project.name}</span>
          </h3>
          <Meta project={project} stars={stars} />
        </div>
        <p className="text-body leading-snug text-ink-2">{project.description}</p>
      </div>
    </div>
  );

  return (
    <li className="relative" style={{ "--i": index } as CSSProperties}>
      {index > 0 && <Rule seed={`rule-${project.name}`} delay={200 + index * 120} className="-top-[2px] !left-[3.75rem] !w-[calc(100%-3.75rem)] sm:!left-[4.75rem] sm:!w-[calc(100%-4.75rem)] text-ink-3" />}
      {href ? (
        <a href={href} target="_blank" rel="noreferrer" className="ink-hover project-row block">
          {body}
        </a>
      ) : (
        body
      )}
    </li>
  );
}

export function ProjectList({ stars }: { stars: Record<string, number> }) {
  return (
    <Reveal variant="stagger" as="ul" className="flex flex-col">
      {projects.map((project, i) => (
        <ProjectRow
          key={project.name}
          project={project}
          index={i}
          stars={project.repo ? stars[`${project.repo.owner}/${project.repo.name}`] : undefined}
        />
      ))}
    </Reveal>
  );
}

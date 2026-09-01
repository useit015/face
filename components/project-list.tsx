import { Star } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ProjectIcon } from "@/components/icons";
import { projects, type Project } from "@/lib/content";

function ProjectRow({ project, stars }: { project: Project; stars?: number }) {
  const href = project.repo?.url ?? project.url;
  const body = (
    <div className="relative flex min-w-0 items-center gap-3 before:absolute before:-inset-x-3 before:-inset-y-2.5 before:squircle before:rounded-xl before:content-[''] hover:before:bg-timeline-hover [&>*]:relative">
      <div className="squircle flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
        <ProjectIcon name={project.icon} className="size-4 text-foreground-secondary" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-medium tracking-tight">{project.name}</h3>
        <p className="truncate text-[13px] text-foreground-secondary">
          {project.description}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1 text-[13px] tabular-nums text-foreground-tertiary">
        {typeof stars === "number" && stars > 0 ? (
          <>
            <Star className="size-3" />
            {stars.toLocaleString("en-US")}
          </>
        ) : project.note ? (
          project.note
        ) : null}
      </div>
    </div>
  );

  return (
    <li>
      <Reveal variant="fade">
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {body}
          </a>
        ) : (
          body
        )}
      </Reveal>
    </li>
  );
}

export function ProjectList({ stars }: { stars: Record<string, number> }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {projects.map((project) => (
        <ProjectRow
          key={project.name}
          project={project}
          stars={project.repo ? stars[`${project.repo.owner}/${project.repo.name}`] : undefined}
        />
      ))}
    </ul>
  );
}

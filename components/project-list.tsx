import { Star } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ProjectIcon } from "@/components/icons";
import { projects, type Project } from "@/lib/content";

function ProjectRow({ project, stars }: { project: Project; stars?: number }) {
  const href = project.repo?.url ?? project.url;
  const interactive = Boolean(href);
  const body = (
    <div
      className={`relative flex min-w-0 items-center gap-3 before:absolute before:-inset-x-3 before:-inset-y-2.5 before:squircle before:rounded-xl before:content-[''] before:transition-colors before:duration-200 [&>*]:relative ${
        interactive ? "group/row hover:before:bg-timeline-hover" : ""
      }`}
    >
      <div className="squircle flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
        <ProjectIcon name={project.icon} className="size-4 text-foreground-secondary" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-body font-medium tracking-tight decoration-foreground-decoration underline-offset-3 group-hover/row:underline group-focus-visible/row:underline">
          {project.name}
        </h3>
        <p
          className="truncate text-body text-foreground-secondary"
          title={project.description}
        >
          {project.description}
        </p>
      </div>
      <div
        className="flex shrink-0 items-center gap-1 font-mono text-meta text-foreground-tertiary"
        title={
          typeof stars === "number" && stars > 0
            ? `${stars.toLocaleString("en-US")} GitHub stars`
            : project.note
        }
      >
        {typeof stars === "number" && stars > 0 ? (
          <>
            <Star className="size-3 transition-transform duration-200 group-hover/row:fill-current group-hover/row:scale-110 motion-reduce:transition-none" />
            {stars.toLocaleString("en-US")}
          </>
        ) : project.note ? (
          project.note
        ) : null}
      </div>
    </div>
  );

  return (
    <li className="relative">
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
    </li>
  );
}

export function ProjectList({ stars }: { stars: Record<string, number> }) {
  return (
    <Reveal variant="stagger" as="ul" className="flex flex-col gap-2.5">
      {projects.map((project) => (
        <ProjectRow
          key={project.name}
          project={project}
          stars={project.repo ? stars[`${project.repo.owner}/${project.repo.name}`] : undefined}
        />
      ))}
    </Reveal>
  );
}

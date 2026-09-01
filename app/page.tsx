import { Reveal } from "@/components/reveal";
import { ContributionGraph } from "@/components/contribution-graph";
import { contact, experience, hero, projects, skillGroups, stats } from "@/lib/content";

function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </svg>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
      className="inline-flex items-center gap-1.5 text-[13px] text-foreground-secondary transition-colors hover:text-foreground"
    >
      {children}
      {external && <ArrowUpRight className="size-3" />}
    </a>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-medium tracking-tight text-foreground">
      {children}
    </h2>
  );
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-page flex-col gap-section px-5 pt-8 pb-16 sm:px-8 md:pt-14">
      <section className="flex flex-col gap-5">
        <Reveal variant="rise">
          <h1 className="text-xl font-medium tracking-tight">{hero.name}</h1>
          <p className="mt-1 text-sm text-foreground-secondary">
            {hero.headline} · {hero.focus}
          </p>
        </Reveal>
        <Reveal variant="rise" delay={75}>
          <p className="max-w-[60ch] text-sm leading-relaxed text-foreground-secondary">
            {hero.bio}
          </p>
        </Reveal>
        <Reveal variant="fade" delay={150}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <a
              href={`mailto:${contact.email}`}
              className="squircle inline-flex h-8 items-center rounded-lg border border-transparent bg-foreground px-2.5 text-sm font-medium text-background transition-transform outline-none select-none active:scale-[0.97]"
            >
              Email me
            </a>
            <ExternalLink href={contact.github}>GitHub</ExternalLink>
            <ExternalLink href={contact.linkedin}>LinkedIn</ExternalLink>
            <ExternalLink href={contact.toptal}>Toptal</ExternalLink>
          </div>
        </Reveal>
      </section>

      <Reveal as="section" variant="fade" className="flex flex-col gap-5">
        <div className="grid grid-cols-2 gap-x-[10px] gap-y-4 min-[360px]:grid-cols-4">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex min-w-0 flex-col gap-0.5">
              <span className="text-lg font-medium tracking-tight">{value}</span>
              <span className="text-[13px] leading-snug text-muted-foreground">
                {label}
              </span>
            </div>
          ))}
        </div>
      </Reveal>

      <section aria-labelledby="performance-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <SectionHeading>
            <span id="performance-heading">Performance</span>
          </SectionHeading>
        </Reveal>
        <Reveal variant="fade" delay={75}>
          <ContributionGraph username={contact.githubUser} />
        </Reveal>
      </section>

      <section aria-labelledby="projects-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <SectionHeading>
            <span id="projects-heading">Things I&apos;ve built and shipped</span>
          </SectionHeading>
        </Reveal>
        <ul className="flex flex-col gap-2">
          {projects.map((project, i) => {
            const link = project.url ?? project.repo;
            const body = (
              <div className="relative min-w-0 before:absolute before:-inset-x-3 before:-inset-y-2 before:squircle before:rounded-xl before:content-[''] hover:before:bg-timeline-hover [&>*]:relative">
                <div className="flex min-w-0 items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium tracking-tight">
                    {project.name}
                  </h3>
                  <span className="shrink-0 text-[12px] text-foreground-quaternary">
                    {project.category}
                  </span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-foreground-secondary">
                  {project.description}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-foreground-tertiary">
                  {project.stack.map((tech) => (
                    <span key={tech}>{tech}</span>
                  ))}
                  {project.note && (
                    <span className="text-foreground-quaternary">· {project.note}</span>
                  )}
                </div>
              </div>
            );
            return (
              <li key={project.name}>
                <Reveal variant="rise" delay={Math.min(i * 40, 200)}>
                  {link ? (
                    <a
                      href={link}
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
          })}
        </ul>
      </section>

      <section aria-labelledby="experience-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <SectionHeading>
            <span id="experience-heading">Where I&apos;ve worked</span>
          </SectionHeading>
        </Reveal>
        <ol className="flex flex-col">
          {experience.map((role, i) => (
            <li key={`${role.company}-${role.period}`}>
              <Reveal variant="fade" delay={Math.min(i * 30, 150)}>
                <div className="relative grid min-w-0 grid-cols-[auto_minmax(0,1fr)] gap-x-[10px] gap-y-2 min-[360px]:grid-cols-[auto_minmax(0,1fr)_auto]">
                  <div className="relative z-10 -mt-1 flex size-5 items-center justify-center">
                    <div className="size-[7px] rounded-full squircle bg-foreground-quaternary" />
                  </div>
                  <div className="relative min-w-0 pt-6">
                    <div className="absolute left-3 top-1 h-px w-[calc(100%+0.5rem)] -translate-y-1/2 bg-timeline-line" />
                    <div className="flex min-w-0 items-baseline justify-between gap-3">
                      <h3 className="text-sm font-medium tracking-tight">
                        {role.company}
                      </h3>
                      <p className="shrink-0 text-[12px] text-foreground-tertiary">
                        {role.period}
                      </p>
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
                          <span aria-hidden="true" className="mt-[0.45em] size-1 shrink-0 rounded-full bg-foreground-quaternary" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="skills-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <SectionHeading>
            <span id="skills-heading">What I can do</span>
          </SectionHeading>
        </Reveal>
        <div className="flex flex-col gap-5">
          {skillGroups.map((group, i) => (
            <Reveal key={group.name} variant="fade" delay={Math.min(i * 40, 160)}>
              <div className="flex flex-col gap-2">
                <div className="flex min-w-0 items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium tracking-tight">{group.name}</h3>
                  <p className="hidden min-[480px]:block max-w-[36ch] text-right text-[12px] text-foreground-quaternary">
                    {group.description}
                  </p>
                </div>
                <p className="min-[480px]:hidden text-[12px] text-foreground-quaternary">
                  {group.description}
                </p>
                <ul className="flex flex-wrap gap-1.5">
                  {group.skills.map((skill) => (
                    <li
                      key={skill}
                      className="squircle inline-flex items-center rounded-md border border-border px-2 py-1 text-[12px] text-foreground-secondary"
                    >
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section aria-labelledby="contact-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <SectionHeading>
            <span id="contact-heading">Contact</span>
          </SectionHeading>
        </Reveal>
        <Reveal variant="rise" delay={75}>
          <div className="flex flex-col gap-3">
            <a
              href={`mailto:${contact.email}`}
              className="text-sm underline decoration-foreground-decoration underline-offset-3 transition-colors hover:decoration-foreground-decoration-hover"
            >
              {contact.email}
            </a>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <ExternalLink href={contact.github}>GitHub</ExternalLink>
              <ExternalLink href={contact.linkedin}>LinkedIn</ExternalLink>
              <ExternalLink href={contact.toptal}>Toptal</ExternalLink>
            </div>
          </div>
        </Reveal>
      </section>

      <footer className="mt-auto pt-8 text-[12px] text-foreground-quaternary">
        <p>Oussama Nahiz · {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
}

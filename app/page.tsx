import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ContributionGraph } from "@/components/contribution-graph";
import { ExperienceSection, SkillsSection } from "@/components/sections";
import { ProjectList } from "@/components/project-list";
import { SocialIcon } from "@/components/icons";
import { contact, hero, socials } from "@/lib/content";
import { getStars } from "@/lib/stars";

function OpenToWorkAnnotation() {
  return (
    <span className="pointer-events-none absolute right-full top-1/2 mr-2 hidden -translate-y-1/2 select-none items-center gap-1.5 min-[1150px]:flex">
      <span
        aria-hidden="true"
        className="whitespace-nowrap text-lg leading-none text-foreground-secondary"
        style={{ fontFamily: "var(--font-hand)" }}
      >
        open to work
      </span>
      <svg
        aria-hidden="true"
        viewBox="0 0 40 28"
        fill="none"
        className="h-6 w-8 text-foreground-tertiary"
      >
        <path
          d="M2 4c10 3 20 9 30 19m0 0-8-4m8 4-2-9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default async function Home() {
  const repoStars = await getStars([
    { owner: "useit015", name: "whichmodel" },
    { owner: "useit015", name: "souk-fighter" },
  ]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-page flex-col gap-section px-5 pt-8 pb-16 sm:px-8 md:pt-14">
      <section className="flex flex-col gap-5">
        <Reveal variant="rise" className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-base font-medium tracking-tight">{hero.name}</h1>
            <p className="mt-0.5 text-sm text-foreground-secondary">{hero.role}</p>
          </div>
          <ul className="flex items-center gap-1 pt-0.5">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  {...(social.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="squircle flex size-7 items-center justify-center rounded-md text-foreground-secondary transition-colors outline-none select-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
                >
                  <SocialIcon name={social.icon} className="size-3.5" />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal variant="rise" delay={75}>
          <p className="text-sm leading-relaxed text-foreground-secondary">
            {hero.bioLead}{" "}
            <a
              href={`mailto:${contact.email}`}
              className="underline decoration-foreground-decoration underline-offset-3 hover:decoration-foreground-decoration-hover"
            >
              Email me
            </a>{" "}
            for the full story, or find my references on{" "}
            <a
              href={contact.toptal}
              target="_blank"
              rel="noreferrer"
              className="underline decoration-foreground-decoration underline-offset-3 hover:decoration-foreground-decoration-hover"
            >
              Toptal
            </a>
            .
          </p>
          <p className="mt-3 text-sm leading-relaxed text-foreground-secondary">
            {hero.bioProof}
          </p>
        </Reveal>
        <Reveal variant="fade" delay={150}>
          <div className="flex items-center gap-2">
            <span className="relative inline-flex">
              <OpenToWorkAnnotation />
              <a
                href={`mailto:${contact.email}`}
                className="squircle inline-flex h-8 items-center rounded-lg bg-foreground px-2.5 text-sm font-medium text-background transition-transform outline-none select-none active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Email me
              </a>
            </span>
            <a
              href={contact.linkedin}
              target="_blank"
              rel="noreferrer"
              className="squircle inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-foreground-secondary transition-colors transition-transform outline-none select-none hover:bg-muted hover:text-foreground active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Message on LinkedIn
              <ArrowUpRight className="size-3.5" />
            </a>
          </div>
        </Reveal>
      </section>

      <section aria-labelledby="performance-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <h2 className="text-sm font-medium tracking-tight">
            <span id="performance-heading">Performance</span>
          </h2>
        </Reveal>
        <Reveal variant="fade" delay={75}>
          <ContributionGraph />
        </Reveal>
      </section>

      <ExperienceSection />

      <SkillsSection />

      <section aria-labelledby="projects-heading" className="flex flex-col gap-5">
        <Reveal variant="fade">
          <h2 className="text-sm font-medium tracking-tight">
            <span id="projects-heading">Projects</span>
          </h2>
        </Reveal>
        <Reveal variant="fade" delay={75}>
          <ProjectList stars={repoStars} />
        </Reveal>
      </section>

      <footer className="mt-auto flex items-center justify-between pt-8 text-[12px] text-foreground-quaternary">
        <p>© {new Date().getFullYear()} Oussama Nahiz</p>
        <a
          href={`mailto:${contact.email}`}
          className="underline decoration-foreground-quaternary underline-offset-3 transition-colors hover:text-foreground-secondary"
        >
          {contact.email}
        </a>
      </footer>
    </main>
  );
}

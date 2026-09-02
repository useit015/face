import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/reveal";
import { ContributionGraph } from "@/components/contribution-graph";
import { ExperienceSection, SkillsSection } from "@/components/sections";
import { ProjectList } from "@/components/project-list";
import { SocialIcon } from "@/components/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyEmail } from "@/components/copy-email";
import { CursorAvatar } from "@/components/cursor-avatar";
import { contact, hero, socials } from "@/lib/content";
import { getStars } from "@/lib/stars";

export default async function Home() {
  const repoStars = await getStars([
    { owner: "useit015", name: "whichmodel" },
    { owner: "useit015", name: "souk-fighter" },
  ]);

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-page flex-col gap-section px-5 pt-12 pb-16 sm:px-8 md:pt-14">
      <section className="flex flex-col gap-5">
        <Reveal
          variant="rise"
          className="flex items-baseline justify-between gap-2"
        >
          <h1 className="text-heading font-medium tracking-tight">{hero.name}</h1>

          <ul className="flex items-center gap-2 pt-0.5">
            {socials.map((social) => (
              <li key={social.label}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  {...(social.href.startsWith("http")
                    ? { target: "_blank", rel: "noreferrer" }
                    : {})}
                  className="relative squircle flex size-7 items-center justify-center rounded-md text-foreground-secondary transition-colors duration-200 outline-none select-none before:absolute before:-inset-1.5 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
                >
                  <SocialIcon name={social.icon} className="size-3.5" />
                </a>
              </li>
            ))}
            <li>
              <ThemeToggle />
            </li>
          </ul>
        </Reveal>
        <Reveal variant="rise" delay={75}>
          <div className="grid gap-y-8 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-8 items-center mb-2">
            <div className="min-w-0 max-w-[65ch]">
              <p className="text-body text-foreground-secondary">
                {hero.bioLead}{" "}
                <a
                  href={contact.cal}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-foreground-decoration underline-offset-3 transition-[text-decoration-color] duration-200 hover:decoration-foreground-decoration-hover"
                >
                  Book a call
                </a>{" "}
                for the full story, or find my references on{" "}
                <a
                  href={contact.toptal}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-foreground-decoration underline-offset-3 transition-[text-decoration-color] duration-200 hover:decoration-foreground-decoration-hover"
                >
                  Toptal
                </a>
                .
              </p>
              <p className="mt-3 text-body text-foreground-secondary">
                {hero.bioProof}
              </p>
            </div>
            <div className="squircle size-32 overflow-hidden rounded-3xl -mt-2">
              <CursorAvatar
                size={128}
                label="Portrait of Oussama Nahiz, following your cursor"
                className="cursor-pointer select-none"
              />
            </div>
          </div>
        </Reveal>
        <Reveal variant="fade" delay={150}>
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={contact.cal}
              target="_blank"
              rel="noreferrer"
              className="squircle inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg bg-foreground px-2.5 text-body font-medium text-background transition-[background-color,transform] duration-200 outline-none select-none hover:bg-foreground/80 active:scale-[0.97] focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Book a call
              <ArrowUpRight className="size-3.5" />
            </a>
            <CopyEmail email={contact.email} />
          </div>
        </Reveal>
      </section>

      <ExperienceSection />

      <SkillsSection />

      <section
        aria-labelledby="performance-heading"
        className="flex flex-col gap-5"
      >
        <Reveal variant="fade">
          <h2 className="font-mono text-meta font-medium uppercase tracking-[0.14em] text-foreground-tertiary">
            <span id="performance-heading">Performance</span>
          </h2>
        </Reveal>
        <Reveal variant="fade" delay={75}>
          <ContributionGraph />
        </Reveal>
      </section>

      <section
        aria-labelledby="projects-heading"
        className="flex flex-col gap-5"
      >
        <Reveal variant="fade">
          <h2 className="font-mono text-meta font-medium uppercase tracking-[0.14em] text-foreground-tertiary">
            <span id="projects-heading">Projects</span>
          </h2>
        </Reveal>
        <Reveal variant="fade" delay={75}>
          <ProjectList stars={repoStars} />
        </Reveal>
      </section>

      <footer className="mt-auto pt-8 font-mono text-meta text-foreground-quaternary">
        <p>© {new Date().getFullYear()} Oussama Nahiz</p>
      </footer>
    </main>
  );
}

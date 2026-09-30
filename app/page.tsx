import { Reveal } from "@/components/reveal";
import { ContributionGraph } from "@/components/contribution-graph";
import { SkillsSection } from "@/components/sections";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectList } from "@/components/project-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyEmail } from "@/components/copy-email";
import { Portrait } from "@/components/portrait";
import { MarginNote } from "@/components/margin-note";
import { Glyph } from "@/components/ink/glyph";
import { SectionHeader } from "@/components/ink/heading";
import { InkButton, InkLink } from "@/components/ink/links";
import { HoverLoop } from "@/components/ink/measured";
import { Flicks, Underline } from "@/components/ink/sketch";
import { contact, hero, socials } from "@/lib/content";
import { getStars } from "@/lib/stars";

export default async function Home() {
  const repoStars = await getStars([
    { owner: "useit015", name: "whichmodel" },
    { owner: "useit015", name: "souk-fighter" },
  ]);

  return (
    <main
      id="main"
      className="relative mx-auto flex min-h-svh w-full max-w-page flex-col gap-section px-5 pt-10 pb-12 sm:px-8 md:pt-14"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-3 gap-y-3">
        <Reveal eager variant="plain" className="relative mt-1 mr-10 inline-block shrink-0">
          <h1 className="write-text text-display font-bold tracking-tight whitespace-nowrap" style={{ "--write-d": "700ms", "--write-dd": "40ms" } as React.CSSProperties}>
            {hero.name}
          </h1>
          <Underline seed="name-underline" w={220} delay={520} className="top-full -mt-1" />
          <Flicks seed="name-flicks" delay={1000} className="-right-9 -top-2 hidden min-[400px]:block" />
        </Reveal>

        <nav aria-label="Elsewhere" className="-ml-2 sm:mt-1.5 sm:-mr-2 sm:ml-0">
          <Reveal eager as="ul" variant="stagger" delay={120} className="flex items-center">
            {socials.map((social, i) => (
              <li key={social.label} style={{ "--i": i } as React.CSSProperties}>
                <a
                  href={social.href}
                  aria-label={social.label}
                  title={social.label}
                  {...(social.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="ink-hover has-loop relative flex size-10 items-center justify-center text-ink"
                >
                  <HoverLoop seed={`loop-${social.icon}`} estimate={[22, 22]} pad={4} />
                  <Glyph name={social.icon} className="boil size-[30px]" />
                </a>
              </li>
            ))}
            <li style={{ "--i": socials.length } as React.CSSProperties}>
              <ThemeToggle />
            </li>
          </Reveal>
        </nav>
      </header>

      <section aria-label="Introduction" className="-mt-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-x-10">
        <Reveal
          eager
          variant="ink"
          delay={140}
          className="float-right mt-1 mb-3 ml-4 -rotate-1 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:float-none sm:m-0 sm:mt-1 sm:rotate-[0.6deg]"
        >
          <Portrait label="Ballpoint sketch of Oussama Nahiz, following your cursor" />
        </Reveal>

        <div className="max-w-[60ch] text-body sm:col-start-1 sm:row-start-1">
          <Reveal eager as="p" variant="ink" delay={220}>
            {hero.bioLead} <InkLink href={contact.cal}>Book a call</InkLink> for the full story, or find my
            references on <InkLink href={contact.toptal}>Toptal</InkLink>.
          </Reveal>
          <Reveal eager as="p" variant="ink" delay={320} className="mt-3.5 text-ink-2">
            {hero.bioProof}
          </Reveal>
        </div>

        <Reveal eager variant="ink" delay={440} className="clear-both flex flex-wrap items-center gap-3.5 pt-7 sm:col-start-1 sm:row-start-2 sm:clear-none">
          <InkButton href={contact.cal} seed="book-call" estimate={[146, 44]} delay={560}>
            Book a call
          </InkButton>
          <CopyEmail email={contact.email} />
        </Reveal>
      </section>

      <ExperienceSection />

      <SkillsSection />

      <div className="relative">
        <MarginNote side="right" seed="note-weekends" className="top-2">
          weekends included.
        </MarginNote>
        <ContributionGraph />
      </div>

      <section aria-labelledby="projects-heading" className="relative flex flex-col gap-4">
        <MarginNote side="left" seed="note-side-quests" className="-top-1">
          side quests
        </MarginNote>
        <SectionHeader id="projects-heading" title="Projects" />
        <ProjectList stars={repoStars} />
      </section>

      <footer className="mt-auto flex items-baseline justify-between gap-4 pt-6 text-meta font-normal text-ink-3">
        <p>© {new Date().getFullYear()} {hero.name}</p>
        <p className="doodle-hint hidden">The margins take ink. Try dragging on the paper.</p>
      </footer>
    </main>
  );
}

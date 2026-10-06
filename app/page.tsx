import { Reveal } from "@/components/reveal";
import { ContributionGraph } from "@/components/contribution-graph";
import { SkillsSection } from "@/components/sections";
import { ExperienceSection } from "@/components/experience-section";
import { ProjectList } from "@/components/project-list";
import { ThemeToggle } from "@/components/theme-toggle";
import { CopyEmail } from "@/components/copy-email";
import { Portrait } from "@/components/portrait";
import { MarginScrawl } from "@/components/margin-scrawl";
import { Glyph } from "@/components/ink/glyph";
import { SectionHeader } from "@/components/ink/heading";
import { InkButton, InkLink } from "@/components/ink/links";
import { HoverLoop } from "@/components/ink/measured";
import { Flicks, SignatureRule, Underline } from "@/components/ink/sketch";
import { contact, hero, socials } from "@/lib/content";
import { getStars } from "@/lib/stars";

const [firstName, ...rest] = hero.name.split(" ");
const lastName = rest.join(" ");

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
      <MarginScrawl seed="scrawl-corner" kind="corner" side="left" top={10} inset={10} rotate={-6} delay={1200} />
      {/* One grid for the whole introduction, so pieces can trade places:
          phones put the portrait beside a stacked name with the links under
          it; wider screens run name and links across the top and hang the
          portrait beside the bio and buttons. */}
      <header className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-6 min-[380px]:gap-x-7 [grid-template-areas:'portrait_id'_'bio_bio'_'cta_cta'] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-10 sm:gap-y-0 sm:[grid-template-areas:'name_links'_'bio_portrait'_'cta_portrait']">
        <div className="flex min-w-0 flex-col gap-3 [grid-area:id] sm:contents">
          <Reveal eager variant="plain" className="relative mt-1 inline-block self-start justify-self-start sm:mr-10 sm:[grid-area:name]">
            <h1 className="write-text text-display font-bold tracking-tight sm:whitespace-nowrap" style={{ "--write-d": "700ms", "--write-dd": "40ms" } as React.CSSProperties}>
              {firstName} <span className="block sm:inline">{lastName}</span>
            </h1>
            <Underline seed="name-underline" w={340} weight={2.8} delay={520} className="top-full -mt-1.5" />
            <Flicks seed="name-flicks" delay={1000} className="-right-9 -top-2 hidden sm:block" />
          </Reveal>

          <nav aria-label="Elsewhere" className="-ml-2.5 sm:mt-3 sm:-mr-3 sm:ml-0 sm:justify-self-end sm:[grid-area:links]">
            <Reveal eager as="ul" variant="stagger" delay={120} className="flex items-center">
              {socials.map((social, i) => (
                <li key={social.label} style={{ "--i": i } as React.CSSProperties}>
                  <a
                    href={social.href}
                    aria-label={social.label}
                    title={social.label}
                    {...(social.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
                    className="ink-hover has-loop relative flex size-[38px] items-center justify-center text-ink sm:size-11"
                  >
                    <HoverLoop seed={`loop-${social.icon}`} estimate={[22, 22]} pad={4} />
                    <Glyph name={social.icon} className="boil size-[34px] sm:size-[42px]" />
                  </a>
                </li>
              ))}
              <li style={{ "--i": socials.length } as React.CSSProperties}>
                <ThemeToggle />
              </li>
            </Reveal>
          </nav>
        </div>

        <Reveal
          eager
          variant="ink"
          delay={140}
          className="relative -rotate-2 self-center [grid-area:portrait] sm:mt-9 sm:self-start sm:justify-self-end sm:rotate-[0.6deg]"
        >
          <Portrait label="Ballpoint sketch of Oussama Nahiz, following your cursor" />
          <Flicks seed="portrait-flicks" delay={1100} className="-right-8 top-10 hidden rotate-[20deg] md:block" />
        </Reveal>

        <div className="max-w-[60ch] text-body [grid-area:bio] sm:mt-9">
          <Reveal eager as="p" variant="ink" delay={220}>
            {hero.bioLead} <InkLink href={contact.cal}>Book a call</InkLink> for the full story, or find my
            references on <InkLink href={contact.toptal}>Toptal</InkLink>.
          </Reveal>
          <Reveal eager as="p" variant="ink" delay={320} className="mt-3.5 text-ink-2">
            {hero.bioProof}
          </Reveal>
        </div>

        <Reveal eager variant="ink" delay={440} className="hero-cta grid grid-cols-2 items-center gap-3.5 [grid-area:cta] sm:flex sm:self-end sm:pt-7">
          <InkButton href={contact.cal} seed="book-call" estimate={[146, 44]} delay={560}>
            Book a call
          </InkButton>
          <CopyEmail email={contact.email} />
        </Reveal>
      </header>

      <div className="relative">
        <ExperienceSection />
      </div>

      <div className="relative">
        <SkillsSection />
      </div>

      <div className="relative">
        <MarginScrawl seed="scrawl-perf-r" kind="zigzag" side="right" top={-50} rotate={-14} scale={1.3} />
        <MarginScrawl seed="scrawl-perf-l" kind="slash" side="left" top={110} rotate={-62} scale={0.8} />
        <ContributionGraph />
      </div>

      <section aria-labelledby="projects-heading" className="relative flex flex-col gap-4">
        <MarginScrawl seed="scrawl-projects" kind="star" side="right" top={-4} rotate={-8} scale={1.2} />
        <MarginScrawl seed="scrawl-foot" kind="zigzag" side="right" top="calc(100% - 70px)" rotate={-8} />
        <SectionHeader id="projects-heading" title="Projects" />
        <ProjectList stars={repoStars} />
      </section>

      <Reveal as="footer" variant="plain" className="mt-auto flex items-center gap-4 pt-10 text-meta font-normal text-ink-3">
        <p className="shrink-0">© {new Date().getFullYear()} {hero.name}</p>
        <SignatureRule seed="signature" delay={200} className="min-w-0 flex-1 -mr-1" />
      </Reveal>
    </main>
  );
}

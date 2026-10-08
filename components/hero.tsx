import type { CSSProperties } from "react";
import { Flicks } from "@/components/marks";
import { Glyph } from "@/components/glyph";
import { Portrait } from "@/components/portrait";
import { TextLink } from "@/components/text-link";
import { ThemeSwitch } from "@/components/theme-switch";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { InkProvider } from "@/hooks/use-ink-box";
import { InkGlyph } from "@/lib/ink-glyphs";
import { contact, hero, socials } from "@/lib/content";

/** When a part lands (fades up) and for how long, and how long after it starts landing its own pen strokes start. */
const at = (dd: number, d = 600, after?: number) =>
  ({ "--ink-d": `${d}ms`, "--ink-dd": `${dd}ms`, ...(after === undefined ? {} : { "--ink-after": `${dd + after}ms` }) }) as CSSProperties;

function Socials() {
  return (
    <ul className="flex items-center">
      {socials.map((social) => {
        const external = social.href.startsWith("http");
        return (
          <li key={social.label}>
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-lg"
                    seed={`social-${social.icon}`}
                    nativeButton={false}
                    aria-label={external ? `${social.label} (opens in a new tab)` : social.label}
                    render={<a href={social.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} />}
                    className="size-8 min-[360px]:size-10 sm:size-11"
                  />
                }
              >
                <Glyph name={social.icon} className="boil size-7 min-[360px]:size-[34px] sm:size-10" />
              </TooltipTrigger>
              <TooltipContent side="bottom" seed={`tip-${social.icon}`}>
                {social.label}
              </TooltipContent>
            </Tooltip>
          </li>
        );
      })}
      <li>
        <ThemeSwitch className="size-8 text-ink-2 hover:text-ink min-[360px]:size-10 sm:size-11 [&_.ink-theme-icon]:size-[18px] [&_.ink-theme-icon]:[--ink-weight:1.2] min-[360px]:[&_.ink-theme-icon]:size-5 sm:[&_.ink-theme-icon]:size-6" />
      </li>
    </ul>
  );
}

/**
 * The introduction, drawn as the page loads, in reading order: the name is
 * written and underlined, the links land beside it, then the words with the
 * portrait alongside, then the buttons are ruled in. The rest of the page
 * waits its turn after this (useInkBox). One grid, so the pieces can trade places: phones
 * put the portrait beside a stacked name with the links under it; wider
 * screens run the name and links across the top and hang the portrait
 * beside the words.
 */
export function Hero() {
  return (
    <InkProvider draw="mount">
      <header className="relative grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-5 gap-y-6 [grid-template-areas:'portrait_id'_'bio_bio'_'cta_cta'] min-[380px]:gap-x-7 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-x-10 sm:gap-y-0 sm:[grid-template-areas:'name_links'_'bio_portrait'_'cta_portrait']">
        <div className="flex min-w-0 flex-col gap-2 [grid-area:id] sm:contents">
          <div className="relative self-start justify-self-start sm:mr-10 sm:[grid-area:name]">
            <SectionHeading
              as="h1"
              seed="name"
              underline="swoosh"
              className="text-[length:var(--text-display)] leading-[1.05] tracking-tight normal-case max-sm:w-min"
            >
              {hero.name}
            </SectionHeading>
            <Flicks seed="name-flicks" draw="mount" delay={860} className="-top-2 -right-9 hidden sm:block" />
          </div>

          <nav aria-label="Elsewhere" className="ink-land -ml-1.5 min-[360px]:-ml-2.5 sm:mt-1 sm:-mr-2.5 sm:ml-0 sm:justify-self-end sm:[grid-area:links]" style={at(140, 520)}>
            <Socials />
          </nav>
        </div>

        <div
          className="ink-land ink-after relative -rotate-2 self-center [grid-area:portrait] sm:mt-8 sm:rotate-[0.6deg] sm:self-start sm:justify-self-end"
          style={at(290, 640, 60)}
        >
          <Portrait label="Ballpoint sketch of Oussama Nahiz, following your cursor" />
          {/* Timed from when the portrait's own strokes start (ink-after). */}
          <Flicks seed="portrait-flicks" draw="mount" delay={600} className="top-10 -right-8 hidden rotate-[20deg] min-[54rem]:block" />
        </div>

        <div className="ink-after max-w-[60ch] [grid-area:bio] sm:mt-8" style={{ "--ink-after": "520ms" } as CSSProperties}>
          <p className="ink-land" style={at(240, 640)}>
            {hero.bioLead} <TextLink href={contact.cal}>Book a call</TextLink> for the long version, or see my references on{" "}
            <TextLink href={contact.toptal}>Toptal</TextLink>.
          </p>
          <p className="ink-land mt-3.5 text-ink-2" style={at(340, 640)}>
            {hero.bioProof}
          </p>
        </div>

        <div className="ink-land ink-after grid grid-cols-2 gap-3.5 [grid-area:cta] sm:flex sm:self-end sm:pt-7" style={at(440, 560, 160)}>
          <Button
            size="lg"
            seed="book-call"
            nativeButton={false}
            render={<a href={contact.cal} target="_blank" rel="noreferrer" />}
            className="w-full px-3 sm:w-auto sm:px-5"
          >
            Book a call
            <InkGlyph name="arrow-up-right" className="size-4 transition-transform duration-(--dur-hover) ease-out group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 motion-reduce:transition-none" />
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
          <CopyButton value={contact.email} size="lg" seed="copy-email" copiedLabel="Copied" className="w-full px-3 sm:w-auto sm:px-5" aria-label={`Copy email address (${contact.email})`}>
            Copy email
          </CopyButton>
        </div>
      </header>
    </InkProvider>
  );
}

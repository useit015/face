import type { ComponentProps, CSSProperties, ReactNode } from "react";
import { Activity } from "@/components/activity";
import { Contact } from "@/components/contact";
import { Experience } from "@/components/experience";
import { Hero } from "@/components/hero";
import { SignatureRule } from "@/components/marks";
import { Projects } from "@/components/projects";
import { Skills } from "@/components/skills";
import { Stage } from "@/components/stage";
import { Scrawl, type ScrawlKind } from "@/components/ui/scrawl";
import { hero } from "@/lib/content";
import { getStars } from "@/lib/stars";

/**
 * Scratches a pen collects in the margin, pinned near the window's edge
 * beside the section they sit in, never so far out they lose the page.
 * Only drawn where the margin has room for them (globals.css).
 */
function MarginScrawl({
  side,
  top,
  inset = 18,
  ...props
}: Omit<ComponentProps<typeof Scrawl>, "className" | "style"> & {
  kind: ScrawlKind;
  seed: string;
  side: "left" | "right";
  top: number | string;
  /** px from the window's edge. */
  inset?: number;
}) {
  const style = { top, [side]: `max(calc(50% - 50vw + ${inset}px), -9rem)` } as CSSProperties;
  return <Scrawl className="margin-scrawl absolute" style={style} {...props} />;
}

/**
 * A section's margin scratches, drawn ("mount") once the pen gets here: the
 * end of the section, so they come after it however far up the margin
 * they sit.
 */
function Margin({ children }: { children: ReactNode }) {
  return <Stage>{children}</Stage>;
}

export default async function Home() {
  const stars = await getStars([
    { owner: "useit015", name: "whichmodel" },
    { owner: "useit015", name: "souk-fighter" },
  ]);

  return (
    <main id="main" className="relative mx-auto flex min-h-svh w-full max-w-page flex-col gap-section px-5 pt-10 pb-12 sm:px-8 md:pt-14">
      <Hero />

      <Experience />

      <Skills />

      <div className="relative">
        <Activity />
        <Margin>
          <MarginScrawl seed="scrawl-activity-r" kind="zigzag" side="right" top={-50} rotate={-14} scale={1.3} draw="mount" />
          <MarginScrawl seed="scrawl-activity-l" kind="slash" side="left" top={110} rotate={-62} scale={0.8} draw="mount" delay={600} />
        </Margin>
      </div>

      <div className="relative">
        <Projects stars={stars} />
        <Margin>
          <MarginScrawl seed="scrawl-projects" kind="star" side="right" top={-4} rotate={-8} scale={1.2} draw="mount" />
        </Margin>
      </div>

      <div className="relative">
        <Contact />
        <Margin>
          <MarginScrawl seed="scrawl-contact" kind="zigzag" side="right" top="calc(100% - 70px)" rotate={-8} draw="mount" />
        </Margin>
      </div>

      <footer className="mt-auto flex items-center gap-4 pt-6 text-sm text-ink-3">
        <Stage as="p" className="ink-land shrink-0">
          © {new Date().getFullYear()} {hero.name}
        </Stage>
        <SignatureRule seed="signature" className="-mr-1 min-w-0 flex-1" />
      </footer>
      {/* Last in the markup: the pen doodles in the corner once what's in view is drawn. */}
      <MarginScrawl seed="scrawl-corner" kind="corner" side="left" top={10} inset={10} rotate={-6} />
    </main>
  );
}

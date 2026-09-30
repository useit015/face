import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { MeasuredBox } from "@/components/ink/measured";
import { SketchSvg, Stroke, Underline } from "@/components/ink/sketch";
import { hashSeed, lineStroke, loopStroke } from "@/lib/sketch";

// A crossed-out route, the way you'd strike a wrong answer in a notebook.
const strike = [
  lineStroke(hashSeed("404-a"), [-6, 30], [150, 8], { bow: 0.8, jitter: 1 }),
  lineStroke(hashSeed("404-b"), [-4, 12], [152, 34], { bow: 0.8, jitter: 1 }),
];

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-svh w-full max-w-page flex-col justify-center px-5 sm:px-8">
      <Reveal variant="plain">
        <p className="relative inline-block text-display font-bold text-ink-3">
          <span className="write-text">404</span>
          <SketchSvg box={[-8, 0, 164, 44]} stretch className="left-[-8px] top-1/2 h-11 w-[calc(100%+16px)] -translate-y-1/2 text-ink">
            {strike.map((d, i) => (
              <Stroke key={i} d={d} delay={700 + i * 220} duration={260} width={2} />
            ))}
          </SketchSvg>
        </p>
        <h1 className="relative mt-4 inline-block text-heading font-bold">
          <span className="write-text" style={{ "--write-dd": "200ms" } as React.CSSProperties}>
            This route never shipped.
          </span>
          <Underline seed="404-underline" w={260} delay={900} className="top-full" />
        </h1>
        <p className="mt-5 max-w-sm text-body text-ink-2">
          Even the best backlogs have casualties. If you typed this URL by hand, impressively wrong.
        </p>
        <div className="mt-8 flex items-center gap-4">
          <Link href="/" className="ink-btn ink-btn--solid">
            <MeasuredBox seed="404-home" estimate={[230, 44]} filled delay={500} />
            <span className="relative">Back to the shipped things</span>
          </Link>
          <SketchSvg box={[0, 0, 40, 30]} className="relative hidden text-ink-3 sm:block" style={{ width: 40, height: 30 }}>
            <Stroke d={loopStroke(hashSeed("404-doodle"), 20, 12, { pad: 2, turns: 2.2 })} delay={1300} duration={600} width={1.2} />
          </SketchSvg>
        </div>
      </Reveal>
    </main>
  );
}

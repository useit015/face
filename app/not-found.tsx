import Link from "next/link";
import { Annotate } from "@/components/ui/annotate";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { InkProvider } from "@/hooks/use-ink-box";

export default function NotFound() {
  return (
    <InkProvider draw="mount">
      <main id="main" className="mx-auto flex min-h-svh w-full max-w-page flex-col items-start justify-center gap-4 px-5 sm:px-8">
        {/* A wrong address, struck out in red the way a wrong answer is. */}
        <p className="text-[length:var(--text-display)] leading-[1.05] font-bold text-ink-3">
          <Annotate type="strike" color="red" passes={2} delay={500} seed="404-strike">
            404
          </Annotate>
        </p>
        <SectionHeading as="h1" seed="404-title" delay={200} className="text-3xl tracking-normal normal-case">
          This page was never drawn.
        </SectionHeading>
        <p className="max-w-sm text-ink-2">The link is wrong or the page moved. The rest of the notebook is where you left it.</p>
        <Button nativeButton={false} render={<Link href="/" />} size="lg" seed="404-home" className="mt-4">
          Back to the front page
        </Button>
      </main>
    </InkProvider>
  );
}

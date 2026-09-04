import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main" className="mx-auto flex min-h-svh w-full max-w-page flex-col justify-center px-5 sm:px-8">
      <div>
        <p className="font-mono text-meta text-foreground-quaternary">
          HTTP 404
        </p>
        <h1 className="mt-2 text-heading font-medium tracking-tight">
          This route never shipped.
        </h1>
        <p className="mt-2 max-w-sm text-body text-foreground-secondary">
          Even the best backlogs have casualties. If you typed this URL by hand,
          impressively wrong.
        </p>
        <Link
          href="/"
          className="squircle relative mt-6 inline-flex h-8 items-center rounded-lg bg-foreground px-2.5 text-body font-medium text-background outline-none select-none before:absolute before:-inset-y-[6px] before:-inset-x-1 before:content-[''] hover:bg-foreground/80 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97] transition-[background-color,transform] duration-200"
        >
          Back to the shipped things
        </Link>
      </div>
    </main>
  );
}

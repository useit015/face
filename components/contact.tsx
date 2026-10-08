import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { SectionHeading } from "@/components/ui/section-heading";
import { TextLink } from "@/components/text-link";
import { InkGlyph } from "@/lib/ink-glyphs";
import { contact } from "@/lib/content";

/** The way in, again, for whoever read to the end. */
export function Contact() {
  return (
    <section aria-labelledby="contact-heading" className="flex flex-col gap-3">
      <SectionHeading id="contact-heading" specks>
        Contact
      </SectionHeading>
      <p className="max-w-[60ch]">
        The quickest way to talk is a 15-minute call. Email works too:{" "}
        <TextLink href={`mailto:${contact.email}`} seed="contact-email">
          {contact.email}
        </TextLink>
        .
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3.5 sm:flex">
        <Button size="lg" seed="contact-call" nativeButton={false} render={<a href={contact.cal} target="_blank" rel="noreferrer" />} className="w-full px-3 sm:w-auto sm:px-5">
          Book a call
          <InkGlyph name="arrow-up-right" className="size-4 transition-transform duration-(--dur-hover) ease-out group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5 motion-reduce:transition-none" />
          <span className="sr-only"> (opens in a new tab)</span>
        </Button>
        <CopyButton value={contact.email} size="lg" seed="contact-copy" copiedLabel="Copied" className="w-full px-3 sm:w-auto sm:px-5" aria-label={`Copy email address (${contact.email})`}>
          Copy email
        </CopyButton>
      </div>
    </section>
  );
}

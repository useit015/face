import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** A link inside a sentence: lightly underlined in pen, inked over on hover. */
export function TextLink({ href, seed, children }: { href: string; seed?: string; children: ReactNode }) {
  const external = /^https?:/.test(href);
  return (
    <Button
      variant="link"
      seed={seed}
      nativeButton={false}
      render={<a href={href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} />}
      // Sized and set like the words around it.
      className="h-auto px-0 align-baseline text-[length:inherit] leading-[inherit]"
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </Button>
  );
}

import { cn } from "@/lib/utils";

/** "React · Express · Cloudflare R2", never breaking inside a name. */
export function Stack({ items, className }: { items: string[]; className?: string }) {
  return (
    <p className={cn("text-sm text-ink-3", className)}>
      <span className="sr-only">Built with </span>
      {items.map((item, i) => (
        <span key={item}>
          {i > 0 && " · "}
          <span className="whitespace-nowrap">{item}</span>
        </span>
      ))}
    </p>
  );
}

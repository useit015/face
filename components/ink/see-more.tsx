import type { ReactNode } from "react";
import { hashSeed, lineStroke } from "@/lib/sketch";

const shaft = lineStroke(hashSeed("see-shaft"), [0, 5.5], [17, 5], { bow: 0.5, jitter: 0.3 });
const head = "M12.2 1.2C14 2.6 15.6 3.9 17.4 5C15.7 6.3 14.1 7.6 12.6 9.3";

/** "See more →" toggle: the arrow swings down when open, the label gets underlined on hover. */
export function SeeMore({
  open,
  onToggle,
  label,
  controls,
}: {
  open: boolean;
  onToggle: () => void;
  label: ReactNode;
  controls?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      aria-controls={controls}
      className="see-more ink-hover group relative -mr-1 inline-flex h-11 shrink-0 cursor-pointer items-center gap-2 px-1 text-meta font-normal text-ink-2 transition-colors duration-200 select-none hover:text-ink"
    >
      <span className="pen-underline">{open ? "See less" : label}</span>
      <svg
        viewBox="-1 0 20 11"
        aria-hidden="true"
        className={`sketch h-[11px] w-5 overflow-visible transition-transform duration-300 ease-[cubic-bezier(0,0,0.2,1)] motion-reduce:transition-none ${
          open ? "rotate-[-90deg]" : "group-hover:translate-x-0.5"
        }`}
      >
        <path d={shaft} strokeWidth={1.4} />
        <path d={head} strokeWidth={1.4} />
      </svg>
    </button>
  );
}

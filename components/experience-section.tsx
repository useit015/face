"use client";

import { ArrowUpRight, ChevronsUpDown } from "lucide-react";
import {
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion } from "motion/react";
import { Reveal } from "@/components/reveal";
import { SkillIcon } from "@/components/icons";
import { experience, type Role } from "@/lib/content";

const ease = [0.4, 0, 0.2, 1] as const;
const flyEase = [0.16, 1, 0.3, 1] as const;

type Point = { x: number; y: number };

const hiddenTreeClass =
  "pointer-events-none invisible absolute inset-x-0 top-0 h-0 overflow-hidden opacity-0";
const visibleTreeClass = "relative opacity-100";

function TimelineDot({ active }: { active?: boolean }) {
  return (
    <span className="relative -mt-1 inline-flex size-[7px] items-center justify-center">
      {active && (
        <span
          aria-hidden="true"
          className="timeline-status-halo absolute size-6 rounded-full"
        />
      )}
      <span
        className={`relative z-10 inline-block size-[7px] rounded-full squircle ${
          active ? "bg-foreground" : "bg-foreground-quaternary"
        }`}
      />
    </span>
  );
}

function RoleDetail({ role }: { role: Role }) {
  return (
    <div className="relative flex min-w-0 gap-3">
      <span className="squircle mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
        <SkillIcon
          name={role.icon}
          className="size-4 text-foreground-secondary"
        />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-baseline justify-between gap-3">
          <h3 className="flex min-w-0 items-center gap-1.5 text-body font-medium tracking-tight">
            {role.url ? (
              <a
                href={role.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-w-0 items-center gap-1.5 rounded-sm underline-offset-3 decoration-foreground-decoration outline-none transition-[text-decoration-color,color] duration-200 hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="truncate">{role.company}</span>
                <ArrowUpRight className="size-3 shrink-0 text-foreground-tertiary" />
              </a>
            ) : (
              role.company
            )}
          </h3>
          <p className="shrink-0 font-mono text-meta text-foreground-tertiary">
            {role.period}
          </p>
        </div>
        <p className="mt-0.5 text-body text-foreground-secondary">
          {role.title}
        </p>
        {role.bullets.length > 0 && (
          <ul className="mt-2.5 flex max-w-[65ch] flex-col gap-1">
            {role.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-2 text-body text-foreground-tertiary"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.45em] size-1 shrink-0 rounded-full bg-foreground-quaternary"
                />
                {bullet}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function DetailTree({
  hidden,
  deltas,
  flip,
  rowRefs,
}: {
  hidden: boolean;
  deltas: Record<string, Point> | null;
  flip: number;
  rowRefs: RefObject<Map<string, HTMLDivElement>>;
}) {
  return (
    <ol
      inert={hidden}
      className={`flex flex-col gap-y-2 pt-5 ${
        hidden ? hiddenTreeClass : visibleTreeClass
      }`}
    >
      {experience.map((role, i) => {
        const d = !hidden ? deltas?.[role.company] : undefined;
        const flying = i < 4 && d != null;
        return (
          <li
            key={role.company}
            className={`relative ${i === 0 ? "" : "pt-6"}`}
          >
            <motion.div
              key={`${role.company}-${flip}`}
              initial={
                flying ? { x: d.x, y: d.y, opacity: 0 } : { y: 24, opacity: 0 }
              }
              animate={{ x: 0, y: 0, opacity: 1 }}
              transition={
                flying
                  ? {
                      duration: 1,
                      ease: flyEase,
                      opacity: { duration: 0.4, ease },
                    }
                  : {
                      duration: 0.9,
                      ease: flyEase,
                      delay: 0.15 + Math.max(0, i - 4) * 0.06,
                    }
              }
            >
              <div
                ref={(el) => {
                  if (el) rowRefs.current.set(role.company, el);
                  else rowRefs.current.delete(role.company);
                }}
              >
                <RoleDetail role={role} />
              </div>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

function StripTree({
  hidden,
  deltas,
  flip,
  cardRefs,
}: {
  hidden: boolean;
  deltas: Record<string, Point> | null;
  flip: number;
  cardRefs: RefObject<Map<string, HTMLDivElement>>;
}) {
  const strip = experience.slice(0, 4);
  return (
    <div
      inert={hidden}
      className={`pt-6 ${hidden ? hiddenTreeClass : visibleTreeClass}`}
    >
      <div className="absolute left-[3px] right-0 top-[23px] hidden h-px bg-timeline-line sm:block" />
      <div
        className="absolute left-[3px] top-[23px] hidden h-px w-[calc(25%-3px)] sm:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--foreground) 0%, var(--timeline-line) 70%, var(--timeline-line) 100%)",
        }}
      />
      <Reveal variant="stagger" className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 sm:gap-y-0">
        {strip.map((entry, i) => {
          const d = !hidden ? deltas?.[entry.company] : undefined;
          return (
            <div key={entry.company} className="flex min-w-0 flex-col gap-3">
              <motion.div
                key={`${entry.company}-${flip}`}
                initial={d ? { x: d.x, y: d.y, opacity: 0 } : false}
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{
                  duration: 0.9,
                  ease: flyEase,
                  opacity: { duration: 0.25, ease },
                }}
              >
                <div
                  ref={(el) => {
                    if (el) cardRefs.current.set(entry.company, el);
                    else cardRefs.current.delete(entry.company);
                  }}
                  className="flex min-w-0 flex-col gap-3"
                >
                  <TimelineDot active={i === 0} />
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="squircle flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card">
                      <SkillIcon
                        name={entry.icon}
                        className="size-4 text-foreground-secondary"
                      />
                    </span>
                    {entry.url ? (
                      <a
                        href={entry.url}
                        target="_blank"
                        rel="noreferrer"
                        className="min-w-0 truncate rounded-sm text-body font-medium underline-offset-3 decoration-foreground-decoration outline-none transition-[text-decoration-color,color] duration-200 hover:text-foreground hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {entry.company}
                      </a>
                    ) : (
                      <span className="min-w-0 truncate text-body font-medium">
                        {entry.company}
                      </span>
                    )}
                  </div>
                  <p className="truncate font-mono text-meta text-foreground-tertiary">
                    {entry.period}
                  </p>
                </div>
              </motion.div>
            </div>
          );
        })}
      </Reveal>
    </div>
  );
}

export function ExperienceSection() {
  const [open, setOpen] = useState(false);
  const [height, setHeight] = useState<number | "auto">("auto");
  const [animating, setAnimating] = useState(false);
  const [deltas, setDeltas] = useState<Record<string, Point> | null>(null);
  const [flip, setFlip] = useState(0);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const stripRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fromRects = useRef<Record<string, Point> | null>(null);

  useLayoutEffect(() => {
    const measure = () => {
      const el = contentRef.current;
      if (el) setHeight(el.offsetHeight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (contentRef.current) ro.observe(contentRef.current);
    return () => ro.disconnect();
  }, []);

  // Runs after a visibility swap, before paint: the entering tree is in flow
  // with un-transformed children, so its rects are the exact flight targets.
  useLayoutEffect(() => {
    const from = fromRects.current;
    if (!from) return;
    const refs = open ? rowRefs.current : stripRefs.current;
    const next: Record<string, Point> = {};
    for (const [company, point] of Object.entries(from)) {
      const el = refs.get(company);
      if (!el) continue;
      const r = el.getBoundingClientRect();
      next[company] = { x: point.x - r.x, y: point.y - r.y };
    }
    fromRects.current = null;
    setDeltas(next);
    setFlip((f) => f + 1);
  }, [open]);

  const toggle = () => {
    const rects: Record<string, Point> = {};
    const refs = open ? rowRefs.current : stripRefs.current;
    refs.forEach((el, company) => {
      const r = el.getBoundingClientRect();
      rects[company] = { x: r.x, y: r.y };
    });
    fromRects.current = rects;
    setDeltas(null);
    setOpen((v) => !v);
  };

  return (
    <section
      aria-labelledby="experience-heading"
      className="flex flex-col gap-5"
    >
      <Reveal variant="fade">
        <div className="relative">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="experience-heading"
              className="font-mono text-meta font-medium uppercase tracking-[0.14em] text-foreground-tertiary"
            >
              Experience
            </h2>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              className="group/see relative inline-flex h-7 shrink-0 cursor-pointer items-center gap-1.5 rounded-md px-2 -mr-2 font-mono text-meta font-medium text-foreground-secondary transition-[background-color,color,transform] duration-200 outline-none select-none squircle before:absolute before:-inset-y-2 before:-inset-x-1 before:content-[''] hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-[0.97]"
            >
              {open ? "See less" : `See ${experience.length - 4} more`}
              <ChevronsUpDown className="size-3" />
            </button>
          </div>
          <motion.div
            className={`relative -mx-3 px-3 ${animating ? "overflow-hidden" : ""}`}
            initial={false}
            animate={{ height }}
            transition={{ duration: 0.45, ease }}
            onAnimationStart={() => setAnimating(true)}
            onAnimationComplete={() => setAnimating(false)}
          >
            <div ref={contentRef}>
              <StripTree
                hidden={open}
                deltas={deltas}
                flip={flip}
                cardRefs={stripRefs}
              />
              <DetailTree
                hidden={!open}
                deltas={deltas}
                flip={flip}
                rowRefs={rowRefs}
              />
            </div>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

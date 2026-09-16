"use client";

import { ArrowUpRight, ChevronsUpDown } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/reveal";
import { SkillIcon } from "@/components/icons";
import { experience, type Role } from "@/lib/content";

const heightEase = [0.16, 1, 0.3, 1] as const;
const ease = [0.4, 0, 0.2, 1] as const;
const flyEase = [0.16, 1, 0.3, 1] as const;
// The relocation rows settle at this point; the rest of the tree only enters
// once they are fully animated.
const FLIGHT_S = 0.8;

type Point = { x: number; y: number };

type PaneState = "flow" | "overlay" | "hidden";

// The two trees swap roles around the height animation:
// - flow: in flow — defines the container's resting height
// - overlay: painted in place at natural height while the height animates;
//   clipped only by the container's overflow-hidden so flying rows can travel
//   outside the tree's own box
// - hidden: fully out of the way once the animation has settled
const PANE_CLASS: Record<PaneState, string> = {
  flow: "relative",
  // left-3/right-3 (not inset-x-0) so the overlay spans the container's
  // content box — same position the tree occupies in flow. The container is
  // -mx-3 px-3, so inset-x-0 would sit 12px left and jump on every swap.
  overlay: "absolute left-3 right-3 top-0",
  hidden:
    "pointer-events-none invisible absolute left-3 right-3 top-0 h-0 overflow-hidden",
};

const PANE_FADE =
  "transition-opacity duration-[250ms] ease-out motion-reduce:transition-none";

function paneClasses(state: PaneState, target: boolean) {
  // Asymmetric crossfade: the entering tree is fully visible from frame one
  // so its flights read as relocation, not a fade; only the leaving tree
  // crossfades away.
  const leaving = state === "flow" && !target; // only possible mid-animation
  const opacity = leaving || state === "hidden" ? "opacity-0" : "opacity-100";
  return `${PANE_CLASS[state]} ${opacity} ${leaving ? PANE_FADE : ""}`;
}

// Mid-animation the leaving tree stays in flow while the entering one
// overlays it; on completion they settle into their resting roles.
function paneStateFor(target: boolean, animating: boolean): PaneState {
  if (!animating) return target ? "flow" : "hidden";
  return target ? "overlay" : "flow";
}

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

type BodyPhase = "static" | "reveal" | "conceal";

function RoleDetail({
  role,
  bodyPhase = "static",
}: {
  role: Role;
  bodyPhase?: BodyPhase;
}) {
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
        {/* While flying, only the header travels (it mirrors the strip card);
            title + bullets unfurl once the row nears its resting spot. */}
        <motion.div
          initial={
            bodyPhase === "reveal"
              ? { opacity: 0 }
              : bodyPhase === "conceal"
                ? { opacity: 1 }
                : false
          }
          animate={{ opacity: bodyPhase === "conceal" ? 0 : 1 }}
          transition={
            bodyPhase === "reveal"
              ? { delay: 0.3, duration: 0.35, ease }
              : bodyPhase === "conceal"
                ? { duration: 0.15, ease }
                : { duration: 0 }
          }
        >
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
        </motion.div>
      </div>
    </div>
  );
}

function DetailTree({
  pane,
  target,
  restRevealed,
  rootRef,
  deltas,
  flip,
  rowRefs,
}: {
  pane: PaneState;
  target: boolean;
  restRevealed: boolean;
  rootRef: RefObject<HTMLOListElement | null>;
  deltas: Record<string, Point> | null;
  flip: number;
  rowRefs: RefObject<Map<string, HTMLDivElement>>;
}) {
  // Under reduced motion there is no flight, so the body belongs to the row's
  // own fade instead of unfurling on a delay.
  const reduce = useReducedMotion() ?? false;
  return (
    <ol
      ref={rootRef}
      inert={!target}
      className={`flex flex-col gap-y-2 pt-5 ${paneClasses(pane, target)}`}
    >
      {experience.map((role, i) => {
        const d = target ? deltas?.[role.company] : undefined;
        const flying = i < 4 && d != null;
        const bodyPhase: BodyPhase = reduce
          ? "static"
          : !target
            ? "conceal"
            : flying
              ? "reveal"
              : "static";
        return (
          <li
            key={role.company}
            className={`relative ${i === 0 ? "" : "pt-6"}`}
          >
            <motion.div
              key={`${role.company}-${flip}`}
              // Flying rows travel fully opaque — the relocation IS the
              // animation. While hidden, skip the mount animation entirely.
              initial={
                target
                  ? flying
                    ? { x: d.x, y: d.y }
                    : reduce
                      ? false
                      : { y: 24, opacity: 0 }
                  : reduce || restRevealed
                    ? false
                    : { opacity: 0 }
              }
              // Rows whose staged entrance never ran stay at zero through the
              // collapse instead of fading in while the tree is leaving.
              animate={
                flying
                  ? { x: 0, y: 0 }
                  : { x: 0, y: 0, opacity: !reduce && !target && !restRevealed ? 0 : 1 }
              }
              transition={
                flying
                  ? { duration: FLIGHT_S, ease: flyEase }
                  : reduce
                    ? { duration: 0 }
                    : target
                      ? // The rest waits for the relocation to fully settle.
                        {
                          duration: 0.45,
                          ease: flyEase,
                          delay: FLIGHT_S + Math.max(0, i - 4) * 0.045,
                        }
                      : { duration: 0.45, ease: flyEase }
              }
            >
              <div
                ref={(el) => {
                  if (el) rowRefs.current.set(role.company, el);
                  else rowRefs.current.delete(role.company);
                }}
              >
                <RoleDetail role={role} bodyPhase={bodyPhase} />
              </div>
            </motion.div>
          </li>
        );
      })}
    </ol>
  );
}

function StripTree({
  pane,
  target,
  rootRef,
  deltas,
  flip,
  cardRefs,
}: {
  pane: PaneState;
  target: boolean;
  rootRef: RefObject<HTMLDivElement | null>;
  deltas: Record<string, Point> | null;
  flip: number;
  cardRefs: RefObject<Map<string, HTMLDivElement>>;
}) {
  const strip = experience.slice(0, 4);
  return (
    <div
      ref={rootRef}
      inert={!target}
      className={`pt-6 ${paneClasses(pane, target)}`}
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
          const d = target ? deltas?.[entry.company] : undefined;
          return (
            <div key={entry.company} className="flex min-w-0 flex-col gap-3">
              {/* The dot stays on the timeline as the flight's destination;
                  only the card content travels. */}
              <TimelineDot active={i === 0} />
              <motion.div
                key={`${entry.company}-${flip}`}
                initial={d ? { x: d.x, y: d.y } : false}
                animate={{ x: 0, y: 0 }}
                transition={{ duration: 0.8, ease: flyEase }}
              >
                <div
                  ref={(el) => {
                    if (el) cardRefs.current.set(entry.company, el);
                    else cardRefs.current.delete(entry.company);
                  }}
                  className="flex min-w-0 flex-col gap-3"
                >
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
  const [animating, setAnimating] = useState(false);
  const [deltas, setDeltas] = useState<Record<string, Point> | null>(null);
  const [flip, setFlip] = useState(0);
  // Whether the rows below the flying four have been revealed in the current
  // open cycle. Guards against them flashing in when a collapse interrupts
  // their delayed entrance.
  const [restRevealed, setRestRevealed] = useState(false);
  const restTimer = useRef<number | undefined>(undefined);
  const stripRootRef = useRef<HTMLDivElement | null>(null);
  const detailRootRef = useRef<HTMLOListElement | null>(null);
  const [heights, setHeights] = useState<{
    strip: number;
    detail: number;
  } | null>(null);
  const stripRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const fromRects = useRef<Record<string, Point> | null>(null);

  useEffect(() => () => window.clearTimeout(restTimer.current), []);

  useLayoutEffect(() => {
    const measure = () => {
      const s = stripRootRef.current;
      const d = detailRootRef.current;
      if (s && d) setHeights({ strip: s.offsetHeight, detail: d.offsetHeight });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (stripRootRef.current) ro.observe(stripRootRef.current);
    if (detailRootRef.current) ro.observe(detailRootRef.current);
    return () => ro.disconnect();
  }, []);

  const height = heights ? (open ? heights.detail : heights.strip) : "auto";

  // Runs after a visibility swap, before paint: the entering tree is at its
  // final position with un-transformed children, so its rects are the exact
  // flight targets.
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
    window.clearTimeout(restTimer.current);
    const rects: Record<string, Point> = {};
    const refs = open ? rowRefs.current : stripRefs.current;
    refs.forEach((el, company) => {
      const r = el.getBoundingClientRect();
      rects[company] = { x: r.x, y: r.y };
    });
    fromRects.current = rects;
    setDeltas(null);
    if (open) {
      // Collapsing: keep restRevealed as-is so rows that were already shown
      // fade out with the tree instead of popping.
    } else {
      // Expanding: the rest enters only after the flights fully settle.
      setRestRevealed(false);
      restTimer.current = window.setTimeout(
        () => setRestRevealed(true),
        FLIGHT_S * 1000,
      );
    }
    setOpen((v) => !v);
    if (heights && heights.strip !== heights.detail) setAnimating(true);
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
              <ChevronsUpDown
                className={`size-3 transition-transform duration-300 motion-reduce:transition-none ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>
          <motion.div
            className={`relative -mx-3 px-3 ${animating ? "overflow-hidden" : ""}`}
            initial={false}
            animate={{ height }}
            transition={{ duration: heights ? 0.65 : 0, ease: heightEase }}
            onAnimationComplete={() => setAnimating(false)}
          >
            <StripTree
              pane={paneStateFor(!open, animating)}
              target={!open}
              rootRef={stripRootRef}
              deltas={deltas}
              flip={flip}
              cardRefs={stripRefs}
            />
            <DetailTree
              pane={paneStateFor(open, animating)}
              target={open}
              restRevealed={restRevealed}
              rootRef={detailRootRef}
              deltas={deltas}
              flip={flip}
              rowRefs={rowRefs}
            />
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

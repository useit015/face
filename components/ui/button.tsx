"use client";

import { Children, isValidElement, useId, useMemo, type CSSProperties, type ReactNode } from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import {
  penStyle,
  useInkFrame,
  useInkSeed,
  usePen,
  type InkDraw,
  type InkFill,
  type InkShadow,
  type InkSize,
  type Pen,
} from "@/hooks/use-ink-box";
import { inkClassName, InkSvg, Stroke } from "@/lib/ink";
import {
  boxStroke,
  cornerTicks,
  crossedBoxStroke,
  hatchStrokes,
  linkStroke,
  penBoxStrokes,
  roundedBoxStroke,
  roundedRectPath,
  scribbleFill,
  shadeFill,
} from "@/lib/ink-sketch";

const buttonVariants = cva(
  [
    "group/button ink-hover relative isolate inline-flex shrink-0 cursor-pointer items-center justify-center whitespace-nowrap select-none",
    "transition-[translate,color] duration-(--dur-hover) ease-out",
    "outline-none focus-visible:outline-solid focus-visible:outline-[1.5px] focus-visible:outline-offset-4 focus-visible:outline-ring",
    // Rounded buttons get a ring that follows their corners.
    "focus-visible:[border-radius:var(--ink-r,var(--hand-radius))]",
    "disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50",
    "[&_svg:not(.ink-sketch)]:pointer-events-none [&_svg:not(.ink-sketch)]:shrink-0",
    "motion-reduce:transition-none",
  ],
  {
    variants: {
      variant: {
        default: "text-primary-foreground",
        outline: "text-foreground",
        secondary: "text-foreground",
        ghost: "text-ink-2 hover:text-ink focus-visible:text-ink aria-expanded:text-ink",
        destructive: "text-destructive",
        link: "text-foreground",
      },
      size: {
        default: "h-10 gap-1.5 px-4 text-base [&_svg:not(.ink-sketch):not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1 px-2 text-xs [&_svg:not(.ink-sketch):not([class*='size-'])]:size-3.5",
        sm: "h-8 gap-1 px-3 text-sm [&_svg:not(.ink-sketch):not([class*='size-'])]:size-4",
        lg: "h-12 gap-2 px-5 text-lg [&_svg:not(.ink-sketch):not([class*='size-'])]:size-5",
        icon: "size-10 [&_svg:not(.ink-sketch):not([class*='size-'])]:size-4.5",
        "icon-xs": "size-7 [&_svg:not(.ink-sketch):not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8 [&_svg:not(.ink-sketch):not([class*='size-'])]:size-4",
        "icon-lg": "size-12 [&_svg:not(.ink-sketch):not([class*='size-'])]:size-5",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto px-0.5" }],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

// Boxed buttons lift off their shadow on hover and focus; pressing flattens
// them back onto the paper.
// A trigger stays flat while its popup is open, so the popup (anchored to
// the trigger) doesn't shift when the pointer moves over it.
const lift =
  "hover:-translate-[1.5px] focus-visible:-translate-[1.5px] active:translate-0 active:duration-(--dur-press) aria-expanded:hover:translate-0 aria-expanded:focus-visible:translate-0 data-popup-open:hover:translate-0 data-popup-open:focus-visible:translate-0";

type Variant = NonNullable<VariantProps<typeof buttonVariants>["variant"]>;
type Size = NonNullable<VariantProps<typeof buttonVariants>["size"]>;

const metrics: Record<Size, { h: number; font: number; pad: number }> = {
  default: { h: 40, font: 20, pad: 16 },
  xs: { h: 28, font: 15, pad: 8 },
  sm: { h: 32, font: 17, pad: 12 },
  lg: { h: 48, font: 22, pad: 20 },
  icon: { h: 40, font: 20, pad: 0 },
  "icon-xs": { h: 28, font: 15, pad: 0 },
  "icon-sm": { h: 32, font: 17, pad: 0 },
  "icon-lg": { h: 48, font: 22, pad: 0 },
};

function textLength(node: ReactNode): number {
  let n = 0;
  Children.forEach(node, (child) => {
    if (typeof child === "string" || typeof child === "number") n += String(child).length;
  });
  return n;
}

/** A first guess at the button's box, for the server render (measured on the client). */
function estimateSize(children: ReactNode, size: Size): InkSize {
  const { h, font, pad } = metrics[size];
  if (size.startsWith("icon")) return [h, h];
  return [Math.round(textLength(children) * font * 0.46 + pad * 2), h];
}

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> &
  Pen & {
    /** Pins the drawing; by default each button gets its own wobble. */
    seed?: string | number;
  };

function Button({
  className,
  style,
  variant,
  size,
  seed,
  children,
  roughness,
  passes,
  radius,
  corners,
  fill,
  shadow,
  draw,
  weight,
  speed,
  ...props
}: ButtonProps) {
  const pen = usePen({ roughness, passes, radius, corners, fill, shadow, draw, weight, speed });
  const v = variant ?? "default";
  const sz = size ?? "default";
  const lifts = v !== "ghost" && v !== "link" && pen.shadow !== "none";
  const classes = cn(buttonVariants({ variant: v, size: sz }), lifts && lift);
  const ring = pen.radius === "full" ? "9999px" : pen.radius ? `${pen.radius}px` : undefined;
  const own = ring ? ({ "--ink-r": ring } as CSSProperties) : undefined;
  // A link drawn as a button is still a link: Base UI gives any element
  // other than a <button> role="button" unless told otherwise.
  const link = isValidElement<{ href?: unknown }>(props.render) && (props.render.type === "a" || props.render.props.href !== undefined);

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={v}
      className={inkClassName(classes, className)}
      style={typeof style === "function" ? (state) => ({ ...own, ...style(state) }) : own || style ? { ...own, ...style } : undefined}
      {...(link ? { role: undefined } : null)}
      {...props}
    >
      <ButtonInk variant={v} seed={seed} pen={pen} estimate={estimateSize(children, sz)} />
      {children}
    </ButtonPrimitive>
  );
}

type Look = {
  variant: Variant;
  roughness: number;
  passes: number;
  corners: "crossed" | "joined";
  fill: InkFill;
  shadow: InkShadow;
  r: number;
};

type ButtonPaths = {
  body?: string;
  passes?: string[];
  shadow?: string;
  ticks?: string;
  fill?: string[];
  ghost?: string;
  underline?: string[];
};

// Paths depend only on (look, seed, size), and the same button is drawn
// again on every re-render and remount, so recent ones are kept.
const pathCache = new Map<string, ButtonPaths>();

/** Only the strokes this look shows: fills are the expensive ones. */
function buttonPaths(look: Look, s: number, w: number, h: number): ButtonPaths {
  const key = `${Object.values(look).join("|")}|${s}|${w}|${h}`;
  const hit = pathCache.get(key);
  if (hit) return hit;

  const { variant, roughness: q, passes: n, corners, fill, shadow, r } = look;
  // Small buttons get shorter overshoots, so the corners stay neat.
  const k = Math.min(1, h / 40);

  let paths: ButtonPaths;
  if (variant === "link") {
    paths = { underline: [linkStroke(s + 10, w), linkStroke(s + 11, w)] };
  } else if (variant === "ghost") {
    paths = {
      ghost: r > 0 ? roundedBoxStroke(s + 8, w, h, r, { jitter: 0.5 * q }) : boxStroke(s + 8, w, h, { overshoot: 2.4 * k * q, jitter: 1.1 * q, bow: 1.3 * q }),
    };
  } else {
    paths = {
      body: r > 0 ? roundedRectPath(w, h, r) : `${boxStroke(s + 7, w, h, { overshoot: 0, jitter: 0.9 * q })}Z`,
      passes: penBoxStrokes(s, w, h, { roughness: q, passes: n, corners, radius: r }),
    };
    if (shadow !== "none") {
      paths.shadow =
        r > 0
          ? roundedBoxStroke(s + 9, w, h, r, { jitter: 0.4 * q, overrun: 0.02 })
          : crossedBoxStroke(s + 9, w, h, { overshoot: 2 * k * q, jitter: q, bow: 1.1 * q });
    }
    if (variant === "outline" || variant === "destructive") {
      paths.ticks = cornerTicks(s + 5, w, h, { count: Math.max(3, Math.round(5 * k)), len: 7 * k });
    }
    // The solid button is coloured in densely, secondary lightly; outlined
    // buttons keep a paper face.
    const solid = variant === "default";
    if (!solid && variant !== "secondary") {
      // No fill.
    } else if (fill === "shade") {
      paths.fill = solid
        ? [shadeFill(s + 3, w, h, { gap: 2.3, angle: -14 }), shadeFill(s + 4, w, h, { gap: 4.2, angle: -26 })]
        : [shadeFill(s + 6, w, h, { gap: 4.6, angle: -16 })];
    } else if (fill === "hatch") {
      paths.fill = solid
        ? [hatchStrokes(s + 3, w, h, { gap: 2.6, angle: -50, jitter: 0.4 }).join(""), hatchStrokes(s + 4, w, h, { gap: 3.6, angle: 42, jitter: 0.4 }).join("")]
        : [hatchStrokes(s + 6, w, h, { gap: 4.6, angle: -50, jitter: 0.5, inset: 1.5 }).join("")];
    } else if (fill === "scribble") {
      paths.fill = solid ? [scribbleFill(s + 3, w, h, { gap: 2.4 }), scribbleFill(s + 4, w, h, { gap: 3.8, slant: 0.3 })] : [scribbleFill(s + 6, w, h, { gap: 5 })];
    }
  }

  if (pathCache.size >= 500) pathCache.delete(pathCache.keys().next().value!);
  pathCache.set(key, paths);
  return paths;
}

/** The drawn part of a button, regenerated to the button's real size. */
function ButtonInk({ variant, seed, pen, estimate }: { variant: Variant; seed?: string | number; pen: Pen; estimate: InkSize }) {
  const uid = useId();
  const id = uid.replace(/[^\w-]/g, "");
  const s = useInkSeed(seed);
  const { ref, w, h, frame } = useInkFrame(estimate);
  const draw: InkDraw = pen.draw ?? "auto";
  const roughness = pen.roughness ?? 1;
  const passes = pen.passes ?? (variant === "secondary" ? 2 : 3);
  const corners = pen.corners ?? "crossed";
  const fillStyle = pen.fill ?? (variant === "secondary" ? "hatch" : "shade");
  const shadowStyle = pen.shadow ?? "hatch";
  const r = pen.radius === "full" ? h / 2 : Math.min(pen.radius ?? 0, h / 2);
  const paths = useMemo(
    () => buttonPaths({ variant, roughness, passes, corners, fill: fillStyle, shadow: shadowStyle, r }, s, w, h),
    [variant, roughness, passes, corners, fillStyle, shadowStyle, r, s, w, h],
  );
  const at = (delay: number) => ({ draw, delay });
  const style = { ...frame.style, ...penStyle(pen) };
  const pending = draw === "auto";

  if (paths.underline) {
    return (
      <InkSvg ref={ref} pending={pending} box={[0, -2, w, 6]} stretch className="-z-10 inset-x-0 top-full -mt-1 h-1.5 w-full" style={penStyle(pen)}>
        {/* Lightly underlined at rest, inked over on hover. */}
        <Stroke d={paths.underline[0]} {...at(0)} duration={320} width={1.4} opacity={0.5} />
        <Stroke d={paths.underline[1]} draw="hover" duration={280} width={1.5} />
      </InkSvg>
    );
  }

  if (paths.ghost) {
    return (
      <InkSvg ref={ref} {...frame} style={style} className="-z-10">
        <Stroke d={paths.ghost} draw="hover" duration={340} width={1.2} />
      </InkSvg>
    );
  }

  const { body = "", passes: outlines = [], shadow, fill, ticks } = paths;
  const solid = variant === "default";
  const flat = fillStyle === "flat";
  const { box } = frame;
  return (
    // A coloured-in face is drawn in ink; its label is paper-coloured.
    <InkSvg ref={ref} {...frame} pending={pending} style={style} className={cn("-z-10", solid && "text-primary")}>
      <defs>
        {shadowStyle === "hatch" && (
          <pattern id={`${id}-hatch`} patternUnits="userSpaceOnUse" width={3.2} height={3.2} patternTransform="rotate(-45)">
            <path d="M0 -1V4.2" style={{ strokeWidth: 1.05 }} />
          </pattern>
        )}
        {/* The shadow is masked out under the face rather than covered by
            it, so the face stays the paper itself. */}
        {shadow && (
          <mask id={`${id}-under`} maskUnits="userSpaceOnUse" x={box[0] - 20} y={box[1] - 20} width={box[2] + 40} height={box[3] + 40}>
            <rect x={box[0] - 20} y={box[1] - 20} width={box[2] + 40} height={box[3] + 40} fill="#fff" />
            <path d={body} style={{ fill: "#000", stroke: "#000", strokeWidth: 1.5 }} />
          </mask>
        )}
        {fill && (
          <clipPath id={`${id}-clip`}>
            <rect x={-1.5} y={-1.5} width={w + 3} height={h + 3} rx={r || 1.5} />
          </clipPath>
        )}
      </defs>

      {shadow && (
        <g mask={`url(#${id}-under)`}>
          <g
            className={cn(
              "opacity-0 transition-[translate,opacity] duration-(--dur-hover) ease-out motion-reduce:transition-none",
              "group-hover/button:translate-[5px] group-hover/button:opacity-100",
              "group-focus-visible/button:translate-[5px] group-focus-visible/button:opacity-100",
              "group-active/button:translate-0 group-active/button:duration-(--dur-press)",
            )}
          >
            <path
              d={body}
              style={shadowStyle === "hatch" ? { fill: `url(#${id}-hatch)`, stroke: "none" } : { fill: "currentColor", stroke: "none", opacity: 0.85 }}
            />
            <path d={shadow} style={{ strokeWidth: 1 }} />
          </g>
        </g>
      )}

      {/* The face: shaded solid with the pen (the strokes read through the
          fill), or a light wash for a flat secondary. */}
      {solid && <path d={body} className="ink-fill" style={flat ? { opacity: 1 } : undefined} />}
      {variant === "secondary" && flat && <path d={body} className="ink-fill" style={{ opacity: 0.14 }} />}
      {fill && (
        <g clipPath={`url(#${id}-clip)`}>
          {fill.map((d, i) =>
            solid ? (
              <Stroke key={i} d={d} {...at(120 + i * 180)} duration={620 - i * 100} width={[1.2, 1][i]} opacity={[1, 0.7][i]} />
            ) : (
              <Stroke key={i} d={d} {...at(200)} duration={480} width={0.9} opacity={fillStyle === "hatch" ? 0.45 : 0.35} />
            ),
          )}
        </g>
      )}

      {/* Passes that never quite line up, each running past its corners,
          the way a box gets gone over when it matters. */}
      {outlines.map((d, i) => (
        <Stroke
          key={i}
          d={d}
          {...at([0, 300, 520][i])}
          duration={[480, 420, 380][i]}
          width={[1.4, 1.1, 1][i]}
          opacity={i === 0 ? undefined : variant === "secondary" ? 0.6 : [1, 0.8, 0.55][i]}
        />
      ))}
      {ticks && <Stroke d={ticks} {...at(760)} duration={260} width={1} opacity={0.7} />}
    </InkSvg>
  );
}

export { Button, buttonVariants };

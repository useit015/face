"use client";

import { useId, useMemo } from "react";
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import { cn } from "@/lib/utils";
import { penStyle, useInkFrame, useInkSeed, usePen, type Pen } from "@/hooks/use-ink-box";
import { inkClassName, InkSvg, Stroke } from "@/lib/ink";
import { penBoxStrokes, roundedRectPath, shadeFill } from "@/lib/ink-sketch";

function TooltipProvider({ delay = 0, ...props }: TooltipPrimitive.Provider.Props) {
  return <TooltipPrimitive.Provider data-slot="tooltip-provider" delay={delay} {...props} />;
}

function Tooltip({ ...props }: TooltipPrimitive.Root.Props) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />;
}

function TooltipTrigger({ ...props }: TooltipPrimitive.Trigger.Props) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

/**
 * A word or two on a tab shaded solid with the pen, written out in paper,
 * with a little tail pointing at what it's about.
 */
function TooltipContent({
  className,
  side = "top",
  sideOffset = 8,
  align = "center",
  alignOffset = 0,
  children,
  seed,
  roughness,
  radius,
  weight,
  ...props
}: TooltipPrimitive.Popup.Props &
  Pick<TooltipPrimitive.Positioner.Props, "align" | "alignOffset" | "side" | "sideOffset"> &
  Pick<Pen, "roughness" | "radius" | "weight"> & { seed?: string | number }) {
  const pen = usePen({ roughness, radius, weight });
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner align={align} alignOffset={alignOffset} side={side} sideOffset={sideOffset} className="isolate z-50">
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          className={inkClassName(
            "relative isolate inline-flex w-fit max-w-xs origin-(--transform-origin) items-center gap-1.5 px-3 py-1 text-sm text-primary-foreground",
            "transition-[opacity,scale] duration-(--dur-hover) ease-out data-starting-style:opacity-0 data-ending-style:opacity-0 data-instant:transition-none",
            "motion-safe:data-starting-style:scale-95 motion-safe:data-ending-style:scale-95",
            className,
          )}
          {...props}
        >
          <TooltipInk pen={pen} seed={seed} />
          {children}
          <TooltipPrimitive.Arrow
            data-slot="tooltip-arrow"
            className={cn(
              "flex text-primary",
              "data-[side=top]:-bottom-[7px] data-[side=bottom]:-top-[7px] data-[side=bottom]:rotate-180",
              "data-[side=left]:-right-[9.5px] data-[side=left]:-rotate-90 data-[side=right]:-left-[9.5px] data-[side=right]:rotate-90",
              "data-[side=inline-end]:-left-[9.5px] data-[side=inline-end]:rotate-90 data-[side=inline-start]:-right-[9.5px] data-[side=inline-start]:-rotate-90",
            )}
          >
            <svg aria-hidden="true" viewBox="0 0 12 8" className="ink-sketch block h-2 w-3">
              <path d="M0.5 0.2C3 2.5 5 5.4 6.2 7.6C7.3 5.2 9.1 2.6 11.5 0.4Z" className="ink-fill" />
            </svg>
          </TooltipPrimitive.Arrow>
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  );
}

/** The tab: a solid fill in ink, shaded over and outlined once. Drawn finished; tooltips come and go too quickly to watch. */
function TooltipInk({ pen, seed }: { pen: Pen; seed?: string | number }) {
  const id = useId().replace(/[^\w-]/g, "");
  const s = useInkSeed(seed);
  const { ref, w, h, frame } = useInkFrame([120, 30], { pad: 6 });
  const q = pen.roughness ?? 1;
  const r = Math.min(pen.radius === "full" ? h / 2 : (pen.radius ?? 0), h / 2);
  const paths = useMemo(
    () => ({
      body: roundedRectPath(w, h, Math.max(r, 2)),
      shade: shadeFill(s + 3, w, h, { gap: 2.4, angle: -12, overrun: 1 }),
      edge: penBoxStrokes(s, w, h, { roughness: q * 0.7, passes: 1, radius: r })[0],
    }),
    [s, w, h, q, r],
  );
  return (
    <InkSvg ref={ref} {...frame} className="-z-10 text-primary" style={{ ...frame.style, ...penStyle(pen) }}>
      <defs>
        <clipPath id={`${id}-clip`}>
          <path d={paths.body} />
        </clipPath>
      </defs>
      <path d={paths.body} className="ink-fill" />
      <g clipPath={`url(#${id}-clip)`}>
        <Stroke d={paths.shade} width={1.1} opacity={0.8} />
      </g>
      <Stroke d={paths.edge} width={1.3} />
    </InkSvg>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };

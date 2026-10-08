import type { CSSProperties } from "react";
import { atlas, type GlyphName, type ProjectGlyphName } from "@/lib/glyphs";

type Sheet = { cols: number; rows: number; index: Record<string, number> };

function position(sheet: Sheet, name: string): CSSProperties {
  const i = sheet.index[name] ?? 0;
  const col = i % sheet.cols;
  const row = Math.floor(i / sheet.cols);
  return {
    "--gx": sheet.cols > 1 ? `${(col / (sheet.cols - 1)) * 100}%` : "0%",
    "--gy": sheet.rows > 1 ? `${(row / (sheet.rows - 1)) * 100}%` : "0%",
  } as CSSProperties;
}

/**
 * Hand-drawn icon from the ink atlas. The atlas is an alpha mask, so the
 * glyph always takes the current text colour — ink on paper, or pale ink at
 * night — and inherits hover colour changes for free.
 */
export function Glyph({ name, className = "" }: { name: GlyphName; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`glyph ${className}`}
      style={position(atlas.glyphs, name)}
    />
  );
}

export function ProjectGlyph({ name, className = "" }: { name: ProjectGlyphName; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`glyph glyph-projects ${className}`}
      style={position(atlas.projects, name)}
    />
  );
}

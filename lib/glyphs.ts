import atlas from "./ink-atlas.json";

// Names come straight from the generated atlas index, so a typo in content
// is a type error rather than a blank icon.
export type GlyphName = keyof typeof atlas.glyphs.index;
export type ProjectGlyphName = keyof typeof atlas.projects.index;

export { atlas };

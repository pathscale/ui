import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * A layout must import its recipe as a value, not as a type.
 *
 * The generator copies a layout's import line verbatim into
 * `*.generated.tsx` and then emits a *value* use of the recipe:
 *
 *     __defineLayoutComponent({ recipe: componentRecipe, ... })
 *
 * so `import type { componentRecipe }` in the layout produces a generated file
 * that cannot compile - TS1361, "cannot be used as a value because it was
 * imported using 'import type'".
 *
 * This is not hypothetical and it is not cheap. `biome check --write` rewrote
 * 106 layout files to `import type` in one pass, because within the layout
 * itself the symbol genuinely is only used in a `typeof` position and the
 * fixer is right about that file in isolation. Every generated component then
 * failed to typecheck, the release could not build, and the published version
 * stalled two patches behind master. It also self-propagates: `bun run build`
 * regenerates from the damaged sources, so rebuilding reintroduces it.
 *
 * AGENTS.md warns that `bun run lint` rewrites the working tree. This is the
 * check that makes the warning enforceable, because the damage lands in
 * gitignored files where `git status` cannot show it and the only other signal
 * is a red CI run after the merge.
 */

const COMPONENTS = join(import.meta.dir, "..", "..", "src", "components");

function layoutFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...layoutFiles(path));
    else if (entry.endsWith(".layout.tsx")) out.push(path);
  }
  return out;
}

/** Symbols a file imports with a `type` marker, from any form of the syntax. */
function typeImported(source: string): string[] {
  const names: string[] = [];
  for (const match of source.matchAll(/import\s+type\s*\{([^}]+)\}/g)) {
    for (const name of match[1].split(",")) {
      const trimmed = name.trim().split(/\s+as\s+/)[0].trim();
      if (trimmed) names.push(trimmed);
    }
  }
  for (const match of source.matchAll(/import\s*\{([^}]+)\}/g)) {
    for (const name of match[1].split(",")) {
      const inline = name.trim().match(/^type\s+(\S+)/);
      if (inline) names.push(inline[1].split(/\s+as\s+/)[0].trim());
    }
  }
  return names;
}

describe("layout recipe imports survive the generator", () => {
  const files = layoutFiles(COMPONENTS);

  it("finds the layouts it is meant to be checking", () => {
    // A glob that matches nothing would make every assertion below vacuous,
    // which is the failure mode this whole file exists to prevent.
    expect(files.length).toBeGreaterThan(50);
  });

  it("never type-imports a recipe", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const source = readFileSync(file, "utf8");
      for (const name of typeImported(source)) {
        // The generator only ever emits a value use for the recipe symbol,
        // which is whatever this layout passes to `Layout<typeof X, …>`.
        if (!new RegExp(`Layout<\\s*typeof\\s+${name}\\b`).test(source)) continue;
        offenders.push(`${file.slice(COMPONENTS.length + 1)} imports \`${name}\` as a type`);
      }
    }

    expect(offenders).toEqual([]);
  });
});

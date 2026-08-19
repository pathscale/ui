import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * `backdrop-filter` has to be declared *after* its `-webkit-` twin.
 *
 * A minifier that keeps "the last declaration wins" reads the pair as
 * redundant and drops one of them. Declared standard-first it drops the
 * standard property, which is the one every non-WebKit engine reads, so the
 * surface keeps its tint and silently loses its blur.
 *
 * This is not theoretical and it is not cosmetic. The library ships component
 * CSS unminified, so the bug is invisible here; it appears in whichever
 * consumer bundles this CSS through Lightning CSS. Measured in AgencyZero,
 * `[data-material=glass]` arrived in the app bundle with
 * `-webkit-backdrop-filter` and no standard property at all, so every glass
 * component rendered flat under a renderer that implements the standard name.
 *
 * The same mistake in that app's own stylesheet also cost a measured 380 MB
 * and 30 fps, because a rule meant to *disable* a backdrop silently did
 * nothing and each surface kept buying its own full-frame render pass.
 *
 * Cheap to state, impossible to get wrong by accident, so it is asserted for
 * every declaration rather than for the one that happened to break.
 */

const SRC = join(import.meta.dir, "..", "..", "src");

function cssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...cssFiles(path));
    else if (entry.endsWith(".css")) out.push(path);
  }
  return out;
}

/** Declarations of the standard property, with the line they sit on. */
function standardDeclarations(css: string): { at: number; line: number }[] {
  const found: { at: number; line: number }[] = [];
  // `(?<![-\w])` keeps this from matching the `-webkit-` twin itself.
  const pattern = /(?<![-\w])backdrop-filter\s*:/g;
  for (const match of css.matchAll(pattern)) {
    const at = match.index ?? 0;
    const lineStart = css.lastIndexOf("\n", at) + 1;
    const head = css.slice(lineStart, at);
    // `@supports (backdrop-filter: blur(1px))` is a condition, not a
    // declaration, and has no ordering requirement.
    if (head.includes("@supports") || head.trimStart().startsWith("(")) continue;
    found.push({ at, line: css.slice(0, at).split("\n").length });
  }
  return found;
}

describe("backdrop-filter survives minification", () => {
  const files = cssFiles(SRC);

  it("finds the component stylesheets", () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it("never declares the standard property before its -webkit- twin", () => {
    const offenders: string[] = [];

    for (const file of files) {
      const css = readFileSync(file, "utf8");
      for (const { at, line } of standardDeclarations(css)) {
        const blockStart = css.lastIndexOf("{", at);
        const blockEnd = css.indexOf("}", at);
        const before = css.slice(blockStart, at);
        const after = css.slice(at, blockEnd);
        // Correct: the prefixed twin is already declared above this one.
        if (before.includes("-webkit-backdrop-filter")) continue;
        // Wrong: the twin follows, so a minifier keeps the twin and drops this.
        if (after.includes("-webkit-backdrop-filter")) {
          offenders.push(`${file.slice(SRC.length + 1)}:${line}`);
        }
        // Neither: an unprefixed declaration. Nothing for a minifier to
        // collapse, so it is not this test's concern.
      }
    }

    expect(offenders).toEqual([]);
  });
});

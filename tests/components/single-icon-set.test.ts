import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Everything this library draws comes from one Iconify set.
 *
 * A consumer installs icon sets itself -- `@iconify-json/lucide` and so on --
 * so every set the library reaches for is a set the consumer must know to
 * install. Nothing states that requirement, and nothing fails loudly when it
 * is unmet: the build prints `Cannot load icon set for "mdi"` among its
 * warnings and the icon renders as empty space.
 *
 * That is what happened on crates.vip, which installed `lucide` because that
 * is what the fleet uses. Five icons across `LanguageSwitcher`,
 * `ThemeColorPicker`, `MobileListView` and the Firefox banner were `mdi`, and
 * all five were blank. The library itself develops against `@iconify/json`,
 * the whole collection, so it could never see this.
 *
 * The Firefox brand mark was the one icon with no lucide equivalent -- lucide
 * has no brand glyphs. It is a prop now rather than a default, so a consumer
 * who wants it supplies it and pays for the set, and everyone else pays
 * nothing.
 */
const ALLOWED = "lucide";

const SRC = join(import.meta.dir, "../../src");

describe("icons come from one set", () => {
  const files: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const path = join(dir, entry);
      if (statSync(path).isDirectory()) walk(path);
      // Generated twins mirror their layout source, so a finding in one is the
      // same finding in the other.
      else if (/\.(ts|tsx|css)$/.test(entry) && !entry.includes(".generated."))
        files.push(path);
    }
  };
  walk(SRC);

  // `icon-[set--name]` as it is written in a class or an `src`. Prose in a
  // comment is not a reference, so the match has to be anchored to the
  // delimiter a real one carries.
  const references = new Map<string, string[]>();
  for (const file of files) {
    const text = readFileSync(file, "utf8");
    for (const line of text.split("\n")) {
      if (/^\s*(\*|\/\/)/.test(line)) continue;
      for (const match of line.matchAll(/icon-\[([a-z0-9]+)--[a-z0-9-]+\]/g)) {
        const set = match[1];
        if (!references.has(set)) references.set(set, []);
        references.get(set)?.push(file.replace(SRC, "src"));
      }
    }
  }

  it("finds icon references, so a broken walk cannot pass silently", () => {
    expect(references.get(ALLOWED)?.length ?? 0).toBeGreaterThan(10);
  });

  it("uses no set other than the one consumers are told to install", () => {
    const strays = [...references]
      .filter(([set]) => set !== ALLOWED)
      .map(([set, where]) => `${set}: ${[...new Set(where)].join(", ")}`);
    expect(strays).toEqual([]);
  });
});

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { missingRecipeFlagUsages } from "./component-state-contract";
import { componentFamilies } from "../src/component-families";

const COMPONENTS_DIR = "src/components";
const CONTRIBUTING = "CONTRIBUTING.md";

// Directories that are not components (utilities, types, shared files)
const SKIP = new Set([
  "types.ts",
  "utils.tsx",
  "showcase",
  "showcase-section",
  "props-table",
  "icon",
  "form",
  // Not components, and never were: `_shared` is helper modules and CSS
  // (`controlledState.ts`, `overlayPosition.ts`), `status` is a plain
  // `status.ts`. They surfaced only once the source lookup started reporting a
  // missing component instead of skipping silently.
  "_shared",
  "status",
]);

function toPascalCase(kebab: string): string {
  return kebab.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
}

type Violation = { component: string; rule: string; detail: string; section: string };

const violations: Violation[] = [];

const layoutLibrary = JSON.parse(readFileSync("layouts.library.json", "utf8")) as {
  exports?: string[];
};
const layoutExports = new Set(layoutLibrary.exports ?? []);
for (const family of componentFamilies) {
  if (!layoutExports.has(family.name)) {
    fail(
      family.id,
      "layouts-manifest",
      `${family.name} is public but absent from layouts.library.json exports`,
      "Structure",
    );
  }
}

function fail(component: string, rule: string, detail: string, section: string) {
  violations.push({ component, rule, detail, section });
}

const entries = readdirSync(COMPONENTS_DIR, { withFileTypes: true });

for (const entry of entries) {
  if (!entry.isDirectory()) continue;
  if (SKIP.has(entry.name)) continue;

  const dir = entry.name;
  const pascal = toPascalCase(dir);
  const componentDir = join(COMPONENTS_DIR, dir);

  // Every state flag declared by a recipe must be consumed by both the
  // authored layout and its generated artifact. A flag that exists only in
  // the recipe or stylesheet creates two competing component contracts: CSS
  // waits for a class the component can never apply. InlineEdit shipped in
  // exactly that state, leaving its editing rules unreachable.
  const recipeFiles = readdirSync(componentDir).filter((file) =>
    file.endsWith(".recipe.ts"),
  );
  const componentFiles = readdirSync(componentDir);
  const authoredLayouts = componentFiles
    .filter((file) => file.endsWith(".layout.tsx"))
    .map((file) => readFileSync(join(componentDir, file), "utf8"))
    .join("\n");
  const generatedLayouts = componentFiles
    .filter((file) => file.endsWith(".generated.tsx"))
    .map((file) => readFileSync(join(componentDir, file), "utf8"))
    .join("\n");
  for (const recipeFile of recipeFiles) {
    const recipeSource = readFileSync(join(componentDir, recipeFile), "utf8");
    for (const key of missingRecipeFlagUsages(recipeSource, authoredLayouts)) {
      fail(
        dir,
        "state-contract",
        `recipe flag ${key} is never consumed by an authored layout`,
        "Code Style",
      );
    }
    for (const key of missingRecipeFlagUsages(recipeSource, generatedLayouts)) {
      fail(
        dir,
        "state-contract",
        `recipe flag ${key} is missing from generated output`,
        "Code Style",
      );
    }
  }

  // --- Structure rules ---

  // Must have index.ts
  const indexPath = join(componentDir, "index.ts");
  if (!existsSync(indexPath)) {
    fail(dir, "structure", "missing index.ts barrel export", "Structure");
    continue;
  }

  /*
   * Every authored source in the directory, not one file named after it.
   *
   * This looked only for `PascalCase.tsx` and `continue`d when it was missing.
   * After the layout migration that file exists for none of the components, so
   * every source-level rule below was skipped for all 93 of them -- and the run
   * still printed "All 95 components pass contract checks". A check that cannot
   * fail is worse than no check, because it is reported as coverage.
   *
   * Naming the file after its directory was also wrong on its own terms:
   * `live-chat` holds `LiveChatBubble` and `LiveChatPanel`, `table` holds
   * `ExpandToggle` and `InlineConfirm`. Those were never going to be found, and
   * their siblings were never checked either. Checking every `*.layout.tsx`
   * covers them and widens the rest.
   */
  const sourcePaths = componentFiles
    .filter(
      (file) =>
        file.endsWith(".layout.tsx") ||
        (file === `${pascal}.tsx` && !file.endsWith(".generated.tsx")),
    )
    .map((file) => join(componentDir, file));

  if (sourcePaths.length === 0) {
    fail(dir, "structure", "no authored component source to check", "Structure");
    continue;
  }

  for (const mainPath of sourcePaths) {
    checkSource(dir, mainPath);
  }

  // Barrel rules are per directory, not per source: a component with two
  // authored files has one `index.ts`, and reporting it twice is noise.
  const index = readFileSync(indexPath, "utf8");
  if (!index.includes("type ")) {
    fail(dir, "structure", "index.ts must export the component's Props type", "Structure");
  }
}

function checkSource(dir: string, mainPath: string) {
  const source = readFileSync(mainPath, "utf8");

  // --- Props rules ---

  /*
   * A compiled layout does both of these for you.
   *
   * `{...slot.root}` is the layout compiler's output: it assembles the recipe's
   * classes and merges `class`, and `local` is the prop split. So a component
   * built that way needs neither `omit()` nor `twMerge()`, and demanding them
   * would be asking for hand-written plumbing back inside a compiled component.
   *
   * These two rules predate the layout migration, and once the file lookup
   * above started finding `.layout.tsx` they failed 34 times across 22
   * components that are all correct. The rules were stale, not the components
   * -- which is only visible because the check began running at all.
   */
  const usesLayoutSlots = /\{\.\.\.slot[.[]/.test(source);

  /*
   * Only components that actually accept pass-through need to separate it.
   *
   * The rule says "separate component props from HTML pass-through", so it only
   * has meaning when there is pass-through: a closed prop set has nothing to
   * split. `Slider` and `ColorWheelFlower` extend no `JSX.*Attributes` and
   * spread nothing onto an element, and both were failing a rule that did not
   * apply to them.
   */
  const acceptsPassThrough =
    /JSX\.\w*(HTML|SVG)\w*Attributes/.test(source) ||
    /\{\.\.\.(others|rest)\}/.test(source);

  if (
    acceptsPassThrough &&
    !usesLayoutSlots &&
    !source.includes("splitProps") &&
    !source.includes("omit(")
  ) {
    fail(dir, "props", "must use omit() or splitProps() to separate component props from HTML pass-through", "Props");
  }

  if (!usesLayoutSlots && !source.includes("twMerge")) {
    fail(dir, "props", "must use twMerge() for class merging", "Props");
  }

  // --- Code style rules ---

  // No inline style={{}} with static values that could be Tailwind classes
  // Dynamic values (template literals, variables, expressions) are OK
  const lines = source.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.includes("style={{")) continue;
    // Grab the style block (may span multiple lines)
    const from = i;
    let block = "";
    for (let j = from; j < Math.min(from + 5, lines.length); j++) {
      block += lines[j];
      if (block.includes("}}")) break;
    }
    /*
     * Skip anything dynamic: template literals, calls, ternaries, spreads --
     * and property access, which this missed.
     *
     * `style={{ "border-color": item.hex }}` is as dynamic as a call, but
     * matched none of the patterns, so ColorWheelFlower was told to replace a
     * runtime colour with a Tailwind class. There is no such class; the value
     * is a swatch's own hex.
     */
    if (/\$\{|`|\.\.\.|[a-z]+\(|[?]|\w+\.\w+/i.test(block)) continue;
    // Only flag purely static style objects
    fail(dir, "code-style", `static inline style={{}} could be a Tailwind class (line ~${from + 1})`, "Code Style");
  }

}

const tabsLayout = readFileSync(join(COMPONENTS_DIR, "tabs", "Tabs.layout.tsx"), "utf8");
const tabsGenerated = readFileSync(join(COMPONENTS_DIR, "tabs", "Tabs.generated.tsx"), "utf8");
const tabsMeasurement = readFileSync(
  join(COMPONENTS_DIR, "tabs", "Tabs.measurement.ts"),
  "utf8",
);
if (
  !tabsLayout.includes("observeTabIndicator(") ||
  !tabsGenerated.includes("observeTabIndicator(") ||
  !tabsMeasurement.includes('typeof ResizeObserver === "undefined"')
) {
  fail(
    "tabs",
    "runtime-compatibility",
    "ResizeObserver must remain optional in authored and generated Tabs",
    "Runtime compatibility",
  );
}

// --- Stale generated output ---
//
// `*.generated.tsx` is gitignored and written by `layouts:generate`, which only
// ever adds. Deleting a component therefore leaves its generated file behind,
// still importing the `.recipe` and `.layout` that went with it, and every
// build from then on fails inside a file nobody can see in `git status`.
//
// That is exactly how 2.5.0 shipped: twenty-two deleted components left
// twenty-two orphans, `bun run check` reported them as "missing index.ts
// barrel export" for components that no longer exist, and `bun run build` died
// generating declarations. Caught here it names the real problem and the fix.
for (const entry of readdirSync(COMPONENTS_DIR, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const dir = join(COMPONENTS_DIR, entry.name);
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".generated.tsx")) continue;
    const authored = join(dir, file.replace(/\.generated\.tsx$/, ".layout.tsx"));
    if (existsSync(authored)) continue;
    fail(
      entry.name,
      "stale-generated",
      `${join(dir, file)} has no .layout.tsx source; delete it (it is gitignored build output from a component that was removed)`,
      "Structure",
    );
  }
}

// --- Report ---

if (violations.length === 0) {
  console.log(`\u2705 All ${entries.filter((e) => e.isDirectory() && !SKIP.has(e.name)).length} components pass contract checks.`);
  process.exit(0);
} else {
  console.log(`\u274c ${violations.length} contract violation(s) found:\n`);
  for (const v of violations) {
    console.log(`  ${v.component} [${v.rule}]: ${v.detail}`);
    console.log(`    \u2192 See ${CONTRIBUTING} > Component Checklist > ${v.section}\n`);
  }
  process.exit(1);
}

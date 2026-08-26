import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { missingRecipeFlagUsages } from "./component-state-contract";

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
]);

function toPascalCase(kebab: string): string {
  return kebab.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
}

type Violation = { component: string; rule: string; detail: string; section: string };

const violations: Violation[] = [];

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

  // Find the main source file (PascalCase.tsx)
  const mainFile = `${pascal}.tsx`;
  const mainPath = join(componentDir, mainFile);
  if (!existsSync(mainPath)) {
    // Some components may use a different casing or have multiple files
    // Skip source-level checks but still check index.ts
    continue;
  }

  const source = readFileSync(mainPath, "utf8");
  const index = readFileSync(indexPath, "utf8");

  // --- Props rules ---

  // Solid 2 replaced splitProps with omit; both separate component props from
  // the attributes deliberately passed through to the rendered element.
  if (!source.includes("splitProps") && !source.includes("omit(")) {
    fail(dir, "props", "must use omit() or splitProps() to separate component props from HTML pass-through", "Props");
  }

  // Must use twMerge for class merging
  if (!source.includes("twMerge")) {
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
    // Skip if it contains dynamic values (template literals, function calls, ternaries, spread)
    if (/\$\{|`|\.\.\.|[a-z]+\(|[?]/.test(block)) continue;
    // Only flag purely static style objects
    fail(dir, "code-style", `static inline style={{}} could be a Tailwind class (line ~${from + 1})`, "Code Style");
  }

  // --- Barrel export rules ---

  // index.ts must export a type (props type)
  if (!index.includes("type ")) {
    fail(dir, "structure", "index.ts must export the component's Props type", "Structure");
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

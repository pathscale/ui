import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

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

  // Must use splitProps
  if (!source.includes("splitProps")) {
    fail(dir, "props", "must use splitProps to separate component props from HTML pass-through", "Props");
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

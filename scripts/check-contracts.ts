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
  "form",
]);

function toPascalCase(kebab: string): string {
  return kebab.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
}

/**
 * Comments describe patterns, including the ones these rules ban. Scanning them
 * makes documenting a mistake indistinguishable from making it.
 */
function stripComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
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

  // Both spellings: `.recipe.ts` is where a ported component declares its
  // design vocabulary, `.classes.ts` is where an unported one still does.
  const classesSource = [
    join(componentDir, `${pascal}.recipe.ts`),
    join(componentDir, `${pascal}.classes.ts`),
  ]
    .filter((path) => existsSync(path))
    .map((path) => readFileSync(path, "utf8"))
    .join("\n");

  const layoutPath = join(componentDir, `${pascal}.layout.tsx`);
  const hasLayout = existsSync(layoutPath);

  // --- Props rules ---

  // Must separate component props from HTML pass-through. `splitBase` is the
  // shared form of the same call.
  // A component built by `defineComponent` does no prop splitting of its own:
  // the runtime does it, from the recipe. Demanding `splitProps` here would
  // require every ported component to keep a call it no longer needs.
  const splitsProps =
    source.includes("splitProps") ||
    source.includes("splitBase") ||
    source.includes("defineComponent(");
  if (!splitsProps) {
    fail(dir, "props", "must use splitProps/splitBase to separate component props from HTML pass-through", "Props");
  }

  // Class composition must go through one of the approved paths. `twMerge` is
  // the original one and is still correct for components that emit Tailwind;
  // a `recipe()` in the component's own .classes.ts is the newer one and is
  // preferred, because it picks the right merge strategy itself instead of
  // making every call site pay for Tailwind parsing it does not need.
  const composesClasses =
    source.includes("twMerge") ||
    classesSource.includes("recipe(") ||
    source.includes("defineComponent(") ||
    source.includes("cx(");
  if (!composesClasses) {
    fail(dir, "props", "must compose classes via recipe() in its .classes.ts, or twMerge() for Tailwind-emitting components", "Props");
  }

  // --- Layer separation rules ---

  if (hasLayout) {
    const layout = readFileSync(layoutPath, "utf8");

    // A layout file is markup. State belongs in the hook file, or the split
    // has bought nothing: logic that leaks back into the layout is exactly the
    // interleaving this structure exists to prevent.
    const STATE_PRIMITIVES = [
      "createSignal",
      "createEffect",
      "createMemo",
      "createStore",
      "createResource",
      "onMount",
    ];
    const leaked = STATE_PRIMITIVES.filter((p) => layout.includes(`${p}(`));
    if (leaked.length) {
      fail(dir, "layering", `${pascal}.layout.tsx must contain markup only, found: ${leaked.join(", ")}`, "Layering");
    }

    // Hooks must be called in the component body and the result passed down.
    // Called in a JSX prop position the call runs under the child's reactive
    // scope, and anything the model reads later from an event handler has lost
    // its owner. This matches `model={createFoo(props)}` / `form={useBar()}`.
    const inJsx = stripComments(source).match(/=\{\s*(create|use)[A-Z]\w*\(/);
    if (inJsx) {
      fail(dir, "layering", `hook called in a JSX prop position ("${inJsx[0].trim()}…"); assign it in the component body and pass the result`, "Layering");
    }
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

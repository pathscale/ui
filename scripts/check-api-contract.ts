/**
 * Fail the build when `docs/api-contract.md` and the shipped types disagree.
 *
 * The point is that the document is **not** generated on every run. The 2.2
 * effort already had a doc produced from `dist/` on demand, and it was useless:
 * because it derived its target from whatever was currently built, it read the
 * same before and after a component was ported and could never disagree with
 * the code it described. A rename stayed invisible for a day behind it.
 *
 * So this reverses the direction. `docs/api-contract.md` is committed, edited by
 * a person, and treated as the assertion. This script only ever compares. It
 * reports drift in **both** directions, because one direction alone is a way to
 * be wrong quietly:
 *
 *   - a component or prop the document promises and the build does not export
 *     is a broken promise to a consumer reading the docs
 *   - a component or prop the build exports and the document does not mention
 *     is API that shipped without anyone writing down that it should exist
 *
 * `--write` rewrites the document from the build and prints what changed. It
 * exists so that a deliberate API change is one command rather than an hour of
 * hand-editing, and it must never run in CI, or the check degrades back into
 * the generated doc that started all this.
 *
 *   bun run scripts/check-api-contract.ts            # verify, exit 1 on drift
 *   bun run scripts/check-api-contract.ts --write    # accept the current API
 */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const DOC = "docs/api-contract.md";
const WRITE = process.argv.includes("--write");

type Api = Map<string, string[]>; // component -> sorted prop names

/* -------------------------------------------------------------------------------------------------
 * Read the API the build actually ships
 * -----------------------------------------------------------------------------------------------*/

/** Names the root barrel and the lab barrel export, which is the public surface. */
const aliasOf = new Map<string, string>();

function exportedComponents(): Set<string> {
  const out = new Set<string>();
  for (const entry of ["index.d.ts", "lab.d.ts"]) {
    const file = join(DIST, entry);
    if (!existsSync(file)) continue;
    const text = readFileSync(file, "utf8");
    /*
     * `export type { … }` blocks are skipped entirely. A union like
     * CalendarSelectionMode is PascalCase and does not end in Props, so it
     * looked like a component and contributed an entry that could never have
     * any. A component is exported as a value.
     */
    for (const block of text.matchAll(/export(\s+type)?\s*\{([^}]*)\}/g)) {
      if (block[1]) continue;
      for (const part of block[2].split(",")) {
        if (/^\s*type\s/.test(part)) continue;
        const name = part.trim().split(/\s+as\s+/).pop()?.trim();
        /*
         * Components are PascalCase. Hooks and helpers are camelCase, and the
         * vocabulary's frozen arrays and the toast defaults are SCREAMING_CASE,
         * so both are excluded: a constant has no props and listing one here
         * would put 15 permanently empty entries in the contract.
         */
        if (!name || name.endsWith("Props")) continue;
        if (!/^[A-Z]/.test(name)) continue;
        if (/^[A-Z0-9_]+$/.test(name)) continue;
        // A Solid context is a value and PascalCase but has no props.
        if (name.endsWith("Context")) continue;
        out.add(name);
        /*
         * `SortIcon as TableSortIcon` publishes under the alias while every
         * type in the source is still named for the original, so record the
         * original as the place to look.
         */
        const parts = part.trim().split(/\s+as\s+/);
        if (parts.length === 2) aliasOf.set(name, parts[0].trim());
      }
    }
  }
  return out;
}

/**
 * `export type XProps = … { a?: T; b?: U }`, braces balanced, comments ignored.
 *
 * Follows one level of aliasing: several components export `XProps` as an alias
 * for `XRootProps`, and reading only the alias yields an empty prop list, which
 * would have recorded 98 components as having no API at all.
 */
function propsOf(text: string, typeName: string, alias = 0): string[] | null {
  let start = text.indexOf(`export type ${typeName} =`);
  let from = start === -1 ? -1 : text.indexOf("=", start) + 1;
  if (start === -1) {
    // `interface X extends Y { … }` and the non-exported `type X = …` form.
    const decl = new RegExp(`(?:export\\s+)?(?:interface|type)\\s+${typeName}\\b`).exec(text);
    if (!decl) return null;
    start = decl.index;
    from = decl.index + decl[0].length;
  }
  let i = from;
  let depth = 0;
  let body = "";
  for (; i < text.length; i++) {
    const ch = text[i];
    if (ch === "{") depth++;
    if (depth > 0) body += ch;
    if (ch === "}") {
      depth--;
      if (depth === 0) break;
    }
    if (depth === 0 && ch === ";") break;
  }
  if (!body) {
    if (alias > 2) return [];
    const aliased = new RegExp(`export type ${typeName} =\\s*([A-Za-z_$][\\w$]*)\\s*;`).exec(text);
    return aliased ? propsOf(text, aliased[1], alias + 1) : [];
  }
  const stripped = body.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
  const names = new Set<string>();
  for (const m of stripped.matchAll(/(?:^|[{;\n])\s*(?:readonly\s+)?["']?([A-Za-z_$][\w$-]*)["']?\??\s*:/g)) {
    names.add(m[1]);
  }
  return [...names].sort();
}

function walk(dir: string, out: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

function readBuiltApi(): Api {
  if (!existsSync(DIST)) {
    console.error(`${DIST} not found. Run \`bun run build\` first.`);
    process.exit(1);
  }
  const exported = exportedComponents();
  const files = walk(DIST).map((f) => readFileSync(f, "utf8"));
  const api: Api = new Map();
  // A class is a value and PascalCase, but ToastQueue is a queue, not a component.
  const isClass = (n: string) => files.some((t) => new RegExp(`declare class ${n}\\b`).test(t));
  for (const name of [...exported].sort()) {
    if (isClass(name)) continue;
    /*
     * The naming is not uniform. Most components export <Name>Props, but any
     * component whose layout is called <Name>Root exports <Name>RootProps and
     * re-exports the value as <Name>, so looking only for <Name>Props recorded
     * them as having no API at all.
     */
    let props: string[] | null = null;
    let found = false;
    /*
     * The declaration names its own props type: `declare const CardBodyLayout:
     * __LayoutComponent<CardSectionProps>`. Guessing from the component name
     * misses every part that shares a type with its siblings, so ask the
     * declaration first and fall back to the naming conventions after.
     */
    const declared = new Set<string>();
    for (const lookup of [name, aliasOf.get(name)].filter(Boolean) as string[])
    for (const text of files) {
      for (const re of [
        new RegExp(`declare const ${lookup}(?:Layout)?\\s*:\\s*__LayoutComponent<\\s*([A-Za-z_$][\\w$]*)`, "g"),
        new RegExp(`declare const ${lookup}(?:Layout)?\\s*:\\s*Component<\\s*([A-Za-z_$][\\w$]*)`, "g"),
      ]) {
        for (const m of text.matchAll(re)) declared.add(m[1]);
      }
    }
    const origin = aliasOf.get(name);
    const candidates = [...declared, `${name}Props`, `${name}RootProps`, `${name}LayoutProps`];
    if (origin) candidates.push(`${origin}Props`, `${origin}RootProps`);
    for (const candidate of candidates) {
      for (const text of files) {
        const r = propsOf(text, candidate);
        if (r === null) continue;
        found = true;
        props = r;
        if (r.length) break;
      }
      if (props && props.length) break;
    }
    /*
     * A component whose props are exactly HTML attributes plus UIBaseProps has
     * an empty list, and that is a fact worth recording. A component whose
     * props type cannot be found at all is a different thing entirely, and
     * conflating the two is how a doc ends up asserting nothing while looking
     * complete. The second is marked so it is visible rather than silent.
     */
    api.set(name, found ? (props ?? []) : ["<props type not found>"]);
  }
  return api;
}

/* -------------------------------------------------------------------------------------------------
 * Read the API the document promises
 * -----------------------------------------------------------------------------------------------*/

function readDocumentedApi(): Api {
  if (!existsSync(DOC)) return new Map();
  const api: Api = new Map();
  let current: string | null = null;
  for (const line of readFileSync(DOC, "utf8").split("\n")) {
    const heading = /^###\s+(\S+)/.exec(line);
    if (heading) {
      current = heading[1];
      api.set(current, []);
      continue;
    }
    const props = /^`([^`]*)`$/.exec(line.trim());
    if (current && props) {
      api.set(
        current,
        props[1]
          .split(/\s+/)
          .map((p) => p.trim())
          .filter(Boolean)
          .sort(),
      );
      current = null;
    }
  }
  return api;
}

/* -------------------------------------------------------------------------------------------------
 * Compare, or write
 * -----------------------------------------------------------------------------------------------*/

function render(api: Api): string {
  const lines = [
    "# API contract",
    "",
    "**Committed, hand-edited, and enforced.** `bun run check:api` fails the build",
    "when this file and the shipped types disagree, in either direction: a promise",
    "the build does not keep, or API that shipped without being written down.",
    "",
    "It is deliberately not regenerated on every build. A document derived from the",
    "code cannot disagree with the code, which is how eleven component renames stayed",
    "invisible for a day behind a doc that looked correct the whole time.",
    "",
    "When an API change is intentional, run `bun run check:api -- --write`, read the",
    "diff, and commit it. The diff is the review.",
    "",
    `${api.size} components. An empty list means the component adds nothing beyond`,
    "HTML attributes and `UIBaseProps`; that is an assertion, not a gap.",
    "",
    "---",
    "",
  ];
  for (const [name, props] of [...api].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`### ${name}`, "", `\`${props.join(" ")}\``, "");
  }
  return lines.join("\n");
}

const built = readBuiltApi();

if (WRITE) {
  const before = readDocumentedApi();
  writeFileSync(DOC, render(built));
  let changed = 0;
  for (const [name, props] of built) {
    const was = before.get(name);
    if (!was) {
      console.log(`+ ${name}`);
      changed++;
    } else if (was.join(" ") !== props.join(" ")) {
      const added = props.filter((p) => !was.includes(p));
      const removed = was.filter((p) => !props.includes(p));
      console.log(`~ ${name}${added.length ? `  +${added.join(" +")}` : ""}${removed.length ? `  -${removed.join(" -")}` : ""}`);
      changed++;
    }
  }
  for (const name of before.keys()) {
    if (!built.has(name)) {
      console.log(`- ${name}`);
      changed++;
    }
  }
  console.log(changed ? `\n${DOC} updated, ${changed} change(s). Read the diff before committing.` : `\n${DOC} was already current.`);
  process.exit(0);
}

const documented = readDocumentedApi();
if (documented.size === 0) {
  console.error(`${DOC} is missing or empty. Bootstrap it with:\n  bun run check:api -- --write`);
  process.exit(1);
}

const problems: string[] = [];

for (const [name, props] of built) {
  const promised = documented.get(name);
  if (!promised) {
    problems.push(`undocumented component: ${name} is exported but ${DOC} does not mention it`);
    continue;
  }
  const missing = props.filter((p) => !promised.includes(p));
  const extra = promised.filter((p) => !props.includes(p));
  for (const p of missing) problems.push(`undocumented prop: ${name}.${p} ships but is not in ${DOC}`);
  for (const p of extra) problems.push(`broken promise: ${DOC} lists ${name}.${p}, which the build does not export`);
}

for (const name of documented.keys()) {
  if (!built.has(name)) problems.push(`broken promise: ${DOC} documents ${name}, which the build does not export`);
}

if (problems.length) {
  console.error(`\n✖ API contract drift, ${problems.length} problem(s):\n`);
  for (const p of problems.slice(0, 40)) console.error(`  ${p}`);
  if (problems.length > 40) console.error(`  … and ${problems.length - 40} more`);
  console.error(`\nIf the change is intentional: bun run check:api -- --write, then commit the diff.\n`);
  process.exit(1);
}

console.log(`✅ ${DOC} matches the build across ${built.size} components.`);

/**
 * Generate the complete component reference from the built type declarations.
 *
 * Hand-written catalogues drift the moment a prop changes. This reads
 * `dist/**\/*.d.ts` after a build, so the reference is true by construction and
 * regenerates in CI. It is also the source for the js.software home page.
 *
 *   bun run scripts/generate-component-reference.ts
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const OUT = "docs/component-reference.md";

type Entry = {
  name: string;
  dir: string;
  surface: "main" | "lab";
  props: string | null;
  parts: string[];
};

/** Which entry point exports a name. */
function exportedNames(file: string): Set<string> {
  const out = new Set<string>();
  if (!existsSync(file)) return out;
  const text = readFileSync(file, "utf8");
  for (const block of text.matchAll(/export \{([^}]*)\}/g)) {
    for (const part of block[1].split(",")) {
      const trimmed = part.trim();
      if (!trimmed || trimmed.startsWith("type ")) continue;
      const name = trimmed.split(" as ").pop()!.trim();
      if (/^[A-Z]/.test(name)) out.add(name);
    }
  }
  return out;
}

/** Pull `export type XProps = ...;` out of a declaration file, braces balanced. */
function extractProps(text: string, typeName: string): string | null {
  const start = text.indexOf(`export type ${typeName} =`);
  if (start === -1) return null;
  let i = text.indexOf("=", start) + 1;
  let depth = 0;
  let end = -1;
  for (; i < text.length; i += 1) {
    const c = text[i];
    if (c === "{") depth += 1;
    else if (c === "}") depth -= 1;
    else if (c === ";" && depth === 0) {
      end = i;
      break;
    }
  }
  if (end === -1) return null;
  return text
    .slice(text.indexOf("=", start) + 1, end)
    .trim()
    .replace(/\n {4}/g, "\n  ");
}

const main = exportedNames(join(DIST, "index.d.ts"));
const lab = exportedNames(join(DIST, "lab.d.ts"));

/** Component directories, including ones nested inside another component. */
function componentDirs(root: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const d of readdirSync(join(DIST, "components", root), { withFileTypes: true })) {
    if (!d.isDirectory() || d.name === "_shared") continue;
    const rel = prefix ? `${prefix}/${d.name}` : d.name;
    out.push(rel);
    // one level of nesting: immersive-landing/components/CookieConsent and friends
    const nested = join(DIST, "components", rel, "components");
    if (existsSync(nested)) {
      for (const n of readdirSync(nested, { withFileTypes: true })) {
        if (n.isDirectory()) out.push(`${rel}/components/${n.name}`);
      }
    }
  }
  return out.sort();
}
const dirs = componentDirs("");

const pascal = (d: string) =>
  (d.split("/").pop() ?? d)
    .split("-")
    .map((p) => p[0].toUpperCase() + p.slice(1))
    .join("")
    .replace("Otp", "OTP")
    .replace("Chatbubble", "ChatBubble");

const entries: Entry[] = [];

for (const dir of dirs) {
  const componentDir = join(DIST, "components", dir);
  const files = readdirSync(componentDir).filter((f) => f.endsWith(".d.ts"));
  const text = files.map((f) => readFileSync(join(componentDir, f), "utf8")).join("\n");

  // every exported *Props type in this directory
  const propTypes = [...text.matchAll(/export type (\w+Props) =/g)].map((m) => m[1]);
  const base = pascal(dir);
  const primary =
    propTypes.find((p) => p === `${base}Props`) ??
    propTypes.find((p) => p.endsWith("RootProps")) ??
    propTypes[0];

  const name = [...main, ...lab].find((n) => n === base) ?? base;
  entries.push({
    name,
    dir,
    surface: lab.has(name) ? "lab" : "main",
    props: primary ? extractProps(text, primary) : null,
    parts: [...main, ...lab].filter((n) => n !== name && n.startsWith(name)).sort(),
  });
}

const mainEntries = entries.filter((e) => e.surface === "main");
const labEntries = entries.filter((e) => e.surface === "lab");

const lines: string[] = [];
lines.push("# UI/ — built by design & utility");
lines.push("");
lines.push(
  "The complete component reference for `@pathscale/ui`. Generated from the built type declarations by `scripts/generate-component-reference.ts`, so it cannot drift from what ships.",
);
lines.push("");
lines.push(`**${mainEntries.length} components** on the main surface · **${labEntries.length}** in \`@pathscale/ui/lab\``);
lines.push("");
lines.push("---");
lines.push("");
lines.push("## The three axes");
lines.push("");
lines.push("Every component is built from these. They mean the same thing everywhere.");
lines.push("");
lines.push("| Axis | Answers | Values | |");
lines.push("| --- | --- | --- | --- |");
lines.push("| `variant` | what shape | `solid` `soft` `outline` `ghost` `plain` | closed |");
lines.push(
  "| `flavor` | what it *is* | `neutral` `primary` `secondary` `accent` `destructive` `success` `warning` `info` … | **open** |",
);
lines.push("| `state` | what is happening *now* | `default` `loading` `disabled` `invalid` `hidden` | closed |");
lines.push("");
lines.push("```tsx");
lines.push("<Button>                                       // solid, primary — the call to action");
lines.push("<Button variant=\"ghost\" size=\"icon\">           // chrome");
lines.push("<Button flavor=\"destructive\" state=\"loading\">  // both, no conflict");
lines.push("<Button flavor=\"hip\">                          // theme-defined, no library change");
lines.push("```");
lines.push("");
lines.push(
  "`flavor` is permanent and open — a theme adds one by styling `[data-flavor=\"hip\"]`. `state` is transient and closed, because which conditions a component can be in is the library's to define.",
);
lines.push("");
lines.push("---");
lines.push("");

function render(list: Entry[], heading: string) {
  lines.push(`## ${heading}`);
  lines.push("");
  for (const e of list) {
    lines.push(`### ${e.name}`);
    lines.push("");
    if (e.parts.length) {
      lines.push(`Parts: ${e.parts.map((p) => `\`${p}\``).join(" · ")}`);
      lines.push("");
    }
    if (e.props) {
      lines.push("```ts");
      lines.push(`type ${e.name}Props = ${e.props};`);
      lines.push("```");
    } else {
      lines.push("_No exported props type._");
    }
    lines.push("");
  }
}

// Components that live as loose files inside another component's folder.
const seen = new Set(entries.flatMap((e) => [e.name, ...e.parts]));
for (const [surface, names] of [["main", main], ["lab", lab]] as const) {
  for (const name of [...names].sort()) {
    if (seen.has(name)) continue;
    if (/^[A-Z0-9_]+$/.test(name)) continue; // a constant, not a component
    // find the declaration that owns it
    let props: string | null = null;
    const stack = [join(DIST, "components")];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const d of readdirSync(cur, { withFileTypes: true })) {
        const full = join(cur, d.name);
        if (d.isDirectory()) stack.push(full);
        else if (d.name.endsWith(".d.ts")) {
          const t = readFileSync(full, "utf8");
          if (t.includes(`export type ${name}Props`)) props = extractProps(t, `${name}Props`);
        }
      }
    }
    entries.push({ name, dir: "", surface, props, parts: [] });
    seen.add(name);
  }
}

const mainFinal = entries.filter((e) => e.surface === "main").sort((a, b) => a.name.localeCompare(b.name));
const labFinal = entries.filter((e) => e.surface === "lab").sort((a, b) => a.name.localeCompare(b.name));
lines[4] = `**${mainFinal.length} components** on the main surface · **${labFinal.length}** in \`@pathscale/ui/lab\``;

render(mainFinal, "Components");
lines.push("---");
lines.push("");
render(labFinal, "`@pathscale/ui/lab`");

writeFileSync(OUT, lines.join("\n"));
console.log(`wrote ${OUT}: ${mainEntries.length} main + ${labEntries.length} lab`);

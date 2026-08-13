/**
 * Generate the **proposed** 2.2 interface for every component.
 *
 * `generate-component-reference.ts` documents what ships today. This one takes
 * each real current interface and applies the 2.2 transformation rules to it,
 * so the result is grounded in the actual props rather than invented, covers
 * every component rather than the handful already ported, and doubles as the
 * executable spec for the codemod.
 *
 *   bun run scripts/generate-proposed-reference.ts
 */
import { readFileSync, readdirSync, existsSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist";
const OUT = "docs/proposed-2.2-reference.md";

/** Component renames taken from the industry (see UI-2.2-INDUSTRY-SURVEY.md). */
const RENAMES: Record<string, string> = {
  Callout: "Alert",
  Toggle: "Switch",
  Modal: "Dialog",
  TextArea: "Textarea",
  Disclosure: "Collapsible",
  EmptyState: "Empty",
  ProgressBar: "Progress",
  ProgressCircle: "RadialProgress",
  ScrollShadow: "ScrollArea",
  Breadcrumbs: "Breadcrumb",
  FloatingDock: "Dock",
};

/** Prop-level rewrites, applied in order. Each is also a codemod rule. */
const RULES: Array<[RegExp, string, string]> = [
  [/\bIComponentBaseProps\b/g, "UIBaseProps", "base props renamed"],
  [/^\s*className\?: string;\s*$/gm, "", "className deleted — 7 sites against 302 for class"],
  [/^(\s*)(?:color|tone)\?: \w+;/gm, "$1flavor?: Flavor;", "color/tone → flavor"],
  [/^(\s*)variant\?: \w*Variant;/gm, "$1variant?: Variant;", "variant → the shared union"],
  [/^(\s*)size\?: \w*Size;/gm, "$1size?: Size;", "size → the shared scale"],
  [/^(\s*)isDisabled\?: boolean;/gm, "$1state?: State;", "isDisabled → state"],
  [/^\s*(?:isLoading|isPending|isSubmitting|isSending|isInvalid)\?: boolean;\s*$/gm, "", "folded into state"],
  [/^\s*disabled\?: boolean;\s*$/gm, "", "folded into state"],
  [/^(\s*)isRequired\?: boolean;/gm, "$1required?: boolean;", "native HTML attribute"],
  [/^(\s*)isReadOnly\?: boolean;/gm, "$1readonly?: boolean;", "native HTML attribute"],
  [/^(\s*)isOpen\?: boolean;/gm, "$1open?: boolean;\n$1defaultOpen?: boolean;\n$1onOpenChange?: (open: boolean) => void;", "controlled triple"],
  [/^\s*isIconOnly\?: boolean;\s*$/gm, "", "→ size=\"icon\""],
  [/^(\s*)leftIcon\?:/gm, "$1startIcon?:", "startIcon/endIcon"],
  [/^(\s*)rightIcon\?:/gm, "$1endIcon?:", "startIcon/endIcon"],
  [/^(\s*)checked\?: boolean;/gm, "$1value?: boolean;\n$1defaultValue?: boolean;", "controlled triple"],
  [/^\s*defaultChecked\?: boolean;\s*$/gm, "", "folded into defaultValue"],
  [/^\s*isFocused\?: boolean;\s*$/gm, "", "that is :focus, never a prop"],
  [/^\s*fullWidth\?: boolean;\s*$/gm, "  width?: Width;", "→ width"],
  [/^\s*dataTheme\?: string;\s*$/gm, "", "carried by UIBaseProps"],
];

function exportedNames(file: string): Set<string> {
  const out = new Set<string>();
  if (!existsSync(file)) return out;
  for (const block of readFileSync(file, "utf8").matchAll(/export \{([^}]*)\}/g)) {
    for (const part of block[1].split(",")) {
      const t = part.trim();
      if (!t || t.startsWith("type ")) continue;
      const n = t.split(" as ").pop()!.trim();
      if (/^[A-Z]/.test(n)) out.add(n);
    }
  }
  return out;
}

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
    else if (c === ";" && depth === 0) { end = i; break; }
  }
  if (end === -1) return null;
  return text.slice(text.indexOf("=", start) + 1, end).trim().replace(/\n {4}/g, "\n  ");
}

function transform(src: string): { out: string; applied: string[] } {
  let out = src;
  const applied: string[] = [];
  for (const [re, to, why] of RULES) {
    if (re.test(out)) { applied.push(why); out = out.replace(re, to); }
    re.lastIndex = 0;
  }
  out = out.replace(/\n{3,}/g, "\n").replace(/\{\n\s*\n/g, "{\n");
  return { out, applied: [...new Set(applied)] };
}

function dirsOf(base: string, prefix = ""): string[] {
  const out: string[] = [];
  for (const d of readdirSync(join(DIST, "components", base), { withFileTypes: true })) {
    if (!d.isDirectory() || d.name === "_shared") continue;
    const rel = prefix ? `${prefix}/${d.name}` : d.name;
    out.push(rel);
    const nested = join(DIST, "components", rel, "components");
    if (existsSync(nested)) {
      for (const n of readdirSync(nested, { withFileTypes: true })) {
        if (n.isDirectory()) out.push(`${rel}/components/${n.name}`);
      }
    }
  }
  return out.sort();
}

const main = exportedNames(join(DIST, "index.d.ts"));
const lab = exportedNames(join(DIST, "lab.d.ts"));
const pascal = (d: string) =>
  (d.split("/").pop() ?? d).split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join("")
    .replace("Otp", "OTP").replace("Chatbubble", "ChatBubble");

type Row = { now: string; next: string; surface: "main" | "lab"; props: string | null; applied: string[]; parts: string[] };
const rows: Row[] = [];

for (const dir of dirsOf("")) {
  const cd = join(DIST, "components", dir);
  const text = readdirSync(cd).filter((f) => f.endsWith(".d.ts"))
    .map((f) => readFileSync(join(cd, f), "utf8")).join("\n");
  const base = pascal(dir);
  const propTypes = [...text.matchAll(/export type (\w+Props) =/g)].map((m) => m[1]);
  const primary = propTypes.find((p) => p === `${base}Props`)
    ?? propTypes.find((p) => p.endsWith("RootProps")) ?? propTypes[0];
  const raw = primary ? extractProps(text, primary) : null;
  const t = raw ? transform(raw) : { out: null as string | null, applied: [] as string[] };
  rows.push({
    now: base,
    next: RENAMES[base] ?? base,
    surface: lab.has(base) ? "lab" : "main",
    props: t.out,
    applied: t.applied,
    parts: [...main, ...lab].filter((n) => n !== base && n.startsWith(base)).sort(),
  });
}

// Components living as loose files inside another component's folder.
const seen = new Set(rows.flatMap((r) => [r.now, ...r.parts]));
for (const [surface, names] of [["main", main], ["lab", lab]] as const) {
  for (const name of [...names].sort()) {
    if (seen.has(name) || /^[A-Z0-9_]+$/.test(name)) continue;
    let raw: string | null = null;
    const stack = [join(DIST, "components")];
    while (stack.length) {
      const cur = stack.pop()!;
      for (const d of readdirSync(cur, { withFileTypes: true })) {
        const full = join(cur, d.name);
        if (d.isDirectory()) stack.push(full);
        else if (d.name.endsWith(".d.ts")) {
          const t = readFileSync(full, "utf8");
          if (t.includes(`export type ${name}Props`)) raw = extractProps(t, `${name}Props`);
        }
      }
    }
    const t = raw ? transform(raw) : { out: null as string | null, applied: [] as string[] };
    rows.push({ now: name, next: RENAMES[name] ?? name, surface, props: t.out, applied: t.applied, parts: [] });
    seen.add(name);
  }
}
rows.sort((a, b) => a.next.localeCompare(b.next));

const L: string[] = [];
L.push("# UI/ — built by design & utility");
L.push("");
L.push("**The proposed 2.2 interface for every component.**");
L.push("");
L.push("Each entry is the component's *real current* props with the 2.2 rules applied, so nothing here is invented and nothing is missing. Generated by `scripts/generate-proposed-reference.ts`, which is also the executable spec for the codemod.");
L.push("");
const mainRows = rows.filter((r) => r.surface === "main");
const labRows = rows.filter((r) => r.surface === "lab");
L.push(`**${mainRows.length} components** on the main surface · **${labRows.length}** in \`@pathscale/ui/lab\``);
L.push("");
L.push("---");
L.push("");
L.push("## The three axes");
L.push("");
L.push("| Axis | Answers | Values | |");
L.push("| --- | --- | --- | --- |");
L.push("| `variant` | what shape | `solid` `soft` `outline` `ghost` `plain` | closed |");
L.push("| `flavor` | what it *is* | `neutral` `primary` `secondary` `accent` `destructive` `success` `warning` `info` … | **open** |");
L.push("| `state` | what is happening *now* | `default` `loading` `disabled` `invalid` `hidden` | closed |");
L.push("");
L.push("```tsx");
L.push('<Button>                                       // solid, primary — the call to action');
L.push('<Button variant="ghost" size="icon">           // chrome');
L.push('<Button flavor="destructive" state="loading">  // both, no conflict');
L.push('<Button flavor="hip">                          // theme-defined, no library change');
L.push("```");
L.push("");
L.push("## Renames");
L.push("");
L.push("| Now | 2.2 |");
L.push("| --- | --- |");
for (const [a, b] of Object.entries(RENAMES)) L.push(`| \`${a}\` | **\`${b}\`** |`);
L.push("");
L.push("---");
L.push("");

function render(list: Row[], heading: string) {
  L.push(`## ${heading}`);
  L.push("");
  for (const r of list) {
    L.push(`### ${r.next}${r.next !== r.now ? `  ·  was \`${r.now}\`` : ""}`);
    L.push("");
    if (r.parts.length) { L.push(`Parts: ${r.parts.map((p) => `\`${p}\``).join(" · ")}`); L.push(""); }
    if (r.props) {
      L.push("```ts");
      L.push(`type ${r.next}Props = ${r.props};`);
      L.push("```");
      if (r.applied.length) { L.push(""); L.push(`*Changed:* ${r.applied.join("; ")}.`); }
    } else L.push("_No exported props type._");
    L.push("");
  }
}
render(mainRows, "Components");
L.push("---");
L.push("");
render(labRows, "`@pathscale/ui/lab`");

writeFileSync(OUT, L.join("\n"));
console.log(`wrote ${OUT}: ${mainRows.length} main + ${labRows.length} lab`);

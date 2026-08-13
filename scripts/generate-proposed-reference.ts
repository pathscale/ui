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

type Row = { now: string; next: string; surface: "main" | "lab"; props: string | null; applied: string[]; parts: string[]; input?: boolean };
/** Anything a user can type into, pick from, or toggle. */
const INPUT_CAPABLE = new Set([
  "Input", "Textarea", "TextArea", "PasswordField", "Select", "Combobox", "ComboBox",
  "Checkbox", "CheckboxGroup", "Radio", "RadioGroup", "Toggle", "Switch", "Slider",
  "InputOTP", "FileInput", "NumberField", "SearchField", "TextField", "ColorField",
  "DateField", "DatePicker", "DateRangePicker", "TimeField", "Calendar", "RangeCalendar",
  "Rating", "Filter", "Form", "FormField",
]);

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
    input: INPUT_CAPABLE.has(base),
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
    rows.push({ now: name, next: RENAMES[name] ?? name, surface, props: t.out, applied: t.applied, parts: [], input: INPUT_CAPABLE.has(name) });
    seen.add(name);
  }
}
rows.sort((a, b) => a.next.localeCompare(b.next));

const L: string[] = [];
L.push("# UI/ — built by design & utility");
L.push("");
L.push("**The proposed 2.2 interface for every component.** *v2 — validation, events and the three axes folded in.*");
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
L.push("### State, and what an invalid input is");
L.push("");
L.push("```ts");
L.push("type State = \"default\" | \"loading\" | \"disabled\" | \"invalid\" | \"hidden\";");
L.push("```");
L.push("");
L.push("**An input with invalid input has `state=\"invalid\"`**, and it is readable from `data-state`. One prop, one answer.");
L.push("");
L.push("`invalid` is *derived by default and settable when you need it* — the same controlled/uncontrolled shape as `value`. Leave `state` alone and the field goes invalid because it has error-severity issues; set it and yours wins.");
L.push("");
L.push("| `state` set to | Issues | `data-state` | |");
L.push("| --- | --- | --- | --- |");
L.push("| — | none | `default` | |");
L.push("| — | error | **`invalid`** | derived |");
L.push("| — | warning only | `default` | a warning does not redden the field |");
L.push("| `disabled` | error | `disabled` | you cannot fix what you cannot edit — but the message still shows |");
L.push("| `loading` | error | `loading` | revalidating, previous error still visible |");
L.push("| `hidden` | error | `hidden` | |");
L.push("");
L.push("An explicit `state` always wins, because a caller who says `disabled` means it. The states otherwise read as a priority: `hidden` over `disabled` over `loading` over `invalid` over `default`.");
L.push("");
L.push("`state` is closed and the library owns it — which conditions a component can be in is not a styling question. `flavor` is the open one.");
L.push("");
L.push("## Validation");
L.push("");
L.push("Every component a user can type into, pick from or toggle extends `Validatable<T>`. **19 components** carry it.");
L.push("");
L.push("### A result, not a message");
L.push("");
L.push("```ts");
L.push("interface Issue {");
L.push("  code: string;                      // \"too_small\" — stable and translatable");
L.push("  params?: Record<string, unknown>;  // { minimum: 8 }");
L.push("  message?: JSX.Element;             // optional override; skips the i18n lookup");
L.push("  severity?: \"error\" | \"warning\";    // not every issue blocks submission");
L.push("  path?: (string | number)[];");
L.push("}");
L.push("```");
L.push("");
L.push("`\"password too short\"` is `{ code: \"too_small\", params: { minimum: 8 } }`, and the sentence is produced from i18n context. A message baked in English inside the library — which is what `passwordRules.ts` does today — means every non-English app either shows English or rebuilds the result.");
L.push("");
L.push("### The hard part: showing it *before* the server");
L.push("");
L.push("Two things are being asked for at once, and conflating them is why inline validation usually feels bad:");
L.push("");
L.push("| | `Constraint` | `Issue` |");
L.push("| --- | --- | --- |");
L.push("| Says | \"at least 8 characters\" | \"too short\" |");
L.push("| Tone | neutral, then satisfied | negative |");
L.push("| Shown | **live, from the first keystroke** | only once earned |");
L.push("| Source | the rules, known up front | a failed check |");
L.push("");
L.push("They are the *same rule at different moments*. Ticking a requirement off as the user types is help. The same rule flashed as \"too short\" mid-word is nagging. So they are separate props with separate timing.");
L.push("");
L.push("### Timing");
L.push("");
L.push("```ts");
L.push("type ValidateOn = \"change\" | \"blur\" | \"touched\" | \"submit\";   // default: \"touched\"");
L.push("```");
L.push("");
L.push("`touched` is the only default that is not hostile: **say nothing while they are first typing, surface issues when they leave the field, then revalidate on every keystroke so they can watch themselves fix it.** Reward early, punish late.");
L.push("");
L.push("| | Behaviour | |");
L.push("| --- | --- | --- |");
L.push("| `change` | every keystroke from the start | nags; rarely right |");
L.push("| `blur` | only on leaving the field | misses the correction feedback |");
L.push("| `touched` | blur, then live once it has errored once | **the default** |");
L.push("| `submit` | only on form submit | server-round-trip feel |");
L.push("");
L.push("### Client and server land in the same place");
L.push("");
L.push("`issues` is controlled, so a server response sets it directly and it merges with whatever `validate` produced:");
L.push("");
L.push("```tsx");
L.push("const [serverIssues, setServerIssues] = createSignal<Issue[]>([]);");
L.push("");
L.push("<Input");
L.push("  name=\"email\"");
L.push("  validate={(v) => v.includes(\"@\") ? [] : [{ code: \"invalid_email\" }]}");
L.push("  issues={serverIssues()}          // \"that address is already registered\"");
L.push("/>");
L.push("```");
L.push("");
L.push("There is no separate error banner and no second rendering path: a server issue looks exactly like a client one, in the same slot, translated the same way.");
L.push("");
L.push("### Passwords, end to end");
L.push("");
L.push("The case that motivates the split. Requirements tick live and positive; the failure only appears once earned:");
L.push("");
L.push("```tsx");
L.push("<PasswordField");
L.push("  value={password()}");
L.push("  onChange={setPassword}");
L.push("  constraints={evaluatePasswordRules(password(), { minLength: 8, requireNumber: true })}");
L.push("  showConstraints=\"unsatisfied\"   // fade each one out as it is met");
L.push("  validateOn=\"touched\"");
L.push("  issues={serverIssues()}         // \"this password has appeared in a breach\"");
L.push("/>");
L.push("```");
L.push("");
L.push("`evaluatePasswordRules` already returns `{ key, message, passed }` — it becomes `Constraint[]` by renaming `key` to `code`, `passed` to `satisfied`, and dropping the hardcoded English so i18n supplies the sentence.");
L.push("");
L.push("`showConstraints`: `always` · `focus` · `unsatisfied` (default for passwords) · `never`.");
L.push("");
L.push("### It is one label");
L.push("");
L.push("Both render into the same `message` slot beneath the field, so nothing shifts as validation state changes:");
L.push("");
L.push("```");
L.push("┌─────────────────────────────┐");
L.push("│ Password                    │");
L.push("│ ┌─────────────────────────┐ │");
L.push("│ │ ••••••              👁  │ │");
L.push("│ └─────────────────────────┘ │");
L.push("│ ✓ At least 8 characters     │   <- Constraint, live");
L.push("│ ○ One number                │   <- Constraint, unmet");
L.push("│ ⚠ Appeared in a breach      │   <- Issue, severity warning");
L.push("└─────────────────────────────┘");
L.push("```");
L.push("");
L.push("The slot is `data-slot=\"field-message\"`, and `state=\"invalid\"` is set only when an `error`-severity issue is visible — so a warning colours the message without blocking submission or marking the field red.");
L.push("");
L.push("---");
L.push("");
L.push("## Events");
L.push("");
L.push("22 distinct `on*` props today. They collapse to three, and each carries **why**, not just what.");
L.push("");
L.push("```ts");
L.push("onChange?:          (value: T, reason?: ChangeReason) => void;");
L.push("onOpenChange?:      (open: boolean, reason?: OpenChangeReason) => void;");
L.push("onSelectionChange?: (keys: K[], reason?: ChangeReason) => void;");
L.push("");
L.push("type OpenChangeReason = \"escape\" | \"backdrop\" | \"trigger\" | \"api\" | \"select\" | \"submit\";");
L.push("type ChangeReason     = \"input\" | \"paste\" | \"clear\" | \"step\" | \"select\" | \"api\";");
L.push("```");
L.push("");
L.push("The reason is optional and trailing, so `onOpenChange={(open) => …}` is unchanged.");
L.push("");
L.push("**It exists because the library already drew this distinction.** `Drawer` ships `DrawerCloseReason = \"escape\" | \"backdrop\" | \"trigger\" | \"api\"`, and folding `onClose` into `onOpenChange(boolean)` would have thrown it away. Whether a dialog closed by Escape or by a backdrop click is exactly what decides whether to warn about unsaved work.");
L.push("");
L.push("| Kept | Absorbs |");
L.push("| --- | --- |");
L.push("| `onChange` | `onInput` (12 sites), `onValueChange` (3), `onToggle` (3), `onSizeChange` (3) |");
L.push("| `onOpenChange` | `onClose` (24), `onOpen` (3) |");
L.push("| `onSelectionChange` | `onSelect` (3), `onDaySelect` (6) |");
L.push("");
L.push("`onAction` (9) and `onInteractOutside` (9) stay distinct: activating an item is not changing a selection, and interacting outside is not necessarily closing.");
L.push("");
L.push("---");
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
      if (r.input) {
        L.push("");
        L.push("Also extends **`Validatable<T>`** — `validate`, `validateOn`, `issues`, `constraints`, `errorMessage`. See [Validation](#validation).");
      }
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

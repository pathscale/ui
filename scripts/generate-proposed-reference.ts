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
  [/^\s*isIconOnly\?: boolean;\s*$/gm, "", "→ width=\"square\""],
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
L.push("**The proposed 2.2 interface for every component.** *v3 — Composer, Address and Status added; Button's last three `is*` props removed.*");
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
L.push("| `state` | what is happening *now* | `default` `loading` `error` `invalid` `disabled` `hidden` | closed |");
L.push("");
L.push("```tsx");
L.push('<Button>                                       // solid, primary — the call to action');
L.push('<Button variant="ghost" width="square">        // chrome, icon-only');
L.push('<Button flavor="destructive" state="loading">  // both, no conflict');
L.push('<Button flavor="hip">                          // theme-defined, no library change');
L.push("```");
L.push("");
L.push("### State, and what an invalid input is");
L.push("");
L.push("```ts");
L.push("type State = \"default\" | \"loading\" | \"error\" | \"invalid\" | \"disabled\" | \"hidden\";");
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
L.push("An explicit `state` always wins, because a caller who says `disabled` means it. The states otherwise read as a priority: `hidden` over `disabled` over `loading` over `error` over `invalid` over `default`.");
L.push("");
L.push("### `error` is not `invalid`");
L.push("");
L.push("| | `invalid` | `error` |");
L.push("| --- | --- | --- |");
L.push("| Means | the value broke a rule | something we do not understand went wrong |");
L.push("| Whose fault | the user's | ours |");
L.push("| Fixable by editing | yes | no |");
L.push("| Carries | `Issue[]` — a code and params | a thrown thing |");
L.push("| Event | `onChange` | **`onError(error, { retry })`** |");
L.push("");
L.push("The case that forces the distinction is **async validation that cannot reach the server**. The value is not invalid — its validity is *unknown*. Rendering it red and saying \"too short\" is a lie, and the user will keep editing a field that was fine.");
L.push("");
L.push("`error` beats `invalid` in the chain for the same reason: if the validator could not run, whatever `issues` still holds is stale and must not be trusted.");
L.push("");
L.push("Any component doing async work — `Select` loading options, `ChatThread` streaming, `AuthFlow` submitting — extends `Failable` and gets `onError`. Retry belongs there too, because retrying is the response to an exception and is meaningless for a validation issue.");
L.push("");
L.push("`state` is closed and the library owns it — which conditions a component can be in is not a styling question. `flavor` is the open one.");
L.push("");
L.push("### Status and connection");
L.push("");
L.push("Nothing in the library today. Four apps hand-write `ConnectionStatus`, and agencyzero writes three variants of the dot alone (`StatusDot`, `AgentStateDot`, `ItemMarker`). Two levels, both missing.");
L.push("");
L.push("```ts");
L.push("// The primitive. daisyUI calls this Status.");
L.push("type StatusProps = {");
L.push("  status: string;            // open, like flavor — mirrored to data-status");
L.push("  label?: JSX.Element;       // from i18n context when omitted");
L.push("  showLabel?: boolean;");
L.push("  size?: Size;");
L.push("  flavor?: Flavor;");
L.push("  pulse?: boolean;           // activity, e.g. connecting");
L.push("};");
L.push("");
L.push("// The complex component.");
L.push("type ConnectionStatusProps = Failable & {");
L.push("  connection: \"connecting\" | \"connected\" | \"disconnected\" | \"error\";");
L.push("  service?: string;");
L.push("  url?: string;");
L.push("  diagnostics?: DiagnosticRow[];");
L.push("  onReconnect?: () => void | Promise<void>;");
L.push("  showDiagnostics?: boolean;");
L.push("};");
L.push("```");
L.push("");
L.push("`status` is **open**, for the same reason `flavor` is: agencyzero alone has three unrelated domains — agent state, project status, tab status — and a closed union would have served none of them. It is mirrored to `data-status` so a theme or an app styles its own values.");
L.push("");
L.push("**`connection` is not `state`.** This is the distinction that matters here and it generalises. `state` is what is happening to *this component*; `connection` is what is happening to the *thing it reports on*. A `ConnectionStatus` can be `state=\"loading\"` while it fetches diagnostics **and** `connection=\"disconnected\"` at the same time — the component is busy, the connection is down, and those are different facts.");
L.push("");
L.push("The same split applies to every component whose purpose is to display someone else's condition: `Progress` has `value`, `Empty` has its emptiness, `ConnectionStatus` has `connection`. None of them put the subject on `state`.");
L.push("");
L.push("`onReconnect` and `Failable`'s `onError(error, { retry })` are deliberately separate: reconnecting is a user action on the subject, retrying is a response to the component's own failure.");
L.push("");
L.push("Not coupled to `@pathscale/wss-adapter`. The apps that use it pass the state in; the library does not learn a transport.");
L.push("");
L.push("### Combining many conditions into one indicator");
L.push("");
L.push("A realtime call has at least seven independent conditions:");
L.push("");
L.push("```");
L.push("internet --> server --> auth --> media --> peer mic");
L.push("        |                             +--> peer camera");
L.push("        +--> your mic");
L.push("        +--> your camera");
L.push("```");
L.push("");
L.push("**\"Show the worst one\" is the wrong answer.** If the internet is down then six of the seven are also down, and reporting \"their camera is off\" is true, useless, and sends the user to fix the wrong thing. They are a dependency graph, and the useful report is the **root cause**: the deepest failure whose own dependencies are healthy.");
L.push("");
L.push("```ts");
L.push("type Health =");
L.push("  | \"ok\" | \"degraded\" | \"flapping\" | \"connecting\" | \"reconnecting\" | \"down\" | \"unknown\";");
L.push("//  down > reconnecting > connecting > flapping > degraded > unknown > ok");
L.push("");
L.push("type Quality = \"good\" | \"fair\" | \"poor\" | \"unknown\";   // orthogonal to health");
L.push("");
L.push("interface StatusItem {");
L.push("  id: string; health: Health; quality?: Quality;");
L.push("  scope?: \"local\" | \"remote\";   // only local is actionable by this user");
L.push("  dependsOn?: string[];");
L.push("  recoverable?: boolean;         // ICE disconnected (may return) vs failed (will not)");
L.push("  transitioning?: boolean;       // trying right now");
L.push("  everHealthy?: boolean;         // \"was I ever connected?\"");
L.push("  recentChanges?: number;        // flips — flapping is derived from this");
L.push("  label?: JSX.Element; detail?: JSX.Element; onRetry?: () => void;");
L.push("}");
L.push("");
L.push("summarizeStatus(items) -> { health, quality, attempting?, flapping,");
L.push("                            recovering, cause?, failing[], symptoms[] }");
L.push("diffStatus(prev, next, items) -> { degraded[], recovered[], healthChanged, qualityChanged }");
L.push("```");
L.push("");
L.push("#### Why each value earns its place");
L.push("");
L.push("| Value | Why not just `down` |");
L.push("| --- | --- |");
L.push("| `connecting` | never worked — be patient |");
L.push("| `reconnecting` | worked and just broke — **\"was I ever connected?\"** |");
L.push("| `flapping` | up *right now*, and that means nothing. Commonly overlooked, which is why a chip reads \"Connected\" while the experience is unusable |");
L.push("| `degraded` | works, impaired |");
L.push("| `unknown` | genuinely cannot tell |");
L.push("");
L.push("`quality` is a **separate axis** because a call can be `connected` *and* critical at once — folding them forces a choice when both are true.");
L.push("");
L.push("#### Measured");
L.push("");
L.push("| Scenario | health | quality | cause | suppressed |");
L.push("| --- | --- | --- | --- | ---: |");
L.push("| internet down, all cascades | `down` | good | **Internet** | 6 |");
L.push("| connected, not authenticated | `degraded` | good | **Signed in** | 2 |");
L.push("| connected, quality critical | `ok` | **poor** | — | 0 |");
L.push("| first ever connect | **`connecting`** | good | Server | 0 |");
L.push("| was up, now retrying | **`reconnecting`** | good | Server | 0 |");
L.push("| up but flapped 4x | **`flapping`** | **poor** | — | 0 |");
L.push("| flapping internet, server+media down | `flapping` | poor | **Internet (flapping)** | 2 |");
L.push("| server reconnecting, media down | **`reconnecting`** | good | **Server** | 1 |");
L.push("");
L.push("That last row is the rule: **`health` is the worst among *causes*, not symptoms.** Media is down because the server is reconnecting, so reporting `down` would bury the fact that something is actively recovering.");
L.push("");
L.push("#### State, event, transient");
L.push("");
L.push("| | | Example |");
L.push("| --- | --- | --- |");
L.push("| **State** | a condition you are *in* | `connected` |");
L.push("| **Event** | a transition, at an instant | \"became connected\" |");
L.push("| **Transient** | an event rendered as a state, then gone | `quality-restored` |");
L.push("");
L.push("Transitions are **emitted**, not just painted, because reconnecting triggers work elsewhere: refetch stale data, resubscribe channels, flush queued writes, re-authenticate. `diffStatus` says which items moved and in which direction, so no consumer has to keep the previous summary and diff it.");
L.push("");
L.push("`diffStatus` holds no timer — a timer inside a pure function is how a status lies after a tab has been backgrounded for an hour.");
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
L.push("## New in 2.2");
L.push("");
L.push("Three components that the fleet was rebuilding by hand. Each was measured across `~/code` before it was written, and each is here because something already needed it rather than because the shelf looked incomplete.");
L.push("");
L.push("| | Evidence | What it carries |");
L.push("| --- | --- | --- |");
L.push("| **`Composer`** | one built and tested implementation; 8 repos hand-rolling Enter handling; chat planned on all 12 sites | send on Enter and newline on Shift+Enter *without* breaking IME composition, autosize with a ceiling, refusal to send whitespace or to send twice, and a height announcement for the scroller above it |");
L.push("| **`Address`** | wallet addresses in 2 apps, and a `truncateAddress` living in one of them and nowhere else | middle truncation, copy with confirmation, explorer link, resolved name over hex |");
L.push("| **`Status`** | 7 independent conditions in one call, 12 hand-written branches deciding what to show | root-cause aggregation, `Health` including `flapping` and `reconnecting`, quality as its own axis, and transitions as events |");
L.push("");
L.push("**`Composer` is not `Textarea` with a button.** The reason it is a component is the part nobody writes twice correctly: `isComposing`. While an IME is open, Enter commits the candidate and must not also send the message, and skipping that check sends half a word in Japanese, Chinese and Korean.");
L.push("");
L.push("**`Address` means the on-chain one.** A postal address form has zero call sites anywhere in the fleet, so building one would be building on a guess.");
L.push("");
L.push("### What is deliberately *not* a component");
L.push("");
L.push("`EmailInput`, `UrlInput`, `PhoneInput`. `type=\"email\"` appears in 5 repos and nobody has ever wrapped it, which matches shadcn, daisyUI and Radix, all of which leave it as `<Input type=\"email\">`. What was actually missing is the validation, and 2.2 already has the slot for it: **`type` drives a default `validate` and the `Issue` codes that go with it** (`invalid_email`, `invalid_url`, `invalid_tel`): stable, translatable, and still overridable by passing your own `validate`.");
L.push("");
L.push("### One place we do not take the industry's word");
L.push("");
L.push("shadcn spells icon-only `size=\"icon\"`. We spell it **`width=\"square\"`**, because `size=\"icon\"` collapses two axes into one and the fleet needs both: most of the 465 button call sites pass a size *and* icon-only, so `size=\"icon\"` would discard the scale at every one of them. Our own stylesheet had already conceded the point, carrying a separate square width for each size. Taking the industry's term is a tie-breaker on naming, not a reason to lose information.");
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

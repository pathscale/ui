/*
 * Turn `components.ts` into ps-qa checks, one file per component.
 *
 * The point is that nobody writes a check by hand. A component's kind decides
 * which checks exist and what each may assert, so the weak assertion that let a
 * broken Select pass 2/2 is not spellable here: a `value` component's "changes"
 * check always names the trigger as its subject, because this generator writes
 * it that way.
 *
 * Run: bun run qa:checks
 */
import { COMPONENTS, type ComponentSpec } from "./components";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const outputDir = join(import.meta.dir, "checks");

/** One `.ron` record. */
function check(fields: Record<string, string>): string {
  const body = Object.entries(fields)
    .map(([key, value]) => `        ${key}: ${value},`)
    .join("\n");
  return `    (\n${body}\n    ),`;
}

function checksFor(spec: ComponentSpec): string {
    /*
   * No surface to open: the harness serves one component per page, and the
   * page for this component is already the one under test. `open` names a
   * surface to navigate to, which only means something in an application with
   * more than one.
   */
  const surface = "None";
  const subject = `"${spec.subjectRole}:${spec.subject}"`;
  const records: string[] = [];

  /*
   * Every component gets this one, whatever its kind: it mounts, and it reaches
   * the renderer with a box under the harness fixture.
   *
   * That is a low bar deliberately. It is also the bar a surprising number of
   * things fail — the harness's own first run had a component that mounted to
   * nothing because `URLSearchParams` threw — and it is the check that can be
   * generated without anyone describing the component's interaction first. A
   * component with no `subject` yet stops here, honestly covered for what is
   * known about it, rather than being left out of the roster entirely.
   */
  records.push(
    check({
      id: `"${spec.id}-page-paints"`,
      group: `"${spec.id}"`,
      what: `"the ${spec.component} page builds and paints"`,
      open: surface,
      hover: "None",
      click: "None",
      /*
       * The page heading, which the harness renders for whichever component it
       * mounted. It is addressable because Blitz names a node from its text,
       * and `heading:` pins the role so this cannot be satisfied by some other
       * node that happens to contain the component's name.
       *
       * This asserts the page for this component built and painted. Whether the
       * component itself produced anything is the job of the checks below, which
       * need someone to have described its interaction first.
       */
      subject: `"heading:${spec.component}"`,
      expect: "PaintsNamed",
    }),
  );

  /*
   * The component itself produced something.
   *
   * `PaintsMore` against the page's own baseline: the harness renders a heading
   * and a fixture wrapper whatever happens, so a page that paints proves only
   * that the bundle built. Accordion mounted to exactly that and nothing else —
   * it is a compound component, and `<Accordion>Accordion</Accordion>` is not a
   * usable Accordion — while its page check passed.
   *
   * This is the check that separates a component that rendered from one that
   * silently rendered nothing.
   */
  records.push(
    check({
      id: `"${spec.id}-renders"`,
      group: `"${spec.id}"`,
      what: `"${spec.component} renders a node of its own"`,
      open: surface,
      hover: "None",
      click: "None",
      /*
       * The fixture region, which wraps only the component.
       *
       * A component that renders nothing leaves it 1184x0 and hidden;
       * one that renders leaves it with real height and visible. `Paints`
       * requires a box with area, so the two are distinguishable.
       *
       * Known limitation, and the reason this is not the last word: a component
       * that positions itself absolutely contributes no height to its parent,
       * so Badge paints a real 28x28 node and still fails here. Those are
       * listed in README.md rather than silently passed.
       */
      /*
       * Named, not role-scoped. Blitz maps `<section aria-label>` to `generic`
       * rather than `region`, so pinning the role would make this check fail on
       * every component for a reason that has nothing to do with the component.
       */
      subject: `"fixture"`,
      expect: "Paints",
    }),
  );

  /*
   * A component whose kind implies an interaction must describe it.
   *
   * This used to return the paint check alone and carry on, which is how 69 of
   * 71 components sat at partial coverage while the roster reported every one
   * of them as having checks. Silence read as coverage.
   *
   * `display` is the only kind with nothing to describe: painting is its whole
   * contract. Everything else fails generation until someone says which control
   * a reader reads, which is the one fact no generator can infer and the one a
   * wrong guess would quietly assert against the wrong node.
   */
  if (spec.kind === "toggle" && !spec.subjectRole) {
    throw new Error(
      `${spec.component} is kind "toggle" but has no \`subjectRole\`: a toggle ` +
        `is addressed by role, because the ones measured so far render an ` +
        `input with no accessible name at all.`,
    );
  }

  if (
    spec.kind !== "display" &&
    spec.kind !== "toggle" &&
    (!spec.subject || !spec.subjectRole)
  ) {
    throw new Error(
      `${spec.component} is kind "${spec.kind}" but has no subject: add ` +
        `\`subject\` and \`subjectRole\` to its entry in components.ts, or ` +
        `change its kind to "display" if painting really is its whole contract.`,
    );
  }

  if (spec.kind === "value" || spec.kind === "mode") {
    // 1. It opens. Addressed by `role:name` on a node that only exists once the
    //    mode is open: a name-only check is satisfied by the trigger, which
    //    paints whether or not anything happened.
    records.push(
      check({
        id: `"${spec.id}-opens"`,
        group: `"${spec.id}"`,
        what: `"the ${spec.component} menu reaches the renderer as an addressable item"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subject}")`,
        settle_after_ms: "600",
        click: "None",
        subject: `"${spec.opens}"`,
        expect: "PaintsNamed",
      }),
    );

    // 2. It does its work. Asserted on the trigger, never the option: this is
    //    the check that distinguishes a working component from a decorative one.
    records.push(
      check({
        id: `"${spec.id}-changes"`,
        group: `"${spec.id}"`,
        what: `"choosing another value changes what the ${spec.component} trigger reads"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subject}")`,
        settle_after_ms: "600",
        click: `Some("${spec.activate}")`,
        subject,
        expect: "NameChanges",
      }),
    );

    // 3. It leaves by the abandoning key. A mode with no exit traps its reader.
    records.push(
      check({
        id: `"${spec.id}-escape-closes"`,
        group: `"${spec.id}"`,
        what: `"Escape closes the ${spec.component} menu without choosing"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subject}")`,
        settle_after_ms: "600",
        prepare_key: `Some("Escape")`,
        click: "None",
        subject: `"${spec.opens}"`,
        expect: "Vanishes",
      }),
    );
  }

  if (spec.kind === "toggle") {
    /*
     * A toggle's whole contract: pressing it flips the state the tree reports.
     *
     * Addressed by role alone, because Switch, Radio and Checkbox all render an
     * input with no accessible name at all. Measured: role `switch` with an
     * empty name at 1x1. That is arguably a defect in the components (a 1x1 hit
     * target with no name is not reachable by anyone using assistive
     * technology), but it is what they render, and a check has to address what
     * is there rather than what should be.
     *
     * `SelectionChanges` compares the node's `selected` before and after,
     * carried by id, so a second toggle on the page cannot satisfy it.
     */
    records.push(
      check({
        id: `"${spec.id}-toggles"`,
        group: `"${spec.id}"`,
        what: `"pressing the ${spec.component} changes what it reports"`,
        open: surface,
        hover: "None",
        click: `Some("${spec.subjectRole}:")`,
        subject: `"${spec.subjectRole}:"`,
        expect: "SelectionChanges",
      }),
    );
  }

  if (spec.kind === "action") {
    records.push(
      check({
        id: `"${spec.id}-paints"`,
        group: `"${spec.id}"`,
        what: `"the ${spec.component} control is on screen and addressable"`,
        open: surface,
        hover: "None",
        click: "None",
        subject,
        expect: "PaintsNamed",
      }),
    );
  }

  if (spec.kind === "display") {
    /*
     * A `display` component is the one kind allowed to have no `subject`: the
     * check above this block only demands one from kinds that imply an
     * interaction. So this check cannot use `subject` unguarded, and for a long
     * time it did — 54 of 71 generated files asserted against the string
     * `"undefined:undefined"`, a node that cannot exist under any renderer.
     *
     * They were not reported as failures, because the sweep never reached the
     * point of judging them. That is the same defect the header of this file
     * describes as already fixed once, and it came back the moment a check was
     * emitted for a spec that had not been asked for the field it interpolates.
     *
     * The fallback is the component's own name, which the fixture renders as
     * the mounted component's text and which is therefore addressable for every
     * display component without anyone describing it first.
     */
    const described = Boolean(spec.subject && spec.subjectRole);

    records.push(
      check({
        id: `"${spec.id}-paints"`,
        group: `"${spec.id}"`,
        what: `"the ${spec.component} reaches the renderer with a box"`,
        open: surface,
        hover: "None",
        click: "None",
        subject: described ? subject : `"${spec.component}"`,
        /*
         * `PaintsNamed` only when a role was declared, because it is the
         * `role:name` form: it splits the subject on the colon and matches both
         * halves. Handed a bare name it looks for a node with that name and an
         * empty role, which nothing has, and reports `no  named "Badge"` — note
         * the gap where the role should be. Every display component without a
         * declared role failed that way, for a reason that had nothing to do
         * with the component.
         *
         * `Paints` is the name-only assertion and is what an undescribed
         * component can honestly be held to: something with this name is on
         * screen with a box. Declaring `subjectRole` in components.ts upgrades
         * it to the stricter check.
         */
        expect: described ? "PaintsNamed" : "Paints",
      }),
    );
  }

  return [
    `// Generated from qa/components.ts by qa/generate-checks.ts. Do not edit.`,
    `//`,
    `// ${spec.component}, mounted alone on its own harness page. Isolation is`,
    `// the point: driving this inside a real application makes every check`,
    `// order-dependent, and a failure caused by the previous group's leftover`,
    `// state is indistinguishable from a real one.`,
    `[`,
    ...records,
    `]`,
    ``,
  ].join("\n");
}

mkdirSync(outputDir, { recursive: true });

/*
 * Nothing is written that names a subject the renderer cannot have.
 *
 * `undefined` reaches a check only through template interpolation of a field
 * the spec never set, and the result is a check that fails for a reason
 * unrelated to the component, or worse, is never evaluated and reads as
 * coverage. This has happened twice: 30 checks against measured-wrong roles,
 * then 54 against `"undefined:undefined"`. A string check at the boundary costs
 * nothing and makes the third time impossible.
 */
function assertNoUnresolvedSubject(id: string, body: string): void {
  /*
   * `undefined` as a whole field, not anywhere in the text.
   *
   * The looser check caught `subject: "option:Color undefined"`, which is
   * correct: ColorSwatch really does announce itself as "Color undefined",
   * because it interpolates an unset colour prop into its own accessible name.
   * That is a defect in the component, and the check asserting the measured
   * name is how it stays visible until someone fixes it. A generator guard
   * that refuses to write down what a component actually renders makes the
   * defect unassertable.
   *
   * What must never be written is a field that is *entirely* `undefined`, or
   * one of the `undefined:undefined` role-name pairs, which is what unresolved
   * interpolation produces.
   */
  const unresolved = /: "(undefined(:[^"]*)?|[^"]*:undefined)"/;
  if (unresolved.test(body)) {
    const line = body
      .split("\n")
      .find((candidate) => unresolved.test(candidate))
      ?.trim();
    throw new Error(
      `${id}: generated a check containing \`undefined\` (${line}). ` +
        `Some field interpolated into it is missing from its entry in ` +
        `components.ts. Fix the spec or the branch that emits this check; ` +
        `do not hand-edit the generated file.`,
    );
  }
}

for (const spec of COMPONENTS) {
  const path = join(outputDir, `${spec.id}.ron`);
  const body = checksFor(spec);
  assertNoUnresolvedSubject(spec.id, body);
  writeFileSync(path, body);
  console.log(`wrote ${path}`);
}
console.log(`${COMPONENTS.length} component(s) generated`);

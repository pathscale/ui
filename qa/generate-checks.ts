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
  const surface = `Some("${spec.id}")`;
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
      id: `"${spec.id}-mounts"`,
      group: `"${spec.id}"`,
      what: `"${spec.component} mounts and reaches the renderer"`,
      open: surface,
      hover: "None",
      click: "None",
      subject: `"${spec.component}"`,
      expect: "PaintsNamed",
    }),
  );

  // Everything past the paint check needs someone to have said which control a
  // reader reads. Without that there is no honest way to generate an assertion:
  // a guess would name the wrong node, which is the exact failure this whole
  // harness exists to stop.
  if (!spec.subject || !spec.subjectRole) {
    return [
      `// Generated from qa/components.ts by qa/generate-checks.ts. Do not edit.`,
      `//`,
      `// ${spec.component} has no interaction described yet, so only its paint`,
      `// check is generated. Add \`subject\` and \`subjectRole\` to its entry to`,
      `// generate the full set its "${spec.kind}" kind requires.`,
      `[`,
      ...records,
      `]`,
      ``,
    ].join("\n");
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
    records.push(
      check({
        id: `"${spec.id}-paints"`,
        group: `"${spec.id}"`,
        what: `"the ${spec.component} reaches the renderer with a box"`,
        open: surface,
        hover: "None",
        click: "None",
        subject,
        expect: "PaintsNamed",
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
for (const spec of COMPONENTS) {
  const path = join(outputDir, `${spec.id}.ron`);
  writeFileSync(path, checksFor(spec));
  console.log(`wrote ${path}`);
}
console.log(`${COMPONENTS.length} component(s) generated`);

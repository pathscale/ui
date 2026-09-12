/*
 * Turn `components.ts` into ps-qa checks, one file per component.
 *
 * The point is that nobody writes a check by hand. A component's kind decides
 * which checks exist and what each may assert, so the weak assertion that let a
 * broken Select pass 2/2 is not spellable here: a `value` component's "changes"
 * check always names the trigger as its subject, because this generator writes
 * it that way.
 *
 * Two profiles come out of it, because two hosts can answer different
 * questions. See `PROFILES` below.
 *
 * Run: bun run qa:checks
 */

import { mkdirSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  COMPONENTS,
  type ComponentSpec,
  validateComponentSpecs,
} from "./components";

/**
 * What the host running these checks can be asked.
 *
 * `full` is the library's real contract and runs where there are fonts: macOS,
 * and a contributor's machine. `headless` is the same checks with every
 * assertion about *paint* weakened to an assertion about *layout*, and it is
 * what a Linux CI runner can honestly answer.
 *
 * The difference is one measured fact. With no font catalogue every glyph
 * shapes to nothing, so anything sized by its text lays out flat: the harness
 * heading is `1184x24` with fonts and `1184x0` without, and Dialog's trigger is
 * `78x24` and `0x0`. `Paints` asks for a box with area, so on that host it
 * fails for every component, and it fails for a reason that says nothing about
 * the component. `Present` asks the question those checks actually mean -- the
 * node the document was supposed to produce appeared, with the name it was
 * supposed to have -- and is still falsifiable in the two ways that matter: a
 * node the document never creates fails on the tree, and one created but never
 * laid out fails on the bounds.
 *
 * What is deliberately *not* weakened:
 *
 * - `-renders`, which is `Paints` on the fixture region. That box comes from
 *   layout, not from text, and it is measured to hold on a fontless host for
 *   all 74 components. It is also the only check that catches a component
 *   which mounted to nothing, and `Present` would pass for one, because the
 *   fixture is always in the tree. Weakening it would delete the check.
 * - Geometry, `Measures`, `Contrast` and `InteriorInk`. These are about
 *   components that have a box of their own, and they are measured to pass on
 *   a fontless host already. Weakening what already works buys nothing.
 * - Every tree assertion -- `NameChanges`, `SelectionChanges`, `ValueChanges`,
 *   `Vanishes`, `Absent`. Those never asked about paint.
 *
 * So the Linux subset is functional: it drives the control, and it judges what
 * the tree did. What it cannot tell you is whether a person would have seen
 * it. That is the macOS job, and it is why both profiles are generated rather
 * than one being replaced.
 */
type Profile = {
  readonly id: string;
  readonly dir: string;
  /** How this profile spells an assertion about paint. */
  readonly paints: (expect: "Paints" | "PaintsNamed") => string;
  /**
   * Whether a check that reads pixels can be asked at all.
   *
   * `Contrast` and `InteriorInk` are not weakenable the way the paint
   * assertions are: there is no tree-level equivalent of "a person can see
   * this value". Without fonts they are also actively misleading in opposite
   * directions -- `InteriorInk` fails on a trigger whose only ink is its label
   * (Dropdown, LanguageSwitcher), and `Contrast` *passes* on every component,
   * because it looks for painted text too close to its background and there is
   * no painted text to find. A check that cannot fail is worse than one that
   * is not run.
   *
   * So they are simply absent from the headless profile. The value being right
   * is still covered there by `-changes`, which reads the tree.
   */
  readonly readsPixels: boolean;
};

const PROFILES: readonly Profile[] = [
  {
    id: "full",
    dir: "ps-qa",
    paints: (expect) => expect,
    readsPixels: true,
  },
  {
    id: "headless",
    dir: "ps-qa-headless",
    paints: () => "Present",
    readsPixels: false,
  },
];

/** One `.ron` record. */
function check(fields: Record<string, string>): string {
  const body = Object.entries(fields)
    .map(([key, value]) => `        ${key}: ${value},`)
    .join("\n");
  return `    (\n${body}\n    ),`;
}

function checksFor(spec: ComponentSpec, profile: Profile): string {
  /*
   * No surface to open: the harness serves one component per page, and the
   * page for this component is already the one under test. `open` names a
   * surface to navigate to, which only means something in an application with
   * more than one.
   */
  const surface = "None";
  const subjectSelector =
    spec.subjectSelector ?? `${spec.subjectRole}:${spec.subject}`;
  const subject = `"${subjectSelector}"`;
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
      expect: profile.paints("PaintsNamed"),
    }),
  );

  if (spec.geometry) {
    records.push(
      check({
        id: `"${spec.id}-first-frame-distinct"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} paints its repeated parts at distinct positions before interaction"`,
        open: surface,
        hover: "None",
        click: "None",
        subject: `"${spec.geometry.family}"`,
        expect: "DistinctPositions",
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-first-frame-contained"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} keeps its repeated parts inside their composition before interaction"`,
        open: surface,
        hover: "None",
        click: "None",
        compare: `Some("${spec.geometry.container}")`,
        subject: `"${spec.geometry.family}"`,
        expect: "ContainedBy",
      }),
    );
    if (spec.geometry.changesOnHover) {
      records.push(
        check({
          id: `"${spec.id}-hover-feedback"`,
          group: `"${spec.id}"`,
          what: `"${spec.component} visibly responds when a rendered part is hovered"`,
          open: surface,
          hover: "None",
          after_prepare_hover: `Some("${spec.geometry.changesOnHover}")`,
          click: "None",
          subject: `"${spec.geometry.container}"`,
          expect: "PixelsChange",
        }),
      );
    }
    if (spec.geometry.rightOf) {
      records.push(
        check({
          id: `"${spec.id}-desktop-parts-sit-beside"`,
          group: `"${spec.id}"`,
          what: `"${spec.component} places its desktop controls to the right of the primary visual"`,
          open: surface,
          hover: "None",
          click: "None",
          compare: `Some("${spec.geometry.rightOf.compare}")`,
          subject: `"${spec.geometry.rightOf.subject}"`,
          expect: "RightOf",
        }),
      );
    }
    if (spec.geometry.centerAlignedY) {
      records.push(
        check({
          id: `"${spec.id}-desktop-parts-center-vertically"`,
          group: `"${spec.id}"`,
          what: `"${spec.component} vertically centers its primary visual against the desktop controls"`,
          open: surface,
          hover: "None",
          click: "None",
          compare: `Some("${spec.geometry.centerAlignedY.compare}")`,
          subject: `"${spec.geometry.centerAlignedY.subject}"`,
          expect: "CenterAlignedY",
        }),
      );
    }
  }

  if (spec.measure) {
    records.push(
      check({
        id: `"${spec.id}-measures"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} keeps its standard control geometry"`,
        open: surface,
        hover: "None",
        click: "None",
        expect_size: `Some("${spec.measure.size}")`,
        subject: `"${spec.measure.subject}"`,
        expect: "Measures",
      }),
    );
  }

  if (spec.contrast && profile.readsPixels) {
    records.push(
      check({
        id: `"${spec.id}-contrast"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} keeps its rendered controls distinguishable from their surface"`,
        open: surface,
        hover: "None",
        click: "None",
        subject: `"${spec.contrast}"`,
        expect: "Contrast",
      }),
    );
  }

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
      /*
       * `Paints` in both profiles, deliberately not weakened.
       *
       * The fixture's box comes from layout rather than from text, so it
       * survives a host with no fonts -- measured, for all 74 components. And
       * it is the one check that catches a component which mounted to nothing:
       * `Present` would pass for one, because the fixture is in the tree
       * either way. Degrading this would not weaken the check, it would delete
       * it.
       */
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
    if (profile.readsPixels) {
      records.push(
        check({
          id: `"${spec.id}-selected-value-paints"`,
          group: `"${spec.id}"`,
          what: `"${spec.component} paints the selected value a person reads"`,
          open: surface,
          hover: "None",
          click: "None",
          subject,
          expect: "InteriorInk",
        }),
      );
    }

    if (spec.closedContent) {
      records.push(
        check({
          id: `"${spec.id}-closed-content-is-absent"`,
          group: `"${spec.id}"`,
          what: `"the closed ${spec.component} does not retain its menu content in the renderer"`,
          open: surface,
          hover: "None",
          click: "None",
          subject: `"${spec.closedContent}"`,
          expect: "Absent",
        }),
      );
    }

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
        prepare: `Some("${subjectSelector}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "600",
        click: "None",
        subject: `"${spec.opens}"`,
        expect: profile.paints("PaintsNamed"),
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
        prepare: `Some("${subjectSelector}")`,
        prepare_unless: `Some("${spec.opens}")`,
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
        prepare: `Some("${subjectSelector}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "600",
        click: "None",
        key: `Some("Escape")`,
        key_on: `Some("${spec.opens}")`,
        subject: `"${spec.opens}"`,
        expect: "Vanishes",
      }),
    );
  }

  if (spec.kind === "settings") {
    /*
     * Three layers, because this component failed at a different one each time.
     *
     * The toggle reveals the inputs; typing into one commits nothing on its own;
     * the save button commits. The middle check is the one worth having: without
     * it a panel that writes straight through on every keystroke passes, and the
     * save button is dead in a way nobody notices until they press it.
     */
    records.push(
      check({
        id: `"${spec.id}-reveals"`,
        group: `"${spec.id}"`,
        what: `"the ${spec.component} toggle swaps in the inputs"`,
        open: surface,
        hover: "None",
        // The reveal mounts nodes; without a settle the assertion races the
        // paint. The other two checks get one via `prepare`, and this one
        // failed on a textbox its own siblings could type into.
        settle_after_ms: "300",
        click: `Some("${spec.subjectRole}:${spec.subject}")`,
        subject: `"${spec.opens}"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-defers"`,
        group: `"${spec.id}"`,
        what: `"typing into ${spec.component} does not commit on its own"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "300",
        click: "None",
        type_into: `Some("${spec.opens}")`,
        text: `Some("${spec.commitText}")`,
        subject: `"${spec.uncommitted}"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-commits"`,
        group: `"${spec.id}"`,
        what: `"saving ${spec.component} commits what was typed"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "300",
        type_into: `Some("${spec.opens}")`,
        text: `Some("${spec.commitText}")`,
        click: `Some("${spec.commit}")`,
        subject: `"${spec.committed}"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    /*
     * And that the panel said so.
     *
     * `-commits` reads the committed value, which is right but not sufficient:
     * a save refused by validation, or one that throws inside `apply`, leaves
     * that value exactly where it was and reports nothing. The fixture names
     * what the panel told its caller, so a silent refusal is a different
     * failure from a save that did not run.
     */
    records.push(
      check({
        id: `"${spec.id}-reports-saving"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} tells its caller the save succeeded"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "300",
        type_into: `Some("${spec.opens}")`,
        text: `Some("${spec.commitText}")`,
        click: `Some("${spec.commit}")`,
        subject: `"heading:Save outcome: saved"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    /*
     * And that the reconnect got the new settings, already persisted.
     *
     * `apply` promises to write storage and then hand the callback what was
     * written, which is what a callback that reloads or navigates depends
     * on. Neither half was asserted -- the fixture supplied no `onApply` at
     * all -- and the ordering half was broken: persistence ran in a deferred
     * effect a microtask after the reconnect, so a callback reading storage
     * saw the settings it was replacing. The fixture names both, so this
     * fails if either the argument or the order regresses.
     */
    records.push(
      check({
        id: `"${spec.id}-reconnects-with-what-it-saved"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} reconnects with the saved settings, already persisted"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "300",
        /*
         * Its own address, not `commitText`.
         *
         * The checks in a group share a host, so by the time this one runs
         * storage already holds what `-commits` saved. Reusing that value
         * made this pass with the write deleted -- measured -- because the
         * old contents and the expected contents were the same string. A
         * value only this check writes cannot be satisfied by what ran
         * before it.
         */
        type_into: `Some("${spec.opens}")`,
        text: `Some("${spec.reconnectText}")`,
        click: `Some("${spec.commit}")`,
        subject: `"heading:Reconnected: ${spec.reconnectText} over ${spec.reconnectText}"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
  }

  if (spec.kind === "overlay") {
    records.push(
      check({
        id: `"${spec.id}-opens"`,
        group: `"${spec.id}"`,
        what: `"activating ${spec.component} paints its portalled content"`,
        open: surface,
        hover: "None",
        click: `Some("${spec.subjectRole}:${spec.subject}")`,
        subject: `"${spec.opens}"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-escape-closes"`,
        group: `"${spec.id}"`,
        what: `"Escape closes ${spec.component} after it really opened"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        settle_after_ms: "600",
        click: "None",
        key: `Some("Escape")`,
        key_on: `Some("${spec.subjectRole}:${spec.subject}")`,
        subject: `"${spec.opens}"`,
        expect: "Vanishes",
      }),
    );
  }

  if (spec.kind === "tabs") {
    records.push(
      check({
        id: `"${spec.id}-changes"`,
        group: `"${spec.id}"`,
        what: `"activating another ${spec.component} tab changes selection"`,
        open: surface,
        hover: "None",
        click: `Some("${spec.activate}")`,
        subject: `"${spec.activate}"`,
        expect: "SelectionChanges",
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-changes-panel"`,
        group: `"${spec.id}"`,
        what: `"the selected ${spec.component} tab exposes its corresponding panel"`,
        open: surface,
        hover: "None",
        prepare: `Some("${spec.activate}")`,
        prepare_unless: `Some("${spec.opens}")`,
        click: "None",
        subject: `"${spec.opens}"`,
        expect: profile.paints("Paints"),
      }),
    );
  }

  if (spec.kind === "adjustment") {
    records.push(
      check({
        id: `"${spec.id}-changes"`,
        group: `"${spec.id}"`,
        what: `"activating a ${spec.component} adjustment changes its controlled selection"`,
        open: surface,
        hover: "None",
        click: `Some("${spec.subjectRole}:${spec.subject}")`,
        subject,
        expect: "SelectionChanges",
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
    /*
     * And that the callback ran.
     *
     * `-toggles` above compares the tree's `selected` before and after, which
     * the renderer flips on its own when a checkbox is clicked. A controlled
     * toggle whose `onChange` never fires satisfies it while doing nothing at
     * all -- which is exactly what Switch did under Blitz, where a click is
     * dispatched and a change is not. The fixture names the state it holds, so
     * this fails unless the component told it to change.
     */
    records.push(
      check({
        id: `"${spec.id}-reports"`,
        group: `"${spec.id}"`,
        what: `"pressing ${spec.component} runs its callback, not just its own state"`,
        open: surface,
        hover: "None",
        settle_after_ms: "300",
        click: `Some("${spec.subjectRole}:")`,
        /*
         * A latched marker, because the checks in a group share one host:
         * `-toggles` has already pressed this control by the time this runs, so
         * a node naming the current state would only be right when the number
         * of presses happened to be odd. The fixture raises this on the first
         * callback and never lowers it.
         */
        subject: `"heading:Callback ran"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
  }

  if (spec.kind === "field") {
    records.push(
      check({
        id: `"${spec.id}-accepts-input"`,
        group: `"${spec.id}"`,
        what: `"typing changes the value exposed by ${spec.component}"`,
        open: surface,
        hover: "None",
        click: "None",
        type_into: `Some("${spec.subjectRole}:${spec.subject}")`,
        text: `Some("QA outcome")`,
        subject,
        expect: "ValueChanges",
      }),
    );
    /*
     * And that the consumer heard about it.
     *
     * `-accepts-input` above reads the control's own value, which the renderer
     * updates whether or not the component reported anything. A field whose
     * `onInput` never reaches its caller is exactly as broken as one that
     * refuses keystrokes, and it passed that check. The fixture names the value
     * it received, so this one fails unless the component told it.
     */
    records.push(
      check({
        id: `"${spec.id}-reports-input"`,
        group: `"${spec.id}"`,
        what: `"${spec.component} reports what was typed to its caller"`,
        open: surface,
        hover: "None",
        click: "None",
        type_into: `Some("${spec.subjectRole}:${spec.subject}")`,
        text: `Some("QA outcome")`,
        subject: `"heading:Field value: QA outcome"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
  }

  if (spec.kind === "slider") {
    for (const [suffix, key] of [
      ["increments", "ArrowRight"],
      ["restores", "ArrowLeft"],
    ]) {
      records.push(
        check({
          id: `"${spec.id}-${suffix}"`,
          group: `"${spec.id}"`,
          what: `"${key} changes the value exposed by ${spec.component}"`,
          open: surface,
          hover: "None",
          click: "None",
          key: `Some("${key}")`,
          key_on: `Some("${spec.subjectRole}:${spec.subject}")`,
          subject,
          expect: "ValueChanges",
        }),
      );
    }

    records.push(
      check({
        id: `"${spec.id}-pointer-drag-changes-value"`,
        group: `"${spec.id}"`,
        what: `"dragging ${spec.component} changes the controlled value exposed by its caller"`,
        open: surface,
        hover: "None",
        click: "None",
        pointer_drag: `Some((from: "${spec.subjectRole}:${spec.subject}", dx: 160.0, dy: 0.0, steps: 6))`,
        subject,
        expect: "ValueChanges",
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-pointer-release-commits"`,
        group: `"${spec.id}"`,
        what: `"releasing a ${spec.component} drag reports one final value through onChangeEnd"`,
        open: surface,
        hover: "None",
        click: "None",
        pointer_drag: `Some((from: "${spec.subjectRole}:${spec.subject}", dx: 120.0, dy: 0.0, steps: 4))`,
        subject: `"heading:Slider committed:"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );

    for (const [suffix, key] of [
      ["goes-to-minimum", "Home"],
      ["goes-to-maximum", "End"],
      ["takes-a-large-step-down", "PageDown"],
      ["takes-a-large-step-up", "PageUp"],
    ]) {
      records.push(
        check({
          id: `"${spec.id}-${suffix}"`,
          group: `"${spec.id}"`,
          what: `"${key} changes the value exposed by ${spec.component}"`,
          open: surface,
          hover: "None",
          click: "None",
          key: `Some("${key}")`,
          key_on: `Some("${spec.subjectRole}:${spec.subject}")`,
          subject,
          expect: "ValueChanges",
        }),
      );
    }
  }

  if (spec.kind === "inline-edit") {
    records.push(
      check({
        id: `"${spec.id}-opens"`,
        group: `"${spec.id}"`,
        what: `"activating ${spec.component} opens its labelled editor"`,
        open: surface,
        hover: "None",
        click: `Some("${spec.subjectRole}:${spec.subject}")`,
        subject: `"${spec.opens}"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-commits"`,
        group: `"${spec.id}"`,
        what: `"Enter commits the edited value and closes the editor"`,
        open: surface,
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        hover: "None",
        click: "None",
        type_into: `Some("${spec.opens}")`,
        text: `Some("Renamed title")`,
        key: `Some("Enter")`,
        subject: `"heading:Committed title: Renamed title"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-escape-keeps-value"`,
        group: `"${spec.id}"`,
        what: `"Escape abandons a draft and keeps the committed value"`,
        open: surface,
        prepare: `Some("${spec.subjectRole}:${spec.subject}")`,
        prepare_unless: `Some("${spec.opens}")`,
        hover: "None",
        click: "None",
        type_into: `Some("${spec.opens}")`,
        text: `Some("Abandoned title")`,
        key: `Some("Escape")`,
        /*
         * What Escape promises, stated so nothing else has to be true.
         *
         * This named a committed value twice and was wrong both times: first
         * the one `-commits` writes, which is only there when the checks share
         * a host, then the fixture's own, which is only there when they do
         * not. Both are claims about what ran before rather than about Escape.
         *
         * The promise itself is negative -- the abandoned draft is not what
         * got committed -- and `Absent` says exactly that, whatever the
         * committed value happens to be.
         */
        subject: `"heading:Committed title: Abandoned title"`,
        expect: "Absent",
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
        expect: profile.paints("PaintsNamed"),
      }),
    );
    records.push(
      check({
        id: `"${spec.id}-acts"`,
        group: `"${spec.id}"`,
        what: `"activating ${spec.component} exposes the callback result"`,
        open: surface,
        hover: "None",
        click: `Some("${spec.subjectRole}:${spec.subject}")`,
        subject: `"heading:Action result: ${spec.component} complete"`,
        expect: profile.paints("PaintsNamed"),
      }),
    );
  }

  if (spec.kind === "calendar") {
    records.push(
      check({ id: '"calendar-selects-existing-cell"', group: '"calendar"',
        what: '"selecting a date updates the existing grid cell"',
        prepare: 'Some("gridcell:Sunday, June 15, 2025")',
        click: `Some(${subject})`, subject, expect: "SelectionChanges" }),
      check({ id: '"calendar-delivers-selected-value"', group: '"calendar"',
        what: '"the controlled consumer receives the selected date"',
        subject: '"status:Selected 2025-06-24"', expect: "Present" }),
      check({ id: '"calendar-reselects-original-date"', group: '"calendar"',
        what: '"another selection updates the original cell again"',
        click: 'Some("gridcell:Sunday, June 15, 2025")',
        subject: '"gridcell:Sunday, June 15, 2025"', expect: "SelectionChanges" }),
      check({ id: '"calendar-delivers-restored-value"', group: '"calendar"',
        what: '"the controlled consumer receives the restored date"',
        subject: '"status:Selected 2025-06-15"', expect: "Present" }),
    );
  }

  if (spec.kind === "form") {
    records.push(
      check({ id: '"form-refuses-invalid-input"', group: '"form"',
        what: '"a native submit exposes validation instead of saving invalid input"',
        click: `Some(${subject})`, subject: '"alert:Enter a positive quantity"', expect: "Present" }),
      check({ id: '"form-invalid-submit-does-not-save"', group: '"form"',
        what: '"the invalid submission never reaches the consumer callback"',
        subject: '"status:Not saved"', expect: "Present" }),
      check({ id: '"form-submits-transformed-value-once"', group: '"form"',
        what: '"one click submits the schema output as a number exactly once"',
        setup_type_into: 'Some("textbox:Quantity")', setup_text: 'Some("42")',
        click: `Some(${subject})`, subject: '"status:Saved 42:number:1"', expect: "Present" }),
      check({ id: '"form-clears-validation-after-correction"', group: '"form"',
        what: '"the corrected value clears the visible validation error"',
        subject: '"alert:Enter a positive quantity"', expect: "Absent" }),
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
        expect: profile.paints(described ? "PaintsNamed" : "Paints"),
      }),
    );
  }

  return [
    `// Generated from tests/qa-harness/components.ts by tests/qa-harness/generate-checks.ts. Do not edit.`,
    `//`,
    `// ${spec.component}, mounted alone on its own harness page. Outcomes for`,
    `// this component share one native host; idempotent preparation keeps each`,
    `// outcome reproducible by id against a fresh host as well.`,
    `[`,
    ...records,
    `]`,
    ``,
  ].join("\n");
}

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

validateComponentSpecs();

const expectedFiles = new Set(COMPONENTS.map((spec) => `${spec.id}.ron`));

for (const profile of PROFILES) {
  const outputDir = join(import.meta.dir, "..", profile.dir);
  mkdirSync(outputDir, { recursive: true });

  for (const file of readdirSync(outputDir)) {
    if (file.endsWith(".ron") && !expectedFiles.has(file)) {
      unlinkSync(join(outputDir, file));
      console.log(`removed stale ${join(outputDir, file)}`);
    }
  }

  for (const spec of COMPONENTS) {
    const path = join(outputDir, `${spec.id}.ron`);
    const body = checksFor(spec, profile);
    assertNoUnresolvedSubject(spec.id, body);
    writeFileSync(path, body);
  }
  console.log(
    `${profile.id}: ${COMPONENTS.length} component(s) -> ${profile.dir}/`,
  );
}

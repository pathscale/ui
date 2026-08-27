/*
 * Every component the harness can mount, and what a person can do to it.
 *
 * This is the whole authoring surface. Adding a component to QA means adding
 * one entry here: a kind, a name, and the props to mount it with. The page
 * mounts it alone, and `generate-checks.ts` turns the entry into the ps-qa
 * checks its kind requires. Nothing else is written per component.
 *
 * ## Why isolation
 *
 * Driving components inside the consuming application makes every check
 * order-dependent. Running the composer, select and rename groups in one
 * process leaves state behind: a pill left on `low` fails the next group's
 * "choosing medium changes the trigger" outright, and a dropdown left open
 * swallows the next group's first click. Those failures say nothing about the
 * component, and they are indistinguishable from real ones in a report.
 *
 * One component, one page, one fixture. The URL selects it, so a check restores
 * its own world by navigating rather than by undoing whatever it did.
 *
 * ## Kinds
 *
 * The kind decides which checks are generated, mirroring the templates in
 * AgencyZero's `tests/qa-templates/templates.ron`:
 *
 *   value  - carries a value a reader can see. Asserted on the control the
 *            reader looks at (the trigger), never on the option that was
 *            pressed: an option's own selected flag flips even when the value
 *            never reaches the trigger, which is how a Select that could not
 *            select passed 2/2.
 *   mode   - swaps one thing for another. Must prove it opens, does its work,
 *            and leaves by each exit a reader has.
 *   action - does something once and shows it happened.
 *   display- only ever paints.
 */

export type ComponentKind = "value" | "mode" | "action" | "display";

export type ComponentSpec = {
  /** URL id and check-id prefix. Kebab-case. */
  id: string;
  /** Exported name in `@pathscale/ui`. */
  component: string;
  kind: ComponentKind;
  /** Accessible name of the control a reader reads: the trigger, field or button. */
  subject: string;
  /** Role of that subject, so a check cannot assert on the wrong node. */
  subjectRole: string;
  /** For `value`/`mode`: the option or item to activate, as `role:name`. */
  activate?: string;
  /** For `mode`: the node that proves the mode opened, as `role:name`. */
  opens?: string;
  /** Mount props. Kept literal so the fixture is readable in one glance. */
  props: Record<string, unknown>;
  /** Option labels, for components that need children. */
  options?: { value: string; label: string }[];
};

export const COMPONENTS: ComponentSpec[] = [
  {
    id: "dropdown",
    component: "Dropdown",
    kind: "value",
    subject: "Effort",
    subjectRole: "button",
    activate: "menuitem:high",
    opens: "menuitem:low",
    props: { label: "Effort" },
    options: [
      { value: "low", label: "low" },
      { value: "medium", label: "medium" },
      { value: "high", label: "high" },
    ],
  },
  {
    id: "select",
    component: "Select",
    kind: "value",
    subject: "Session",
    subjectRole: "button",
    activate: "option:second fixture",
    opens: "option:first fixture",
    props: { label: "Session", placeholder: "Session" },
    options: [
      { value: "first", label: "first fixture" },
      { value: "second", label: "second fixture" },
    ],
  },
];

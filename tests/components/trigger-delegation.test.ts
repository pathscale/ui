import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A trigger that is handed a control must not wrap it in a second one.
 *
 * `Popover.Trigger` and `Drawer.Trigger` each render a `button`. That is right
 * when the trigger is a word or a glyph, and wrong the moment a call site
 * hands one a control, which is the common way both are written:
 *
 *   <Popover.Trigger><Button>Filters</Button></Popover.Trigger>
 *   <Drawer.Trigger><Button>Menu</Button></Drawer.Trigger>
 *
 * The popover form was measured on three separate sites, emitting an
 * anonymous twin button at identical coordinates carrying
 * `slot=popover-trigger`; the drawer form put `slot=drawer-trigger` around
 * `slot=button` at an identical box with an identical name, so every trigger
 * was announced twice. Nested interactive content is invalid HTML either way,
 * and a press by coordinate lands on the outer element rather than on the
 * control that was written.
 *
 * `as` makes the control *be* the trigger, so one element carries the name,
 * the box and the wiring.
 *
 * ## Why the default branch is still a literal element
 *
 * Only the delegate branch is a `Dynamic`. `Button` already found that a
 * `Dynamic` over a *string* element painted correctly under Blitz and dropped
 * a nested consumer's event binding, leaving an enabled control that
 * acknowledged activation without running its handler. On the element that
 * opens a popover or a drawer that is the entire component, so the ordinary
 * path keeps the literal `<button>` it always had and nothing about it
 * changes. `Dynamic` over a *component* is the shape Alert, Navbar and
 * AvatarGroup already ship.
 */
const read = (component: string, file: string) =>
  readFileSync(
    join(import.meta.dir, "..", "..", "src", "components", component, file),
    "utf8",
  ).replace(/\/\*[\s\S]*?\*\//g, "");

const TRIGGERS = [
  {
    name: "Popover.Trigger",
    source: read("popover", "Popover.layout.tsx"),
    marker: "const PopoverTrigger:",
    ends: "export type PopoverContentProps",
    slot: 'data-slot="popover-trigger"',
  },
  {
    name: "Drawer.Trigger",
    source: read("drawer", "Drawer.layout.tsx"),
    marker: "const DrawerTrigger:",
    ends: "const DrawerContent:",
    slot: 'data-slot="drawer-trigger"',
  },
];

for (const trigger of TRIGGERS) {
  const body = trigger.source.slice(
    trigger.source.indexOf(trigger.marker),
    trigger.source.indexOf(trigger.ends),
  );

  describe(`${trigger.name} can delegate to the control it is given`, () => {
    it("declares the prop", () => {
      expect(trigger.source).toContain("as?: ValidComponent;");
    });

    it("renders the delegate instead of wrapping it", () => {
      expect(body).toContain("<Show");
      expect(body).toContain("when={props.as}");
      expect(body).toContain("component={props.as as ValidComponent}");
    });

    it("keeps a bare trigger a literal button", () => {
      const fallback = body.slice(
        body.indexOf("fallback={"),
        body.indexOf("}\n    >"),
      );
      expect(fallback).toContain("<button");
      expect(fallback).toContain(trigger.slot);
      expect(fallback).not.toContain("Dynamic");
    });

    /*
     * The delegate is the trigger, so the wiring has to reach it. Reaching the
     * wrapper instead is the defect with a different element around it.
     */
    it("hands the delegate the click handler", () => {
      const delegate = body.slice(body.indexOf("<Dynamic"));
      expect(delegate).toContain("onClick={handleClick}");
    });

    it("keeps `as` off the rendered attributes", () => {
      const omitted = body.slice(
        body.indexOf("omit("),
        body.indexOf(");", body.indexOf("omit(")),
      );
      expect(omitted).toContain('"as"');
    });

    /*
     * The trigger's own class is a button reset -- `border: 0`, `background:
     * none`, `font: inherit` -- which is what a bare `<button>` needs and what
     * a real control must not be given. Handing it to a Button would erase the
     * fill it exists to paint.
     */
    it("does not put the button reset on the delegate", () => {
      const delegate = body.slice(body.indexOf("<Dynamic"));
      expect(delegate).not.toContain("CLASSES.slot.trigger");
      expect(delegate).not.toContain("CLASSES.Trigger.base");
      expect(delegate).toContain("class={props.class}");
    });
  });
}

describe("Popover.Trigger keeps its dialog wiring on the delegate", () => {
  const body = TRIGGERS[0].source.slice(
    TRIGGERS[0].source.indexOf(TRIGGERS[0].marker),
    TRIGGERS[0].source.indexOf(TRIGGERS[0].ends),
  );
  const delegate = body.slice(body.indexOf("<Dynamic"));

  it("still announces what it opens and whether it is open", () => {
    expect(delegate).toContain('aria-haspopup="dialog"');
    expect(delegate).toContain("aria-expanded=");
    expect(delegate).toContain("aria-controls=");
  });

  /*
   * The id is what `Popover.Content` falls back to for its own name, and the
   * ref is what positions the overlay. A delegate missing either leaves an
   * unnamed dialog or one anchored at the origin.
   */
  it("still gives the popover its id and its ref", () => {
    expect(delegate).toContain("id={ctx.triggerId()}");
    expect(delegate).toContain("ctx.setTriggerRef(el)");
  });
});

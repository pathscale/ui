import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import { readBuiltApi, readDocumentedApi } from "../scripts/check-api-contract";

/**
 * Holds the API contract *and its extractor* to account.
 *
 * `bun run check:api` already compares `docs/api-contract.md` against the
 * build, and it passed for weeks while 26 of 180 entries claimed a component
 * had no props at all. Six of those declare between 13 and 17. The check could
 * not see it, because it compares two things that were both derived from the
 * same blind extractor: when the extractor returned nothing, the document
 * recorded nothing, and nothing agreed with nothing.
 *
 * So the comparison is only half of it. The other half is asserting that the
 * extractor still resolves the type shapes it has been broken by before, which
 * a doc-versus-build diff can never do for itself.
 */

const HAS_BUILD = existsSync("dist/index.d.ts");
const NEED_BUILD =
  "dist/ is missing. Run `bun run build` first; these assertions read the shipped declarations.";

/**
 * Props that must survive extraction, chosen one per shape that has broken.
 *
 * Not an exhaustive list of each component's API - that is what
 * `docs/api-contract.md` is for. These are the specific resolutions that
 * regressed, so a future rewrite of the extractor fails here by name instead
 * of quietly emptying the document.
 */
const MUST_RESOLVE: Array<{
  component: string;
  props: string[];
  shape: string;
}> = [
  {
    component: "Slider",
    props: ["min", "max", "step", "value", "onChange", "onChangeEnd"],
    shape:
      "SliderBaseProps & UIBaseProps & Omit<JSX.…> - no literal of its own",
  },
  {
    component: "Calendar",
    props: ["value", "minValue", "maxValue", "locale", "selectionMode"],
    shape: "Omit<JSX.…> & UIBaseProps & CalendarBaseProps",
  },
  {
    component: "DateRangePicker",
    props: ["value", "onChange", "startName", "endName"],
    shape: "same, and the widest of them",
  },
  {
    component: "Button",
    props: ["variant", "flavor", "size", "width", "radius", "state", "type"],
    shape: "inline literal, and the name is also imported by Toast",
  },
  {
    component: "ToastCloseButton",
    props: ["variant", "state"],
    shape: "Omit<CloseButtonProps, …> - a lookup with subtraction",
  },
];

/**
 * Components whose props really are HTML attributes plus `UIBaseProps`.
 *
 * The mirror of the list above: a fix that starts inventing props is as wrong
 * as one that loses them, and `GlowCard` resolving to a prop list would mean
 * the intersection walk had begun reporting the HTML bag.
 */
const MUST_STAY_EMPTY = ["GlowCard", "MeterFill", "LinkIcon", "DrawerHandle"];

describe("API contract", () => {
  it("has a build to read", () => {
    expect(HAS_BUILD, NEED_BUILD).toBeTrue();
  });

  it("matches the shipped types in both directions", () => {
    expect(HAS_BUILD, NEED_BUILD).toBeTrue();
    const built = readBuiltApi();
    const documented = readDocumentedApi();

    const drift: string[] = [];
    for (const [name, props] of built) {
      const promised = documented.get(name);
      if (!promised) {
        drift.push(`${name} is exported but undocumented`);
        continue;
      }
      for (const p of props) {
        if (!promised.includes(p))
          drift.push(`${name}.${p} ships but is undocumented`);
      }
      for (const p of promised) {
        if (!props.includes(p))
          drift.push(`${name}.${p} is documented but not exported`);
      }
    }
    for (const name of documented.keys()) {
      if (!built.has(name))
        drift.push(`${name} is documented but not exported`);
    }

    expect(
      drift,
      "run `bun run check:api -- --write` and commit the diff",
    ).toEqual([]);
  });

  it.each(MUST_RESOLVE)("resolves $component's props through: $shape", ({
    component,
    props,
  }) => {
    expect(HAS_BUILD, NEED_BUILD).toBeTrue();
    const built = readBuiltApi().get(component);
    expect(built, `${component} is not in the built API at all`).toBeDefined();
    for (const prop of props) {
      expect(built, `${component}.${prop} was not extracted`).toContain(prop);
    }
  });

  it("does not invent props for components that only take HTML attributes", () => {
    expect(HAS_BUILD, NEED_BUILD).toBeTrue();
    const built = readBuiltApi();
    for (const name of MUST_STAY_EMPTY) {
      expect(
        built.get(name),
        `${name} should resolve to no props of its own`,
      ).toEqual([]);
    }
  });

  /**
   * The blunt instrument, and the one that would have caught the original bug
   * on its own. An empty list is a real assertion, so some entries are
   * legitimately empty; what is not legitimate is the number climbing, which is
   * what happens when the extractor loses the ability to resolve a shape.
   */
  it("keeps the number of no-prop components from growing", () => {
    expect(HAS_BUILD, NEED_BUILD).toBeTrue();
    const empty = [...readBuiltApi()]
      .filter(([, props]) => props.length === 0)
      .map(([name]) => name);
    expect(
      empty.length,
      `components resolving to no props: ${empty.join(", ")}. If one genuinely lost its last prop, lower this number in the same commit.`,
    ).toBeLessThanOrEqual(19);
  });
});

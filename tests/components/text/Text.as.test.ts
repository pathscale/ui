import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * A title styled as a heading has to be able to *be* one.
 *
 * `Text` rendered a `span` and nothing else, so `family="heading"` set the
 * text in the heading face and left the document flat. Sites read the two as
 * one thing, and the result was pages -- landing pages included -- with no
 * heading of any role anywhere on them, and no way for a reader to move
 * between sections. Found on multiple sites independently, which is what makes
 * it the component's problem rather than each site's.
 *
 * `family` is a typeface and `as` is the document. Two axes, because they are
 * two questions: a caption can be set in the display face without being a
 * heading, and an `h2` can be set in the body face.
 *
 * ## Why `as`, and not `Heading` components
 *
 * A `Text.Heading` or a separate `<Heading level={2}>` would be a second way
 * to write a title, and every one of the fleet's existing `family="heading"`
 * call sites would still be wrong -- each would need finding, and rewriting to
 * a different component with a different prop set. `as` fixes exactly those
 * call sites with a one-token edit, on the component they already use.
 *
 * It also cannot drift. Two components mean two places where size, weight,
 * tracking and leading are decided, and they diverge; one component with two
 * axes has one place. The axis that decides the face and the axis that decides
 * the element sit next to each other in the same props table, which is the
 * clearest statement that they are different questions.
 *
 * The list is closed rather than `keyof JSX.IntrinsicElements`. The prop
 * exists to make a title a heading, and an open list makes that one option
 * among two hundred, most of which are wrong for a run of text.
 */
const SOURCE = readFileSync(
  join(import.meta.dir, "../../../src/components/text/Text.layout.tsx"),
  "utf8",
);

const CODE = SOURCE.replace(/\/\*[\s\S]*?\*\//g, "");

const BARREL = readFileSync(
  join(import.meta.dir, "../../../src/components/text/index.ts"),
  "utf8",
);

const ROOT = readFileSync(
  join(import.meta.dir, "../../../src/index.ts"),
  "utf8",
);

describe("Text.as", () => {
  it("offers every heading level", () => {
    const union = CODE.slice(
      CODE.indexOf("export type TextAs ="),
      CODE.indexOf(";", CODE.indexOf("export type TextAs =")),
    );
    for (const level of ["h1", "h2", "h3", "h4", "h5", "h6"]) {
      expect(union, `TextAs cannot render ${level}`).toContain(`"${level}"`);
    }
  });

  it("keeps the list closed", () => {
    expect(CODE).not.toContain("as?: keyof JSX.IntrinsicElements");
    expect(CODE).toContain("as?: TextAs;");
  });

  it("stays a span when nothing asks otherwise", () => {
    expect(CODE).toContain('const tag = () => props.as ?? "span";');
  });

  it("renders the element the prop names", () => {
    expect(CODE).toContain("component={tag()}");
    expect(CODE).not.toMatch(/<span\s+\{\.\.\.others\}/);
  });

  it("keeps `as` off the rendered attributes", () => {
    const omitted = CODE.slice(
      CODE.indexOf("omit("),
      CODE.indexOf(");", CODE.indexOf("omit(")),
    );
    expect(omitted).toContain('"as"');
  });

  it("still carries the typeface as its own axis", () => {
    expect(CODE).toContain("data-family={props.family}");
    expect(CODE).toContain("family?: TextFamily;");
  });

  it("exports the type a consumer needs to name the prop", () => {
    expect(BARREL).toContain("type TextAs");
    expect(ROOT).toContain("TextAs");
  });
});

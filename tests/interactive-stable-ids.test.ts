import { describe, expect, it } from "bun:test";

const slider = await Bun.file(
  new URL("../src/components/slider/Slider.layout.tsx", import.meta.url),
).text();
const wheel = await Bun.file(
  new URL("../src/components/color-wheel/ComplexColorWheel.layout.tsx", import.meta.url),
).text();
const flower = await Bun.file(
  new URL("../src/components/color-wheel-flower/ColorWheelFlower.layout.tsx", import.meta.url),
).text();
const select = await Bun.file(
  new URL("../src/components/select/Select.layout.tsx", import.meta.url),
).text();
const inlineEdit = await Bun.file(
  new URL("../src/components/inline-edit/InlineEdit.layout.tsx", import.meta.url),
).text();

describe("interactive stable ids", () => {
  it("puts a Slider id on the semantic thumb", () => {
    expect(slider).toContain("id={props.id}");
    expect(slider).toContain("role=\"slider\"");
    expect(slider).toContain("`${props.id}-label`");
  });

  it("derives every complex wheel control id from its caller-owned base", () => {
    expect(wheel).toContain("id={local.id}");
    expect(wheel).toContain("`${local.id}-${adjustment().id}`");
    expect(wheel).toContain("`${local.id}-${adjustment().id}-${stopIndex()}`");
    expect(flower).toContain("`${props.id}-petal-${index()}`");
  });

  it("uses a caller-owned Select id as the trigger/listbox base", () => {
    expect(select).toContain("const baseId = props.id || generatedId");
    expect(select).toContain("`${baseId}-trigger`");
    expect(select).toContain("`${baseId}-listbox`");
  });

  it("derives both InlineEdit control ids from its caller-owned base", () => {
    expect(inlineEdit).toContain("`${props.id}-trigger`");
    expect(inlineEdit).toContain("`${props.id}-field`");
  });
});

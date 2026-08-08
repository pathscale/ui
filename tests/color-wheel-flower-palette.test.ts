import { describe, expect, it } from "bun:test";
import {
  COLOR_WHEEL_FLOWER_COLOR_COUNT,
  COLOR_WHEEL_FLOWER_PALETTES,
  resolveColorWheelFlowerPalette,
} from "../src/components/color-wheel-flower/ColorWheelFlower.palette";
import { parseColor } from "../src/components/color-wheel-flower/ColorUtils";

const averageLightness = (colors: readonly string[]) =>
  colors.reduce((total, color) => total + (parseColor(color)?.hsl.l ?? 0), 0) /
  colors.length;

describe("ColorWheelFlower palettes", () => {
  it("provides a literal color for every flower position", () => {
    expect(COLOR_WHEEL_FLOWER_PALETTES.light).toHaveLength(
      COLOR_WHEEL_FLOWER_COLOR_COUNT,
    );
    expect(COLOR_WHEEL_FLOWER_PALETTES.dark).toHaveLength(
      COLOR_WHEEL_FLOWER_COLOR_COUNT,
    );
    for (const color of [
      ...COLOR_WHEEL_FLOWER_PALETTES.light,
      ...COLOR_WHEEL_FLOWER_PALETTES.dark,
    ]) {
      expect(parseColor(color)?.hex.toUpperCase()).toBe(color);
    }
  });

  it("keeps the dark palette materially darker than the light palette", () => {
    expect(
      averageLightness(COLOR_WHEEL_FLOWER_PALETTES.light) -
        averageLightness(COLOR_WHEEL_FLOWER_PALETTES.dark),
    ).toBeGreaterThan(20);
    expect(
      COLOR_WHEEL_FLOWER_PALETTES.dark
        .slice(0, 12)
        .every((color) => parseColor(color)?.hsl.l === 22),
    ).toBe(true);
    expect(
      COLOR_WHEEL_FLOWER_PALETTES.dark
        .slice(12, 24)
        .every((color) => parseColor(color)?.hsl.l === 33),
    ).toBe(true);
    expect(
      COLOR_WHEEL_FLOWER_PALETTES.dark
        .slice(24, 30)
        .every((color) => parseColor(color)?.hsl.l === 44),
    ).toBe(true);
  });

  it("accepts a complete custom palette and rejects partial palettes", () => {
    const custom = Array.from(
      { length: COLOR_WHEEL_FLOWER_COLOR_COUNT },
      () => "#123456",
    );
    expect(resolveColorWheelFlowerPalette("dark", custom)).toBe(custom);
    expect(resolveColorWheelFlowerPalette("dark", custom.slice(1))).toBe(
      COLOR_WHEEL_FLOWER_PALETTES.dark,
    );
  });
});

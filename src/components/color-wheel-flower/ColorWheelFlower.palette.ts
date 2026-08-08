import { createColorFromHsl } from "./ColorUtils";

export type ColorWheelFlowerMode = "light" | "dark";

export const COLOR_WHEEL_FLOWER_COLOR_COUNT = 31;

const RING_HUES = [42, 24, 4, 336, 300, 268, 238, 210, 184, 162, 132, 94];
const INNER_HUES = [30, 330, 270, 210, 150, 90];

const hslHex = (hue: number, saturation: number, lightness: number) =>
  createColorFromHsl(hue, saturation, lightness).hex.toUpperCase();

const createPalette = (mode: ColorWheelFlowerMode): readonly string[] => {
  const levels = mode === "dark" ? [28, 40, 52] : [52, 66, 80];
  return [
    ...RING_HUES.map((hue) => hslHex(hue, 72, levels[0])),
    ...RING_HUES.map((hue) => hslHex(hue, 68, levels[1])),
    ...INNER_HUES.map((hue) => hslHex(hue, 55, levels[2])),
    mode === "dark" ? "#30343B" : "#F1F3F5",
  ];
};

/**
 * Default literal palettes. Dark mode stays dark-oriented; light mode uses
 * the same hue positions at materially lighter levels.
 */
export const COLOR_WHEEL_FLOWER_PALETTES = {
  light: createPalette("light"),
  dark: createPalette("dark"),
} satisfies Record<ColorWheelFlowerMode, readonly string[]>;

export function resolveColorWheelFlowerPalette(
  mode: ColorWheelFlowerMode,
  palette?: readonly string[],
): readonly string[] {
  return palette?.length === COLOR_WHEEL_FLOWER_COLOR_COUNT
    ? palette
    : COLOR_WHEEL_FLOWER_PALETTES[mode];
}

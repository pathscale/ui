import { type Accessor, createContext, useContext } from "solid-js";
import type { ColorFormat, ColorValue } from "./ColorUtils";

export interface ColorPickerContextType {
  color: Accessor<ColorValue>;
  format: Accessor<ColorFormat>;
  disabled: Accessor<boolean>;
  onChange: (color: ColorValue) => void;
  onFormatChange: (format: ColorFormat) => void;
}

/*
 * The default is `null`, and it has to be something.
 *
 * Solid 2 treats `createContext(undefined)` as the *default-less* form: the
 * absence of a default is what makes `useContext` throw `ContextNotFoundError`
 * outside a provider. This context was declared `createContext<T | undefined>(undefined)`
 * and paired with a hook that checked for a missing value and threw a friendly
 * message -- a check that could never run, because `useContext` threw first.
 * The friendly message also named `ColorPickerContext.Provider`, which Solid 2
 * does not have.
 *
 * What that cost: `ColorWheelFlower` is exported from `@pathscale/ui/lab`, and
 * rendering one outside a `ThemeColorPicker` did not degrade or warn. It threw
 * during render, which in Solid 2 halts the reactive system for the whole
 * page. One component on one route took an entire application down.
 */
export const ColorPickerContext = createContext<ColorPickerContextType | null>(
  null,
);

/**
 * The surrounding picker's state, or `null` when there is no picker.
 *
 * Returning `null` rather than throwing is deliberate: a consumer that can
 * stand alone decides for itself what to do without a provider, and one that
 * genuinely cannot say so in its own words.
 */
export function useColorPickerContext(): ColorPickerContextType | null {
  return useContext(ColorPickerContext);
}

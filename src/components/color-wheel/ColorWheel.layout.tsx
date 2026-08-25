import "./ColorWheel.css";
import type { JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import {
  type ColorFormat,
  ColorPickerContext,
  type ColorPickerContextType,
  type ColorValue,
  ColorWheelFlower,
  type ColorWheelFlowerMode,
} from "../color-wheel-flower";
import { parseColor } from "../color-wheel-flower/ColorUtils";
import { colorWheel } from "./ColorWheel.recipe";

interface ColorWheelBaseProps {
  /** The literal selected colour. */
  value: string;
  /** Receives the normalized literal hex displayed by the selected petal. */
  onChange: (value: string) => void;
  /** Explicit mode. Omit to follow the root `data-theme`. */
  mode?: ColorWheelFlowerMode;
  /** Exactly 31 literal colours: outer ring, middle ring, inner ring, centre. */
  palette?: readonly string[];
  isDisabled?: boolean;
  class?: string;
  wheelClass?: string;
  /** Draw the halo around the petals. On by default. */
  ring?: boolean;
  "aria-label"?: string;
}

export type ColorWheelProps = ColorWheelBaseProps &
  Omit<
    JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>,
    keyof ColorWheelBaseProps | "onChange"
  >;

const FALLBACK = parseColor("#ffffff") as ColorValue;

/** A controlled literal colour wheel. */
export const ColorWheelLayout: Layout<
  typeof colorWheel,
  ColorWheelProps
> = () => {
  const others = omit(
    props,
    "value",
    "onChange",
    "mode",
    "palette",
    "isDisabled",
    "class",
    "wheelClass",
    "ring",
    "aria-label",
  );
  const color = createMemo(() => parseColor(local.value) ?? FALLBACK);
  const context = (): ColorPickerContextType => ({
    color,
    format: () => "hex" as ColorFormat,
    disabled: () => Boolean(local.isDisabled),
    onChange: (next) => local.onChange(next.hex),
    onFormatChange: () => {},
  });

  return (
    <fieldset
      {...others}
      {...slot.root}
      aria-label={local["aria-label"] ?? "Colour"}
      data-disabled={local.isDisabled ? "" : undefined}
    >
      <ColorPickerContext value={context()}>
        <ColorWheelFlower
          class={local.wheelClass}
          ring={local.ring}
          mode={local.mode}
          palette={local.palette}
        />
      </ColorPickerContext>
    </fieldset>
  );
};

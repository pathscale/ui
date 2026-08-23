import type { JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import { twMerge } from "../../lib/twMerge";
import {
  ColorPickerContext,
  ColorWheelFlower,
  type ColorWheelFlowerMode,
  type ColorFormat,
  type ColorPickerContextType,
  type ColorValue,
} from "../color-wheel-flower";
import { parseColor } from "../color-wheel-flower/ColorUtils";

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
  "aria-label"?: string;
}

export type ColorWheelProps = ColorWheelBaseProps &
  Omit<JSX.FieldsetHTMLAttributes<HTMLFieldSetElement>, keyof ColorWheelBaseProps | "onChange">;

const FALLBACK = parseColor("#ffffff") as ColorValue;

/**
 * A controlled literal colour wheel.
 *
 * `ColorWheelFlower` remains the low-level context consumer. This is the
 * ordinary application surface: value in, normalized value out, no private
 * picker context for every consumer to recreate.
 */
export function ColorWheel(props: ColorWheelProps): JSX.Element {
  const local = props;
  const others = omit(
    props,
    "value",
    "onChange",
    "mode",
    "palette",
    "isDisabled",
    "class",
    "wheelClass",
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
      class={twMerge("color-wheel", local.class)}
      aria-label={local["aria-label"] ?? "Colour"}
      data-slot="color-wheel"
      data-disabled={local.isDisabled ? "" : undefined}
    >
      <ColorPickerContext value={context()}>
        <ColorWheelFlower
          class={local.wheelClass}
          mode={local.mode}
          palette={local.palette}
        />
      </ColorPickerContext>
    </fieldset>
  );
}
import "./ColorWheel.css";

import {
  type JSX,
  Show,
  createSignal,
  createMemo,
  splitProps,
} from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ColorPickerContext } from "./colorpickerContext";
import type { ColorFormat, ColorValue } from "./ColorUtils";
import { parseColor, getDefaultColor, formatColor } from "./ColorUtils";
import SaturationBrightness from "./SaturationBrightness";
import HueSlider from "./HueSlider";
import AlphaSlider from "./AlphaSlider";
import ColorWheel from "./ColorWheel";
import LightnessSlider from "./LightnessSlider";
import ColorSwatches from "./ColorSwatches";
import ColorInput from "./ColorInput";
import ColorPreview from "./ColorPreview";
import { IComponentBaseProps } from "../types";
import { MotionDiv, motionPresets } from "../../motion";

export type { ColorFormat } from "./ColorUtils";
export type ColorPickerMode = "picker" | "wheel";

export interface ColorPickerProps extends IComponentBaseProps {
  value?: string;
  onChange?: (color: string) => void;
  format?: ColorFormat;
  disabled?: boolean;
  swatches?: string[];
  showAlpha?: boolean;
  placement?: "top" | "bottom" | "left" | "right";
  initialMode?: ColorPickerMode;
  "aria-label"?: string;
}

const DEFAULT_SWATCHES = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#FFA07A",
  "#98D8C8",
  "#F7DC6F",
  "#BB8FCE",
  "#85929E",
  "#FF5733",
  "#C70039",
  "#900C3F",
  "#581845",
  "#2ECC71",
  "#3498DB",
  "#9B59B6",
  "#E74C3C",
];

const ColorPicker = (props: ColorPickerProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "value",
    "onChange",
    "format",
    "disabled",
    "swatches",
    "showAlpha",
    "placement",
    "initialMode",
    "class",
    "className",
    "dataTheme",
    "style",
    "aria-label",
  ]);

  const [isOpen, setIsOpen] = createSignal(false);
  const [internalColor, setInternalColor] = createSignal<ColorValue>(
    getDefaultColor()
  );
  const [currentFormat, setCurrentFormat] = createSignal<ColorFormat>(
    local.format || "hex"
  );
  const [mode, setMode] = createSignal<ColorPickerMode>(
    local.initialMode || "picker"
  );

  let containerRef: HTMLDivElement | undefined;

  const color = createMemo(() => {
    if (local.value) {
      const parsed = parseColor(local.value);
      if (parsed) {
        setInternalColor(parsed);
        return parsed;
      }
    }
    return internalColor();
  });

  const handleColorChange = (newColor: ColorValue) => {
    setInternalColor(newColor);
    if (local.onChange) {
      const formatted = formatColor(newColor, currentFormat());
      local.onChange(formatted);
    }
  };

  const handleFormatChange = (newFormat: ColorFormat) => {
    setCurrentFormat(newFormat);
    if (local.onChange) {
      const formatted = formatColor(color(), newFormat);
      local.onChange(formatted);
    }
  };

  const togglePicker = () => {
    if (!local.disabled) {
      setIsOpen(!isOpen());
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) {
      setIsOpen(false);
      e.preventDefault();
    }
  };


  const contextValue = {
    color,
    format: currentFormat,
    disabled: () => local.disabled || false,
    onChange: handleColorChange,
    onFormatChange: handleFormatChange,
  };

  const containerClasses = () =>
    twMerge(
      "relative inline-block",
      clsx({
        "opacity-50": local.disabled,
      }),
      local.class,
      local.className
    );

  const popoverClasses = () => {
    const base =
      "z-50 p-4 bg-base-100 rounded-lg shadow-xl border border-base-300 min-w-[280px]";


    return twMerge(
      base,
      "absolute mt-2",
      clsx({
        "bottom-full mb-2 mt-0": local.placement === "top",
        "top-full mt-2": local.placement === "bottom" || !local.placement,
        "right-full mr-2": local.placement === "left",
        "left-full ml-2": local.placement === "right",
      })
    );
  };

  const ModeSwitcher = () => (
    <div class="flex p-1 mb-3 bg-base-200 rounded-md">
      <button
        type="button"
        class={clsx(
          "flex-1 px-3 py-1 text-xs font-medium rounded-sm transition-colors",
          {
            "bg-base-100 shadow-sm text-base-content": mode() === "picker",
            "text-base-content/60 hover:text-base-content": mode() !== "picker",
          }
        )}
        onClick={() => setMode("picker")}
      >
        Gradient
      </button>
      <button
        type="button"
        class={clsx(
          "flex-1 px-3 py-1 text-xs font-medium rounded-sm transition-colors",
          {
            "bg-base-100 shadow-sm text-base-content": mode() === "wheel",
            "text-base-content/60 hover:text-base-content": mode() !== "wheel",
          }
        )}
        onClick={() => setMode("wheel")}
      >
        Wheel
      </button>
    </div>
  );

  const PopoverContent = () => (
    <MotionDiv
      initial={motionPresets.fadeUp.initial}
      animate={motionPresets.fadeUp.animate}
      exit={motionPresets.fadeUp.exit}
      transition={motionPresets.fadeUp.transition}
      class={popoverClasses()}
    >
      <ModeSwitcher />

      <div class="space-y-4">
        <Show when={mode() === "picker"}>
          <SaturationBrightness />
          <HueSlider />
        </Show>

        <Show when={mode() === "wheel"}>
          <ColorWheel />
          <LightnessSlider />
        </Show>

        <Show when={local.showAlpha}>
          <AlphaSlider />
        </Show>

        <ColorInput />

        <Show when={local.swatches || DEFAULT_SWATCHES}>
          <div class="pt-2 border-t border-base-300">
            <ColorSwatches swatches={local.swatches || DEFAULT_SWATCHES} />
          </div>
        </Show>
      </div>
    </MotionDiv>
  );

  return (
    <ColorPickerContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        class={containerClasses()}
        data-theme={local.dataTheme}
        style={local.style}
        onKeyDown={handleKeyDown}
        {...others}
      >
        <ColorPreview
          color={color()}
          disabled={local.disabled}
          onClick={togglePicker}
          aria-label={local["aria-label"] || "Color picker"}
        />

        <Show when={isOpen() && !local.disabled}>
           <PopoverContent />
        </Show>

        <Show when={isOpen() && !local.disabled}>
          <div
            class="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
        </Show>
      </div>
    </ColorPickerContext.Provider>
  );
};

export default ColorPicker;

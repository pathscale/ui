import { type Component, type JSX, Show, createSignal, createMemo, createEffect, onCleanup } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ColorValue, ColorPickerContextType, ColorFormat } from "../colorpicker";
import { ColorPickerContext, ColorWheelFlower } from "../colorpicker";
import Button from "../button";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";
import { createHueShiftStore, type HueShiftStore } from "./hueShift";

export interface ThemeColorPickerProps extends IComponentBaseProps {
  /**
   * Prefix for localStorage keys (e.g., "myapp" becomes "myapp_hue_shift")
   * @default "theme"
   */
  storagePrefix?: string;
  /**
   * Callback when color changes
   */
  onColorChange?: (hue: number | null, saturation: number) => void;
  /**
   * ARIA label for the button
   */
  "aria-label"?: string;
  /**
   * Custom button content (defaults to palette icon)
   */
  children?: JSX.Element;
}

// Convert hue and saturation to a ColorValue for the picker
function hueToColorValue(hue: number | null, sat: number): ColorValue {
  const h = hue ?? 0;
  const s = hue === null ? 0 : sat;
  return {
    rgb: { r: 255, g: 255, b: 255, a: 1 },
    hsl: { h, s, l: 50, a: 1 },
    hex: "#ffffff",
  };
}

const ThemeColorPicker: Component<ThemeColorPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [featureAvailable, setFeatureAvailable] = createSignal(true);
  let containerRef: HTMLDivElement | undefined;

  // Create store with configurable prefix
  const store = createMemo<HueShiftStore>(() =>
    createHueShiftStore(props.storagePrefix ?? "theme")
  );

  // Track color value for the picker
  const colorValue = createMemo(() =>
    hueToColorValue(store().hueShift(), store().hueSaturation())
  );

  const handleColorChange = (color: ColorValue) => {
    const hue = color.hsl.h;
    const saturation = color.hsl.s;
    // Check if it's the white center (low saturation = reset)
    if (saturation < 10 && color.hsl.l > 90) {
      store().setHueShift(null);
      props.onColorChange?.(null, 100);
    } else {
      store().setHueShift(hue, saturation);
      props.onColorChange?.(hue, saturation);
    }
  };

  // Close on outside click
  createEffect(() => {
    if (!isOpen()) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef && !containerRef.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    // Delay to avoid immediate close from the button click
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    onCleanup(() => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    });
  });

  // Close on Escape
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) {
      setIsOpen(false);
    }
  };

  // Check availability on mount
  createEffect(() => {
    const timer = setTimeout(() => {
      setFeatureAvailable(store().isAvailable());
    }, 0);
    onCleanup(() => clearTimeout(timer));
  });

  const contextValue = (): ColorPickerContextType => ({
    color: colorValue,
    format: () => "hsl" as ColorFormat,
    disabled: () => false,
    onChange: handleColorChange,
    onFormatChange: () => {},
  });

  const classes = () =>
    twMerge(
      "relative",
      clsx(props.class, props.className)
    );

  return (
    <Show when={featureAvailable()}>
      <div ref={containerRef} class={classes()} onKeyDown={handleKeyDown} style={props.style}>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsOpen(!isOpen())}
          aria-label={props["aria-label"] ?? "Change theme color"}
          aria-expanded={isOpen()}
        >
          {props.children ?? (
            <Icon
              name="icon-[mdi--palette]"
              width={16}
              height={16}
              class={store().hueShift() !== null ? "text-primary" : undefined}
            />
          )}
        </Button>

        <Show when={isOpen()}>
          <div class="absolute right-0 mt-2 p-4 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50">
            <ColorPickerContext.Provider value={contextValue()}>
              <ColorWheelFlower class="color-wheel-custom" />
            </ColorPickerContext.Provider>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default ThemeColorPicker;

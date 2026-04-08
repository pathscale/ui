import { type Component, type JSX, Show, createSignal, createMemo, createEffect, onCleanup, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ColorValue, ColorPickerContextType, ColorFormat } from "../colorpicker";
import { ColorPickerContext, ColorWheelFlower } from "../colorpicker";
import { createColorFromHsl, parseColor } from "../colorpicker/ColorUtils";
import Button from "../button";
import ColorField from "../color-field";
import ColorSlider from "../color-slider";
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

function hueToColorValue(hue: number | null, sat: number): ColorValue {
  if (hue === null) {
    return createColorFromHsl(0, 0, 100, 1);
  }

  return createColorFromHsl(hue, sat, 50, 1);
}

const ThemeColorPicker: Component<ThemeColorPickerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "storagePrefix",
    "onColorChange",
    "aria-label",
    "children",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const [isOpen, setIsOpen] = createSignal(false);
  const [featureAvailable, setFeatureAvailable] = createSignal(true);
  let containerRef: HTMLDivElement | undefined;

  const store = createMemo<HueShiftStore>(() =>
    createHueShiftStore(local.storagePrefix ?? "theme")
  );

  const colorValue = createMemo(() =>
    hueToColorValue(store().hueShift(), store().hueSaturation())
  );

  const setThemeColor = (hue: number | null, saturation: number) => {
    if (hue === null) {
      store().setHueShift(null);
      local.onColorChange?.(null, 100);
      return;
    }

    const normalizedHue = ((hue % 360) + 360) % 360;
    const normalizedSaturation = Math.max(0, Math.min(100, saturation));
    store().setHueShift(normalizedHue, normalizedSaturation);
    local.onColorChange?.(normalizedHue, normalizedSaturation);
  };

  const handleColorChange = (color: ColorValue) => {
    const { h, s, l } = color.hsl;

    if (s < 10 && l > 90) {
      setThemeColor(null, 100);
      return;
    }

    setThemeColor(h, s);
  };

  const handleHueChange = (hue: number) => {
    const saturation = store().hueShift() === null ? 100 : store().hueSaturation();
    setThemeColor(hue, saturation);
  };

  const handleFieldChange = (value: string) => {
    const parsed = parseColor(value);
    if (!parsed) return;
    handleColorChange(parsed);
  };

  createEffect(() => {
    if (!isOpen()) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef && !containerRef.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    onCleanup(() => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    });
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) {
      setIsOpen(false);
    }
  };

  createEffect(() => {
    const timer = setTimeout(() => {
      setFeatureAvailable(true);
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
      clsx(local.class, local.className)
    );

  return (
    <Show when={featureAvailable()}>
      <div ref={containerRef} class={classes()} onKeyDown={handleKeyDown} style={local.style} {...others}>
        <Button
          type="button"
          size="sm"
          onClick={() => setIsOpen(!isOpen())}
          aria-label={local["aria-label"] ?? "Change theme color"}
          aria-expanded={isOpen()}
        >
          {local.children ?? (
            <Icon
              name="icon-[mdi--palette]"
              width={16}
              height={16}
              class={store().hueShift() !== null ? "text-primary" : undefined}
            />
          )}
        </Button>

        <Show when={isOpen()}>
          <div class="absolute right-0 z-50 mt-2 w-[248px] rounded-lg border border-base-300 bg-base-100 p-4 shadow-xl">
            <ColorPickerContext.Provider value={contextValue()}>
              <div class="space-y-3">
                <div class="flex justify-center">
                  <ColorWheelFlower class="color-wheel-custom" />
                </div>

                <ColorSlider
                  type="hue"
                  value={colorValue().hsl.h}
                  onChange={handleHueChange}
                  aria-label="Theme hue"
                />

                <ColorField
                  value={colorValue().hex.toUpperCase()}
                  format="hex"
                  onChange={handleFieldChange}
                  aria-label="Theme color value"
                  fullWidth
                />
              </div>
            </ColorPickerContext.Provider>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default ThemeColorPicker;

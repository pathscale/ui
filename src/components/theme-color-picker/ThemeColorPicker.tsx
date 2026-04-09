import { type Component, type JSX, Show, For, createSignal, createMemo, createEffect, onCleanup, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ColorValue, ColorPickerContextType, ColorFormat } from "../colorpicker";
import { ColorPickerContext, ColorWheelFlower } from "../colorpicker";
import { createColorFromHsl } from "../colorpicker/ColorUtils";
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
   * Callback to switch light/dark theme (triggered by grayscale selection)
   */
  onThemeSwitch?: (theme: "light" | "dark") => void;
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
    "onThemeSwitch",
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

  const GRAYSCALE_SWATCHES = [
    { label: "White", lightness: 10 },
    { label: "Light gray", lightness: 5 },
    { label: "Gray", lightness: 0 },
    { label: "Dark gray", lightness: -5 },
    { label: "Charcoal", lightness: -10 },
    { label: "Black", lightness: -15 },
  ];

  const handleGrayscale = (lightnessOffset: number) => {
    store().setHueShift(0, 0, lightnessOffset);
    local.onColorChange?.(null, 0);

    if (lightnessOffset >= 5) {
      local.onThemeSwitch?.("light");
    } else if (lightnessOffset <= -10) {
      local.onThemeSwitch?.("dark");
    }
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
          <div class="absolute right-0 z-50 mt-2 rounded-lg bg-base-200/80 p-4 shadow-xl backdrop-blur-sm">
            <ColorPickerContext.Provider value={contextValue()}>
              <div class="flex items-center gap-3">
                <div class="flex justify-center">
                  <ColorWheelFlower class="color-wheel-custom" />
                </div>

                <div class="flex flex-col gap-1.5">
                  <For each={GRAYSCALE_SWATCHES}>
                    {(g, i) => (
                      <button
                        type="button"
                        class="h-6 w-6 rounded-full border border-white/20 transition-transform hover:scale-110"
                        style={{ "background-color": `oklch(${[95, 80, 60, 40, 25, 5][i()]}% 0 0)` }}
                        aria-label={g.label}
                        onClick={() => handleGrayscale(g.lightness)}
                      />
                    )}
                  </For>
                </div>
              </div>
            </ColorPickerContext.Provider>
          </div>
        </Show>
      </div>
    </Show>
  );
};

export default ThemeColorPicker;

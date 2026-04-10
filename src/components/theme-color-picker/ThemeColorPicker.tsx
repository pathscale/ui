import { type Component, type JSX, Show, For, createSignal, createMemo, createEffect, onCleanup, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { ColorValue, ColorPickerContextType, ColorFormat } from "../colorpicker";
import { ColorPickerContext, ColorWheelFlower } from "../colorpicker";
import { createColorFromHsl, parseColor } from "../colorpicker/ColorUtils";
import Button from "../button";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";
import { createHueShiftStore, type HueShiftStore } from "./hueShift";

export interface ThemeColorPickerProps extends IComponentBaseProps {
  /**
   * Prefix for localStorage keys (e.g., "myapp" becomes "myapp_theme_color")
   * @default "theme"
   */
  storagePrefix?: string;
  /**
   * Callback when color changes. Passes the hex string (or null on reset).
   * Kept with legacy `(hue, saturation)` signature for backward compatibility —
   * hue is derived from the picked hex, saturation is forwarded as-is.
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

function hexToColorValue(hex: string | null): ColorValue {
  if (hex === null) {
    return createColorFromHsl(0, 0, 100, 1);
  }
  return parseColor(hex) ?? createColorFromHsl(0, 0, 100, 1);
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

  const colorValue = createMemo(() => hexToColorValue(store().themeColor()));

  const handleColorChange = (color: ColorValue) => {
    const { s, l } = color.hsl;

    // "Near-white, low saturation" = the flower's center reset swatch.
    if (s < 10 && l > 90) {
      store().setThemeColor(null);
      local.onColorChange?.(null, 100);
      return;
    }

    // Apply the picked Material color verbatim. No derivation: the swatch
    // the user clicked is exactly what lands on --color-primary.
    store().setThemeColor(color.hex);
    local.onColorChange?.(color.hsl.h, color.hsl.s);
  };

  const GRAYSCALE_SWATCHES = [
    { label: "White", theme: "light" as const },
    { label: "Light gray", theme: "light" as const },
    { label: "Gray", theme: "light" as const },
    { label: "Dark gray", theme: "dark" as const },
    { label: "Charcoal", theme: "dark" as const },
    { label: "Black", theme: "dark" as const },
  ];

  const handleGrayscale = (theme: "light" | "dark") => {
    // Grayscale swatches clear any picked theme color and switch light/dark.
    // The top half of the strip maps to light, the bottom half to dark, so
    // every swatch does something — no dead middle values.
    store().setThemeColor(null);
    local.onColorChange?.(null, 0);
    local.onThemeSwitch?.(theme);
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
          variant="ghost"
          onClick={() => setIsOpen(!isOpen())}
          aria-label={local["aria-label"] ?? "Change theme color"}
          aria-expanded={isOpen()}
        >
          {local.children ?? (
            <Icon
              name="icon-[mdi--palette]"
              width={16}
              height={16}
              class={store().themeColor() !== null ? "text-primary" : undefined}
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
                        onClick={() => handleGrayscale(g.theme)}
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

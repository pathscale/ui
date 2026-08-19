import {type Component, Show, For, createSignal, createMemo, createTrackedEffect, omit} from "solid-js";
import { Portal, type JSX} from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { ColorValue, ColorPickerContextType, ColorFormat } from "../color-wheel-flower";
import { ColorPickerContext, ColorWheelFlower } from "../color-wheel-flower";
import { createColorFromHsl, parseColor } from "../color-wheel-flower/ColorUtils";
import Button from "../button";
import Icon from "../icon";
import type { UIBaseProps } from "../vocabulary";
import {
  createOverlayPosition,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import { createHueShiftStore, type HueShiftStore } from "./hueShift";
import { CLASSES } from "./ThemeColorPicker.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ThemeColorPicker.recipe";

export type ThemeColorPickerAlign = "start" | "end";
export type ThemeColorPickerPlacement = OverlayPlacement;

export interface ThemeColorPickerProps extends UIBaseProps {
  /**
   * Prefix for localStorage keys (e.g., "myapp" becomes "myapp_theme_color")
   * @default "theme"
   */
  storagePrefix?: string;
  /**
   * Callback when color changes. Passes the hex string (or null on reset).
   * Kept with legacy `(hue, saturation)` signature for backward compatibility -
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
   * Popover alignment relative to the trigger.
   * "end" aligns the popover to the trigger's right edge (opens leftward).
   * "start" aligns it to the trigger's left edge (opens rightward).
   * @default "end"
   */
  align?: ThemeColorPickerAlign;
  /**
   * Preferred popover placement.
   * @default "bottom"
   */
  placement?: ThemeColorPickerPlacement;
  /**
   * Automatically flip the popover when there is insufficient viewport space.
   * @default true
   */
  autoFlip?: boolean;
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

const ThemeColorPicker: Layout<typeof componentRecipe, ThemeColorPickerProps> = () => {
  const others = omit(
    props,
    "storagePrefix",
    "onColorChange",
    "onThemeSwitch",
    "aria-label",
    "align",
    "placement",
    "autoFlip",
    "children",
    "class",
    "style",
    "dataTheme",
  );

  const [isOpen, setIsOpen] = createSignal(false);
  const [featureAvailable, setFeatureAvailable] = createSignal(true);
  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | undefined>();
  const [popoverRef, setPopoverRef] = createSignal<HTMLDivElement | undefined>();

  const store: HueShiftStore = createHueShiftStore(props.storagePrefix ?? "theme");

  const colorValue = createMemo(() => hexToColorValue(store.themeColor()));

  const handleColorChange = (color: ColorValue) => {
    const { s, l } = color.hsl;

    if (s < 10 && l > 90) {
      store.setThemeColor(null);
      props.onColorChange?.(null, 100);
      return;
    }

    store.setThemeColor(color.hex);
    props.onColorChange?.(color.hsl.h, color.hsl.s);
  };

  type GrayscaleSwatch = {
    label: string;
    hex: string;
    theme: "light" | "dark";
  };

  // Theme mapping is inverted so every swatch lands on a contrasting
  // background — lights → dark mode, darks → light mode. Keeps the picked
  // gray readable and avoids the white-on-white trap.
  const GRAYSCALE_SWATCHES: GrayscaleSwatch[] = [
    { label: "White", hex: "#fafafa", theme: "dark" },
    { label: "Light gray", hex: "#d4d4d4", theme: "dark" },
    { label: "Gray", hex: "#737373", theme: "dark" },
    { label: "Dark gray", hex: "#404040", theme: "light" },
    { label: "Charcoal", hex: "#262626", theme: "light" },
    { label: "Black", hex: "#0a0a0a", theme: "light" },
  ];

  const handleGrayscale = (swatch: GrayscaleSwatch) => {
    // Switch theme first so data-theme is updated before the store effect
    // reads it inside applyThemeColor. Solid's effect flush order (consumer
    // theme effect → picker store effect) lets applyThemeColor see the new
    // data-theme and pick the correct background anchors on the first pass.
    props.onThemeSwitch?.(swatch.theme);
    store.setThemeColor(swatch.hex);
    props.onColorChange?.(null, 0);
  };

  createTrackedEffect(() => {
    if (!isOpen()) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (containerRef()?.contains(target)) return;
      if (popoverRef()?.contains(target)) return;
      setIsOpen(false);
    };

    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && isOpen()) {
      setIsOpen(false);
    }
  };

  createTrackedEffect(() => {
    const timer = setTimeout(() => {
      setFeatureAvailable(true);
    }, 0);
    return () => clearTimeout(timer);
  });

  const contextValue = (): ColorPickerContextType => ({
    color: colorValue,
    format: () => "hsl" as ColorFormat,
    disabled: () => false,
    onChange: handleColorChange,
    onFormatChange: () => {},
  });

  const classes = () => twMerge(CLASSES.base, props.class);

  const popoverClasses = () => CLASSES.popover;

  const overlayPosition = createOverlayPosition({
    open: isOpen,
    triggerRef: containerRef,
    overlayRef: popoverRef,
    placement: () => props.placement ?? "bottom",
    offset: () => 8,
    autoFlip: () => props.autoFlip ?? true,
    align: () => (props.align === "start" ? "start" : "end"),
  });

  const popoverStyle = () => overlayPosition.style();

  return (
    <Show when={featureAvailable()}>
      <div
        ref={setContainerRef}
        {...{ class: classes() }}
        onKeyDown={handleKeyDown}
        style={props.style}
        {...others}
      >
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => setIsOpen(!isOpen())}
          aria-label={local["aria-label"] ?? "Change theme color"}
          aria-expanded={isOpen() ? "true" : "false"}
        >
          {props.children ?? (
            <Icon
              src="icon-[mdi--palette]"
              width={16}
              height={16}
              {...{ class: store.themeColor() !== null ? CLASSES.iconActive : undefined }}
            />
          )}
        </Button>

        <Show when={isOpen()}>
          <Portal>
            <div
              ref={setPopoverRef}
              {...{ class: popoverClasses() }}
              data-placement={overlayPosition.placement()}
              style={popoverStyle()}
            >
              <ColorPickerContext value={contextValue()}>
                <div {...{ class: CLASSES.row }}>
                  <div {...{ class: CLASSES.wheelWrap }}>
                    <ColorWheelFlower {...{ class: CLASSES.wheelCustom }} />
                  </div>

                  <div {...{ class: CLASSES.grayscaleList }}>
                    <For each={GRAYSCALE_SWATCHES}>
                      {(g) => (
                        <button
                          type="button"
                          {...{ class: CLASSES.swatchButton }}
                          style={{ "background-color": `${g.hex}` }}
                          aria-label={g.label}
                          onClick={() => handleGrayscale(g)}
                        />
                      )}
                    </For>
                  </div>
                </div>
              </ColorPickerContext>
            </div>
          </Portal>
        </Show>
      </div>
    </Show>
  );
};

export default ThemeColorPicker;

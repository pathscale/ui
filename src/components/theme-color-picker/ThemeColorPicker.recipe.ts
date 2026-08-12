import { recipe } from "solid-layouts";

/**
 * The fifth Tailwind map, and the one the earlier count missed: every value
 * here is a utility string rather than BEM, so it declares `tailwind: true`
 * alongside Flex, Grid, Join and SizePicker.
 *
 * `iconActive` was a sibling of the other names in a flat map, which made it
 * look like an element when it is a state of the icon. It is on the state
 * axis here and mirrors to `data-active`.
 */
export const themeColorPicker = recipe({
  component: "theme-color-picker",
  element: "div",
  tailwind: true,
  slots: {
    root: { base: "relative" },
    popover: {
      base: "fixed z-50 rounded-lg bg-base-200/80 p-4 shadow-xl backdrop-blur-sm",
    },
    row: { base: "flex items-center gap-3" },
    wheelWrap: { base: "flex justify-center" },
    wheelCustom: { base: "color-wheel-custom" },
    grayscaleList: { base: "flex flex-col gap-1.5" },
    swatchButton: {
      base: "h-6 w-6 rounded-full border border-white/20 transition-transform hover:scale-110",
    },
    icon: { base: "" },
  },
  props: {
    align: {
      start: { popover: "left-0" },
      end: { popover: "right-0" },
    },
  },
  state: {
    active: { true: { icon: "text-primary" } },
  },
});

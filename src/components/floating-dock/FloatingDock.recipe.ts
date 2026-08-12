import { recipe } from "solid-layouts";

export const floatingDock = recipe({
  component: "floating-dock",
  element: "div",
  slots: {
    root: { base: "floating-dock" },
    bar: { base: "floating-dock__bar" },
    bg: { base: "floating-dock__bg" },
    item: { base: "floating-dock__item" },
    icon: { base: "floating-dock__icon" },
    tooltip: { base: "floating-dock__tooltip" },
    mobile: { base: "floating-dock__mobile" },
    mobileToggle: { base: "floating-dock__mobile-toggle" },
    mobilePopup: { base: "floating-dock__mobile-popup" },
    mobileItem: { base: "floating-dock__mobile-item" },
    buttonReset: { base: "floating-dock__button-reset" },
    menuIcon: { base: "floating-dock__menu-icon" },
  },
  props: {
    orientation: {
      horizontal: { bar: "floating-dock__bar--horizontal" },
      vertical: { bar: "floating-dock__bar--vertical" },
    },
    popupDirection: {
      top: { mobilePopup: "floating-dock__mobile-popup--top" },
      bottom: { mobilePopup: "floating-dock__mobile-popup--bottom" },
      left: { mobilePopup: "floating-dock__mobile-popup--left" },
      right: { mobilePopup: "floating-dock__mobile-popup--right" },
    },
  },
  state: {
    mobileDock: { true: { bar: "floating-dock__bar--mobile-dock" } },
  },
});

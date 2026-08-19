import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "dock",
  bar: "dock__bar",
  barOrientation: {
    horizontal: "dock__bar--horizontal",
    vertical: "dock__bar--vertical",
  },
  barMobileDock: "dock__bar--mobile-dock",
  bg: "dock__bg",
  item: "dock__item",
  icon: "dock__icon",
  tooltip: "dock__tooltip",
  mobile: "dock__mobile",
  mobileToggle: "dock__mobile-toggle",
  mobilePopup: "dock__mobile-popup",
  mobilePopupDirection: {
    top: "dock__mobile-popup--top",
    bottom: "dock__mobile-popup--bottom",
    left: "dock__mobile-popup--left",
    right: "dock__mobile-popup--right",
  },
  mobileItem: "dock__mobile-item",
  buttonReset: "dock__button-reset",
  menuIcon: "dock__menu-icon",
} as const;
export const componentRecipe = recipe({component:"dock",slots:{"root":{},},});

import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "switch",
  slot: {
    input: "toggle__input",
    control: "toggle__control",
    thumb: "toggle__thumb",
    icon: "toggle__icon",
    content: "toggle__content",
    description: "toggle__description",
  },
  color: {
    default: "switch--default",
    accent: "switch--accent",
    success: "switch--success",
    warning: "switch--warning",
    danger: "switch--danger",
  },
  size: {
    sm: "switch--sm",
    md: "switch--md",
    lg: "switch--lg",
  },
  flag: {
    disabled: "switch--disabled",
  },
} as const;
export const componentRecipe = recipe({component:"switch",slots:{"description":{},"label":{},"root":{},"switch":{},"switch-content":{},"switch-control":{},"switch-icon":{},"switch-input":{},"switch-thumb":{},},});

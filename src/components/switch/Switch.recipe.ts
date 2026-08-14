import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "switch",
  slot: {
    input: "switch__input",
    control: "switch__control",
    thumb: "switch__thumb",
    icon: "switch__icon",
    content: "switch__content",
    description: "switch__description",
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

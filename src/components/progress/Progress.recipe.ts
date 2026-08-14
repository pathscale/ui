import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "progress",
  label: "progress__label",
  output: "progress__output",
  track: "progress__track",
  indicator: "progress__indicator",
  size: {
    sm: "progress--sm",
    md: "progress--md",
    lg: "progress--lg",
  },
  color: {
    default: "progress--default",
    accent: "progress--accent",
    success: "progress--success",
    warning: "progress--warning",
    danger: "progress--danger",
  },
  state: {
    indeterminate: "progress--indeterminate",
    disabled: "progress--disabled",
  },
} as const;
export const componentRecipe = recipe({component:"progress",slots:{"root":{},},});

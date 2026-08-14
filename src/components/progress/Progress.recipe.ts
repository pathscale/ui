import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "progress",
  label: "progress-bar__label",
  output: "progress-bar__output",
  track: "progress-bar__track",
  indicator: "progress-bar__indicator",
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

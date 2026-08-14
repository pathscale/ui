import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "radial-progress",
  svg: "progress-circle__track",
  trackCircle: "progress-circle__track-circle",
  indicator: "progress-circle__indicator",
  size: {
    sm: "radial-progress--sm",
    md: "radial-progress--md",
    lg: "radial-progress--lg",
  },
  color: {
    default: "radial-progress--default",
    accent: "radial-progress--accent",
    success: "radial-progress--success",
    warning: "radial-progress--warning",
    danger: "radial-progress--danger",
  },
  state: {
    indeterminate: "radial-progress--indeterminate",
    disabled: "radial-progress--disabled",
  },
} as const;
export const componentRecipe = recipe({component:"radial-progress",slots:{"root":{},},});

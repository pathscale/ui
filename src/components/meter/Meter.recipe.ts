import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "meter",
  output: "meter__output",
  track: "meter__track",
  fill: "meter__fill",
  size: {
    sm: "meter--sm",
    md: "meter--md",
    lg: "meter--lg",
  },
  color: {
    default: "meter--default",
    accent: "meter--accent",
    success: "meter--success",
    warning: "meter--warning",
    danger: "meter--danger",
  },
  state: {
    disabled: "meter--disabled",
  },
} as const;

export const componentRecipe = recipe({component:"meter",slots:{"meter":{},"meter-fill":{},"meter-output":{},"meter-track":{},"root":{},},});

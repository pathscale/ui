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
  flavor: {
    neutral: "meter--flavor-neutral",
    primary: "meter--flavor-primary",
    secondary: "meter--flavor-secondary",
    accent: "meter--flavor-accent",
    destructive: "meter--flavor-destructive",
    success: "meter--flavor-success",
    warning: "meter--flavor-warning",
    info: "meter--flavor-info",
  },
  state: {
    disabled: "meter--disabled",
  },
} as const;

export const componentRecipe = recipe({component:"meter",slots:{"meter":{},"meter-fill":{},"meter-output":{},"meter-track":{},"root":{},},});

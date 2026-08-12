import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "input-group",
    variant: {
      primary: "input-group--primary",
      secondary: "input-group--secondary",
    },
    flag: {
      fullWidth: "input-group--full-width",
    },
  },
  Input: {
    base: "input-group__input",
  },
  Prefix: {
    base: "input-group__prefix",
  },
  Suffix: {
    base: "input-group__suffix",
  },
} as const;
export const componentRecipe = recipe({component:"input-group",slots:{"input-group":{},"input-group-input":{},"input-group-prefix":{},"input-group-suffix":{},"input-group-textarea":{},"root":{},},});

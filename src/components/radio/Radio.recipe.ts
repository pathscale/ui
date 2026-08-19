import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "radio",
  slot: {
    input: "radio__input",
    control: "radio__control",
    indicator: "radio__indicator",
    content: "radio__content",
    description: "radio__description",
  },
  flag: {
    disabled: "radio--disabled",
  },
} as const;
export const componentRecipe = recipe({component:"radio",slots:{"description":{},"label":{},"radio":{},"radio-content":{},"radio-control":{},"radio-indicator":{},"radio-input":{},"root":{},},});

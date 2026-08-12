import { recipe } from "../../lib/layouts";
export const CLASSES = {
  Root: {
    base: "card",
    variant: {
      default: "card--default",
      flat: "card--flat",
      bordered: "card--bordered",
      shadow: "card--shadow",
    },
    flag: {
      isHoverable: "card--hoverable",
      isPressable: "card--pressable",
    },
  },
  Header: {
    base: "card__header",
  },
  Body: {
    base: "card__body",
  },
  Footer: {
    base: "card__footer",
  },
} as const;
export const componentRecipe = recipe({component:"card",slots:{"card":{},"card-body":{},"card-footer":{},"card-header":{},"root":{},},});

import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "pagination",
  slot: {
    summary: "pagination__summary",
    content: "pagination__content",
    item: "pagination__item",
    link: "pagination__link",
    linkNav: "pagination__link--nav",
    ellipsis: "pagination__ellipsis",
  },
} as const;
export const componentRecipe = recipe({component:"pagination",slots:{"pagination":{},"pagination-content":{},"pagination-ellipsis":{},"pagination-item":{},"pagination-link":{},"pagination-next":{},"pagination-previous":{},"pagination-summary":{},"root":{},},});

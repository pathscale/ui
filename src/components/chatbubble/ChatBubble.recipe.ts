import { recipe } from "../../lib/layouts";
export const CLASSES = {
  base: "chatbubble",
  align: {
    start: "chatbubble--start",
    end: "chatbubble--end",
  },
  slot: {
    header: "chatbubble__header",
    footer: "chatbubble__footer",
    avatar: "chatbubble__avatar",
    message: "chatbubble__message",
    time: "chatbubble__time",
  },
  flavor: {
    neutral: "chatbubble__message--flavor-neutral",
    primary: "chatbubble__message--flavor-primary",
    secondary: "chatbubble__message--flavor-secondary",
    accent: "chatbubble__message--flavor-accent",
    destructive: "chatbubble__message--flavor-destructive",
    success: "chatbubble__message--flavor-success",
    warning: "chatbubble__message--flavor-warning",
    info: "chatbubble__message--flavor-info",
  },
} as const;
export const componentRecipe = recipe({component:"chatbubble",slots:{"root":{},},});

import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleFooterProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const ChatBubbleFooter: Layout<typeof componentRecipe, ChatBubbleFooterProps> = () => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.footer, local.class) }}
    />
  );
};

export default ChatBubbleFooter;

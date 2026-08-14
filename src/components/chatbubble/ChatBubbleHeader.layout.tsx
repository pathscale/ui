import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleHeaderProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const ChatBubbleHeader: Layout<typeof componentRecipe, ChatBubbleHeaderProps> = () => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.header, local.class) }}
    />
  );
};

export default ChatBubbleHeader;

import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleHeaderProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const ChatBubbleHeader: Layout<typeof componentRecipe, ChatBubbleHeaderProps> = () => {
  const others = omit(props, "class");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.header, props.class) }}
    />
  );
};

export default ChatBubbleHeader;

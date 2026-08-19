import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleHeaderProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps;

const ChatBubbleHeader: Layout<
  typeof componentRecipe,
  ChatBubbleHeaderProps
> = () => {
  const others = omit(props, "class");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.header, props.class) }}
    />
  );
};

export default ChatBubbleHeader;

import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps, Flavor } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleMessageProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps & {
    flavor?: Flavor;
  };

const ChatBubbleMessage: Layout<typeof componentRecipe, ChatBubbleMessageProps> = () => {
  const others = omit(props, "flavor", "class");

  const colorClass = () => {
    if (!props.flavor) return undefined;
    const f = props.flavor;
    return CLASSES.flavor[f as keyof typeof CLASSES.flavor] ?? `chatbubble__message--flavor-${f}`;
  };

  return (
    <div
      {...others}
      class={twMerge(
        CLASSES.slot.message,
        colorClass(),
        props.class,
      )}
    />
  );
};

export default ChatBubbleMessage;

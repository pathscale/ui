import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleMessageProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    color?:
      | "neutral"
      | "primary"
      | "secondary"
      | "accent"
      | "info"
      | "success"
      | "warning"
      | "error";
  };

const ChatBubbleMessage: Layout<typeof componentRecipe, ChatBubbleMessageProps> = () => {
  const [local, others] = splitProps(props, ["color", "class", "className"]);

  const colorClass = () => {
    if (!local.color) return undefined;
    return CLASSES.color[local.color];
  };

  return (
    <div
      {...others}
      class={twMerge(
        CLASSES.slot.message,
        colorClass(),
        local.class,
        local.className,
      )}
    />
  );
};

export default ChatBubbleMessage;

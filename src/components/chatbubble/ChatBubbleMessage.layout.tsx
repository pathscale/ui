import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps, Flavor } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleMessageProps = JSX.HTMLAttributes<HTMLDivElement> &
  UIBaseProps & {
    flavor?: Flavor;
  };

const ChatBubbleMessage: Layout<typeof componentRecipe, ChatBubbleMessageProps> = () => {
  const [local, others] = splitProps(props, ["flavor", "class"]);

  const colorClass = () => {
    if (!local.flavor) return undefined;
    const f = local.flavor;
    return CLASSES.flavor[f as keyof typeof CLASSES.flavor] ?? `chatbubble__message--flavor-${f}`;
  };

  return (
    <div
      {...others}
      class={twMerge(
        CLASSES.slot.message,
        colorClass(),
        local.class,
      )}
    />
  );
};

export default ChatBubbleMessage;

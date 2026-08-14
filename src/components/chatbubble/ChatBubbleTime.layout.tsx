import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleTimeProps = JSX.HTMLAttributes<HTMLTimeElement> &
  UIBaseProps;

const ChatBubbleTime: Layout<typeof componentRecipe, ChatBubbleTimeProps> = () => {
  const [local, others] = splitProps(props, ["class"]);

  return (
    <time
      {...others}
      {...{ class: twMerge(CLASSES.slot.time, local.class) }}
    />
  );
};

export default ChatBubbleTime;

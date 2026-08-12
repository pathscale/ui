import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleTimeProps = JSX.HTMLAttributes<HTMLTimeElement> &
  IComponentBaseProps;

const ChatBubbleTime: Layout<typeof componentRecipe, ChatBubbleTimeProps> = () => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <time
      {...others}
      {...{ class: twMerge(CLASSES.slot.time, local.class, local.className) }}
    />
  );
};

export default ChatBubbleTime;

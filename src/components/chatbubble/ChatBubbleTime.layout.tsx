import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleTimeProps = JSX.HTMLAttributes<HTMLTimeElement> &
  UIBaseProps;

const ChatBubbleTime: Layout<
  typeof componentRecipe,
  ChatBubbleTimeProps
> = () => {
  const others = omit(props, "class");

  return (
    <time
      {...others}
      {...{ class: twMerge(CLASSES.slot.time, props.class) }}
    />
  );
};

export default ChatBubbleTime;

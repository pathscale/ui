import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ChatBubble.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleTimeProps = JSX.HTMLAttributes<HTMLTimeElement> &
  UIBaseProps;

const ChatBubbleTime: Layout<typeof componentRecipe, ChatBubbleTimeProps> = () => {
  const others = omit(props, "class");

  return (
    <time
      {...others}
      {...{ class: twMerge(CLASSES.slot.time, props.class) }}
    />
  );
};

export default ChatBubbleTime;

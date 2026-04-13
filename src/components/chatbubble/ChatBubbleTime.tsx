import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ChatBubble.classes";

export type ChatBubbleTimeProps = JSX.HTMLAttributes<HTMLTimeElement> &
  IComponentBaseProps;

const ChatBubbleTime = (props: ChatBubbleTimeProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <time
      {...others}
      {...{ class: twMerge(CLASSES.slot.time, local.class, local.className) }}
    />
  );
};

export default ChatBubbleTime;

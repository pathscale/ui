import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ChatBubble.classes";

export type ChatBubbleFooterProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const ChatBubbleFooter = (props: ChatBubbleFooterProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.footer, local.class, local.className) }}
    />
  );
};

export default ChatBubbleFooter;

import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ChatBubble.classes";

export type ChatBubbleHeaderProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const ChatBubbleHeader = (props: ChatBubbleHeaderProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.header, local.class, local.className) }}
    />
  );
};

export default ChatBubbleHeader;

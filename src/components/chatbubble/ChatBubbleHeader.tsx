import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type ChatBubbleHeaderProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const ChatBubbleHeader = (props: ChatBubbleHeaderProps): JSX.Element => {
  return (
    <div
      {...props}
      class={twMerge("chat-header", props.class)}
    />
  );
};

export default ChatBubbleHeader;

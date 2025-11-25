import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type ChatBubbleFooterProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const ChatBubbleFooter = (props: ChatBubbleFooterProps): JSX.Element => {
  return (
    <div
      {...props}
      class={twMerge("chat-footer opacity-50", props.class)}
    />
  );
};

export default ChatBubbleFooter;

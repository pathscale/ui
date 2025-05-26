import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type ChatBubbleTimeProps = JSX.HTMLAttributes<HTMLTimeElement> &
  IComponentBaseProps;

const ChatBubbleTime = (props: ChatBubbleTimeProps): JSX.Element => {
  return <time {...props} class={twMerge("text-xs opacity-50", props.class)} />;
};

export default ChatBubbleTime;

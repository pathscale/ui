import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import type { IComponentBaseProps } from "../types";

export type ChatBubbleMessageProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    color?:
      | "neutral"
      | "primary"
      | "secondary"
      | "accent"
      | "info"
      | "success"
      | "warning"
      | "error";
  };

const ChatBubbleMessage = (props: ChatBubbleMessageProps): JSX.Element => {
  const bubbleClass = clsx({
    "chat-bubble": true,
    "chat-bubble-neutral": props.color === "neutral",
    "chat-bubble-primary": props.color === "primary",
    "chat-bubble-secondary": props.color === "secondary",
    "chat-bubble-accent": props.color === "accent",
    "chat-bubble-info": props.color === "info",
    "chat-bubble-success": props.color === "success",
    "chat-bubble-warning": props.color === "warning",
    "chat-bubble-error": props.color === "error",
  });

  return <div {...props} class={twMerge(bubbleClass, props.class)} />;
};

export default ChatBubbleMessage;

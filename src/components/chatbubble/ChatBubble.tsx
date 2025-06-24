import { createMemo, type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import ChatBubbleHeader from "./ChatBubbleHeader";
import ChatBubbleTime from "./ChatBubbleTime";
import ChatBubbleAvatar from "./ChatBubbleAvatar";
import ChatBubbleMessage from "./ChatBubbleMessage";
import ChatBubbleFooter from "./ChatBubbleFooter";
import clsx from "clsx";

export type ChatBubbleProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    end?: boolean;
  };

const ChatBubble = (props: ChatBubbleProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "end",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const classes = createMemo(() =>
    twMerge(
      "chat",
      clsx({
        "chat-end": local.end,
      }),
      local.class,
      local.className
    )
  );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {others.children}
    </div>
  );
};

export default Object.assign(ChatBubble, {
  Header: ChatBubbleHeader,
  Time: ChatBubbleTime,
  Avatar: ChatBubbleAvatar,
  Message: ChatBubbleMessage,
  Footer: ChatBubbleFooter,
});

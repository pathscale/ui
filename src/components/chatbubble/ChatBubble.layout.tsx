import "./ChatBubble.css";
import type { JSX } from "@solidjs/web";
import { createMemo, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ChatBubble.recipe";
import ChatBubbleAvatar from "./ChatBubbleAvatar.generated";
import ChatBubbleFooter from "./ChatBubbleFooter.generated";
import ChatBubbleHeader from "./ChatBubbleHeader.generated";
import ChatBubbleMessage from "./ChatBubbleMessage.generated";
import ChatBubbleTime from "./ChatBubbleTime.generated";

export type ChatBubbleProps = UIBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    end?: boolean;
  };

const ChatBubble: Layout<typeof componentRecipe, ChatBubbleProps> = () => {
  const others = omit(props, "end", "dataTheme", "class", "style");

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      props.end ? CLASSES.align.end : CLASSES.align.start,
      props.class,
    ),
  );

  return (
    <div
      {...others}
      data-theme={props.dataTheme}
      {...{ class: classes() }}
      style={props.style}
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

import { type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Avatar from "../avatar";
import type { AvatarProps } from "../avatar";
import type { IComponentBaseProps } from "../types";

export type ChatBubbleAvatarProps = AvatarProps & IComponentBaseProps;

const ChatBubbleAvatar = (props: ChatBubbleAvatarProps): JSX.Element => {
  return (
    <Avatar
      {...props}
      size={props.size ?? "xs"}
      shape={props.shape ?? "circle"}
      class={twMerge("chat-image", props.class)}
    />
  );
};

export default ChatBubbleAvatar;

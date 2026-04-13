import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Avatar from "../avatar";
import type { AvatarRootProps } from "../avatar";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ChatBubble.classes";

export type ChatBubbleAvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
} & Omit<AvatarRootProps, "children"> &
  IComponentBaseProps;

const ChatBubbleAvatar = (props: ChatBubbleAvatarProps): JSX.Element => {
  return (
    <Avatar
      size={props.size ?? "sm"}
      color={props.color}
      variant={props.variant}
      {...{ class: twMerge(CLASSES.slot.avatar, props.class, props.className) }}
      dataTheme={props.dataTheme}
      style={props.style}
    >
      {props.src && <Avatar.Image src={props.src} alt={props.alt} />}
      <Avatar.Fallback>{props.fallback ?? props.alt?.charAt(0) ?? "?"}</Avatar.Fallback>
    </Avatar>
  );
};

export default ChatBubbleAvatar;

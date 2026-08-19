import type { JSX } from "@solidjs/web";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { AvatarRootProps } from "../avatar";
import Avatar from "../avatar";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ChatBubble.recipe";

export type ChatBubbleAvatarProps = {
  src?: string;
  alt?: string;
  fallback?: string;
} & Omit<AvatarRootProps, "children"> &
  UIBaseProps;

const ChatBubbleAvatar: Layout<
  typeof componentRecipe,
  ChatBubbleAvatarProps
> = () => {
  return (
    <Avatar
      size={props.size ?? "sm"}
      flavor={props.flavor}
      variant={props.variant}
      {...{ class: twMerge(CLASSES.slot.avatar, props.class) }}
      dataTheme={props.dataTheme}
      style={props.style}
    >
      {props.src && (
        <Avatar.Image
          src={props.src}
          alt={props.alt}
        />
      )}
      <Avatar.Fallback>
        {props.fallback ?? props.alt?.charAt(0) ?? "?"}
      </Avatar.Fallback>
    </Avatar>
  );
};

export default ChatBubbleAvatar;

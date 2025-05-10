import type { Component } from "solid-js";
import { createSignal, onMount, createMemo } from "solid-js";
import { checkBenchieSupport } from "@src/utils/functions";
import { avatarVariants } from "./Avatar.styles";

const t = (url: string, cdn: string) => `${cdn}/${url}`;
const CDN_URL = "https://cdn.example.com"; 

type AvatarProps = {
  alt?: string;
  size?: "sm" | "md" | "lg";
  rounded?: boolean;
  background?: string;
  text?: string;
  src?: string;
  dataSrc?: string;
  customClass?: string;
};

export const Avatar: Component<AvatarProps> = (props) => {
  const hasBenchieSupport = checkBenchieSupport();

  const [source, setSource] = createSignal(props.src || props.dataSrc);
  const alt = () => props.alt || "User Avatar";

  onMount(async () => {
    if (props.dataSrc && hasBenchieSupport) {
      // Define t and $__CDN appropriately in your project context
      const result = await t(props.dataSrc, CDN_URL);
      setSource(result);
    }
  });

  const backgroundColor = createMemo(() =>
    source() ? "" : props.background || "bg-blue-500"
  );
  const textColor = createMemo(() =>
    source() ? "" : props.text || "text-white"
  );

  const caption = createMemo(() => {
    if (alt()) {
      const parts = alt()?.split(" ");
      if (parts && parts.length >= 2) {
        return parts[0][0] + parts[1][0];
      }
    }
    return "";
  });

  return (
    <figure
      class={`image is-flex is-justify-content-center is-align-items-center mx-1 ${avatarVariants({
        size: props.size,
        variant: "filled",
      })} ${backgroundColor()} ${textColor()}`}
    >
      {source() ? (
        <img
          src={source()}
          data-src={props.dataSrc}
          alt={alt()}
          class={`${props.customClass || ""} ${
            props.rounded ? "rounded-full" : ""
          }`}
        />
      ) : (
        <span class={`is-size-4 ${props.rounded ? "rounded-full" : ""}`}>
          {caption()}
        </span>
      )}
    </figure>
  );
}

export default Avatar;

import {
  type Component,
  createSignal,
  createMemo,
  createEffect,
  mergeProps,
  splitProps,
  Show,
} from "solid-js";
import { avatarVariants } from "./Avatar.styles";
import type { VariantProps } from "@src/lib/style";
import type { ComponentProps, JSX } from "solid-js";
import type { ClassProps } from "@src/lib/style";
import { parseCaption } from "./utils";

const CDN_URL = "https://cdn.example.com";

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;

export type AvatarProps = Partial<
  AvatarVariantProps & ClassProps & ComponentProps<"img">
> & {
  src?: string;
  dataSrc?: string;
  alt?: string;
  text?: string;
};

const Avatar: Component<AvatarProps> = (rawProps) => {
  const props = mergeProps({ alt: "User Avatar" }, rawProps);

  const [variantProps, otherProps] = splitProps(props, [
    "class",
    ...avatarVariants.variantKeys,
  ]);

  const [source, setSource] = createSignal(props.src || props.dataSrc);

  createEffect(() => {
    if (import.meta.env.PROD && props.dataSrc) {
      setSource(`${CDN_URL}/${props.dataSrc}`);
    }
  });

  const backgroundColor = createMemo(() =>
    source() ? "" : (props.class ?? "bg-blue-500")
  );
  const textColor = createMemo(() =>
    source() ? "" : (props.text ?? "text-white")
  );

  const caption = createMemo(() => parseCaption(props.alt));

  return (
    <figure class={avatarVariants(variantProps)}>
      <Show when={source()}>
        <img
          src={source()}
          data-src={props.dataSrc}
          class="w-full h-full object-cover"
          {...otherProps}
        />
      </Show>
      <Show when={!source()}>
        <span class="text-lg">{caption()}</span>
      </Show>
    </figure>
  );
};

export default Avatar;

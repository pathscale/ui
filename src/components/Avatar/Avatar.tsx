import {
  type Component,
  createSignal,
  createMemo,
  createEffect,
  mergeProps,
  splitProps,
  Show,
  untrack,
} from "solid-js";
import { avatarVariants } from "./Avatar.styles";
import type { VariantProps } from "@src/lib/style";
import type { ComponentProps, JSX } from "solid-js";
import type { ClassProps } from "@src/lib/style";
import { parseCaption } from "./utils";

export type AvatarVariantProps = VariantProps<typeof avatarVariants>;

export type AvatarProps = AvatarVariantProps &
  ClassProps &
  ComponentProps<"img"> & {
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
    untrack(() => {
      if (import.meta.env.PROD && props.dataSrc) {
        setSource(props.dataSrc);
      }
    });
  });

  const styles = createMemo(() => ({
    background: untrack(() => (source() ? "" : props.class ?? "bg-blue-500")),
    text: untrack(() => (source() ? "" : props.text ?? "text-white")),
  }));

  const caption = createMemo(() => parseCaption(props.alt));

  return (
    <figure class={avatarVariants(variantProps)}>
      <Show
        when={source()}
        fallback={<figcaption class={styles().text}>{caption()}</figcaption>}
      >
        <img
          src={source()}
          data-src={props.dataSrc}
          class="size-full object-cover"
          {...otherProps}
        />
      </Show>
    </figure>
  );
};

export default Avatar;

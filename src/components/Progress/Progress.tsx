import {
  type Component,
  createSignal,
  createMemo,
  createEffect,
  mergeProps,
  splitProps,
  Show,
} from "solid-js";
import { progressVariants } from "./Progress.styles";
import type { VariantProps } from "@src/lib/style";
import type { ComponentProps } from "solid-js";
import type { ClassProps } from "@src/lib/style";

export type ProgressVariantProps = VariantProps<typeof progressVariants>;

export type ProgressProps = ProgressVariantProps &
  ClassProps &
  ComponentProps<"img"> & {
    src?: string;
    dataSrc?: string;
    alt?: string;
    text?: string;
  };

const Progress: Component<ProgressProps> = (rawProps) => {
  const props = mergeProps({ alt: "User Avatar" }, rawProps);

  const [variantProps, otherProps] = splitProps(props, [
    "class",
    ...progressVariants.variantKeys,
  ]);

  const [source, setSource] = createSignal(props.src || props.dataSrc);

  createEffect(() => {
    if (import.meta.env.PROD && props.dataSrc) {
      setSource(props.dataSrc);
    }
  });

  const backgroundColor = createMemo(() =>
    source() ? "" : (props.class ?? "bg-blue-500")
  );
  const textColor = createMemo(() =>
    source() ? "" : (props.text ?? "text-white")
  );


  return (
    <figure class={progressVariants(variantProps)}>
      <Show
        when={source()}
        fallback={<figcaption class="text-lg">{""}</figcaption>}
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

export default Progress;

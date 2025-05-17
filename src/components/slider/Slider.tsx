import {
  type Component,
  type JSX,
  splitProps,
  createMemo,
  Show,
  type ComponentProps
} from "solid-js";
import {
  sliderTrack,
  sliderThumb,
} from "./Slider.styles";
import { classes, type VariantProps } from "@src/lib/style";

type NativeInputProps = ComponentProps<"input">;

export type SliderProps = {
  label?: string;
  showThumb?: boolean;
  className?: string;
} & NativeInputProps &
  VariantProps<typeof sliderTrack> &
  VariantProps<typeof sliderThumb>

const Slider: Component<SliderProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["label", "showThumb", "class", "className"],
    ["size", "color", "disabled"],
  );

  const containerClass = createMemo(() =>
    classes("relative w-full", local.class, local.className),
  );

  const inputClass = createMemo(() =>
    sliderTrack({
      size: variantProps.size,
      color: variantProps.color,
      disabled: variantProps.disabled,
    }),
  );

  const thumbClass = createMemo(() =>
    sliderThumb({
      color: variantProps.color,
      disabled: variantProps.disabled,
    }),
  );

  return (
    <div class="w-full">
    <Show when={local.label}>
      <label class="mb-1 block text-sm font-medium text-gray-700">
        {local.label}
      </label>
    </Show>

    <div class={containerClass()}>
      <input
        type="range"
        class={inputClass()}
        disabled={variantProps.disabled}
        {...otherProps}
      />

      <Show when={local.showThumb}>
        <div class={thumbClass()} />
      </Show>
    </div>
  </div>
  );
};

export default Slider;

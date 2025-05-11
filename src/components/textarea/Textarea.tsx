import {
  type Component,
  createSignal,
  createMemo,
  mergeProps,
  splitProps,
  type JSX,
  Show,
} from "solid-js";
import { textareaVariants } from "./Textarea.styles";
import type { ClassProps, VariantProps } from "@src/lib/style";
import type { ComponentProps } from "solid-js";

export type TextareaProps = Partial<
  VariantProps<typeof textareaVariants> &
    ClassProps &
    ComponentProps<"textarea">
> & {
  hasCounter?: boolean;
};

const Textarea: Component<TextareaProps> = (rawProps) => {
  const props = mergeProps(
    { size: "md", color: "primary", resize: "y", loading: false },
    rawProps
  );

  const [localProps, variantPropsRaw, otherProps] = splitProps(
    props,
    ["hasCounter", "value", "maxlength"],
    ["class", ...textareaVariants.variantKeys]
  );

  const variantProps = variantPropsRaw as VariantProps<typeof textareaVariants>;

  const [isFocused, setFocused] = createSignal(false);

  const valueLength = createMemo(() =>
    typeof localProps.value === "string" ? localProps.value.length : 0
  );

  const showCounter = createMemo(
    () => localProps.maxlength && localProps.hasCounter
  );

  return (
    <div class="relative w-full">
      <textarea
        class={textareaVariants(variantProps)}
        maxlength={localProps.maxlength}
        value={localProps.value}
        onInput={otherProps.onInput}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...otherProps}
      />

      <Show when={showCounter()}>
        <small
          class={`absolute bottom-1 right-2 text-xs text-gray-500 transition-opacity ${
            isFocused() ? "opacity-100" : "opacity-0"
          }`}
        >
          {valueLength()} / {localProps.maxlength}
        </small>
      </Show>
    </div>
  );
};

export default Textarea;

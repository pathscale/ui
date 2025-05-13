import {
  type Component,
  createMemo,
  createSignal,
  splitProps,
  Show,
} from "solid-js";
import { textareaVariants } from "./Textarea.styles";
import type { VariantProps, ClassProps } from "@src/lib/style";
import type { ComponentProps } from "solid-js";
import { classes } from "@src/lib/style";

export type TextareaProps = VariantProps<typeof textareaVariants> &
  ClassProps &
  ComponentProps<"textarea"> & {
    hasCounter?: boolean;
  };

const Textarea: Component<TextareaProps> = (props) => {
  const [localProps, variantProps, otherProps] = splitProps(
    props,
    ["hasCounter", "value", "onInput", "onFocus", "onBlur", "maxLength"],
    ["class", ...textareaVariants.variantKeys]
  );

  const [isFocused, setFocused] = createSignal(false);

  const valueLength = createMemo(() =>
    typeof localProps.value === "string" ? localProps.value.length : 0
  );

  const showCounter = createMemo(
    () => localProps.maxLength && localProps.hasCounter
  );

  return (
    <div class="relative w-full">
      <textarea
        class={textareaVariants(variantProps)}
        value={localProps.value}
        maxLength={localProps.maxLength}
        onInput={localProps.onInput}
        onFocus={(e) => {
          setFocused(true);
          typeof localProps.onFocus === "function" && localProps.onFocus(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          typeof localProps.onBlur === "function" && localProps.onBlur(e);
        }}
        aria-invalid={variantProps.color === "danger" ? "true" : undefined}
        {...otherProps}
      />

      <Show when={showCounter()}>
        <small
          class={classes(
            "absolute bottom-1 right-2 text-xs text-gray-500 transition-opacity",
            isFocused() ? "opacity-100" : "opacity-0"
          )}
        >
          {valueLength()} / {localProps.maxLength}
        </small>
      </Show>
    </div>
  );
};

export default Textarea;

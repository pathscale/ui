// src/components/Search/Search.tsx
import {
  type Component,
  splitProps,
  Show,
  createMemo,
  type JSX,
} from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import {
  fieldWrapper,
  labelStyles,
  messageStyles,
  inputStyles,
  buttonStyles,
} from "./Search.styles";

export type SearchProps = {
  // Field wrapper
  label?: string;
  message?: string;
  type?: "default" | "danger";

  // Layout variants
  size?: "sm" | "md" | "lg";
  horizontal?: boolean;
  grouped?: boolean;
  groupMultiline?: boolean;

  // Core search behavior
  value?: string;
  placeholder?: string;
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onSearch?: () => void;
  loading?: boolean;
  buttonLabel?: string;
} & VariantProps<typeof fieldWrapper>
  & VariantProps<typeof inputStyles>
  & VariantProps<typeof buttonStyles>
  & ClassProps;

const Search: Component<SearchProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    [
      "class", "className",
      "label", "message", "type",
      "value", "placeholder", "onInput", "onSearch",
      "loading", "buttonLabel",
    ] as const,
    [
      "size", "horizontal", "grouped", "groupMultiline",  // fieldWrapper variants
      "size",                                    // inputStyles variant
      "color", "loading",                        // buttonStyles variants
      "type",                                    // label/message styling
    ] as const
  );

  const wrapperClass = createMemo(() =>
    classes(
      fieldWrapper({
        horizontal: variantProps.horizontal,
        size: variantProps.size,
        type: variantProps.type,
        grouped: variantProps.grouped,
        groupMultiline: variantProps.groupMultiline,
      }),
      local.class,
      local.className
    )
  );

  const labelClass = createMemo(() =>
    labelStyles({ size: variantProps.size, type: variantProps.type })
  );

  const messageClass = createMemo(() =>
    messageStyles({ type: variantProps.type })
  );

  return (
    <div class={wrapperClass()} {...otherProps}>
      {/* Label */}
      <Show when={local.label}>
        <label class={labelClass()}>{local.label}</label>
      </Show>

      {/* Core search inputs/buttons */}
      <div class="flex gap-2">
        <input
          type="text"
          value={local.value}
          placeholder={local.placeholder}
          onInput={local.onInput}
          class={inputStyles({ size: variantProps.size })}
        />
        <button
          type="button"
          class={buttonStyles({
            color: variantProps.color ?? "primary",
            loading: local.loading,
          })}
          disabled={local.loading}
          onClick={local.onSearch}
        >
          <Show when={!local.loading} fallback={<span>Loading…</span>}>
            {local.buttonLabel ?? "Search"}
          </Show>
        </button>
      </div>

      {/* Error / message text */}
      <Show when={local.message}>
        <span class={messageClass()}>{local.message}</span>
      </Show>
    </div>
  );
};

export default Search;

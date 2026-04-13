import "./ColorField.css";
import { createEffect, createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { formatColor, parseColor, type ColorFormat } from "../color-wheel-flower/ColorUtils";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ColorField.classes";

const FALLBACK_COLOR = "#FFFFFF";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

const normalizeColor = (value: string, format: ColorFormat): string | null => {
  const parsed = parseColor(value);
  if (!parsed) return null;

  const formatted = formatColor(parsed, format);
  return format === "hex" ? formatted.toUpperCase() : formatted;
};

export type ColorFieldFormat = ColorFormat;

export type ColorFieldProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "type" | "value" | "defaultValue" | "onChange"
> &
  IComponentBaseProps & {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    isDisabled?: boolean;
    format?: ColorFieldFormat;
    fullWidth?: boolean;
  };

const ColorField: Component<ColorFieldProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "value",
    "defaultValue",
    "onChange",
    "isDisabled",
    "disabled",
    "format",
    "fullWidth",
    "dataTheme",
    "onInput",
    "onBlur",
    "onFocus",
    "onKeyDown",
  ]);

  const format = () => local.format ?? "hex";
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);

  const initialValue = () => {
    const seed = local.value ?? local.defaultValue ?? FALLBACK_COLOR;
    return normalizeColor(seed, format()) ?? FALLBACK_COLOR;
  };

  const [inputValue, setInputValue] = createSignal(initialValue());
  const [lastValidValue, setLastValidValue] = createSignal(initialValue());
  const [isInvalid, setIsInvalid] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);

  createEffect(() => {
    const nextValue = local.value;
    const nextFormat = format();

    if (isFocused()) return;

    if (nextValue !== undefined) {
      const normalized = normalizeColor(nextValue, nextFormat) ?? lastValidValue();
      setInputValue(normalized);
      setLastValidValue(normalized);
      setIsInvalid(false);
      return;
    }

    const normalized = normalizeColor(lastValidValue(), nextFormat) ?? FALLBACK_COLOR;
    setInputValue(normalized);
    setLastValidValue(normalized);
    setIsInvalid(false);
  });

  const emitIfValid = (value: string) => {
    const normalized = normalizeColor(value, format());
    if (!normalized) return null;
    local.onChange?.(normalized);
    return normalized;
  };

  const commit = () => {
    const normalized = emitIfValid(inputValue());

    if (normalized) {
      setInputValue(normalized);
      setLastValidValue(normalized);
      setIsInvalid(false);
      return;
    }

    setInputValue(lastValidValue());
    setIsInvalid(false);
  };

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (event) => {
    invokeEventHandler(local.onInput, event);
    if (event.defaultPrevented) return;

    const raw = event.currentTarget.value;
    setInputValue(raw);

    const normalized = emitIfValid(raw);
    if (normalized) {
      setLastValidValue(normalized);
      setIsInvalid(false);
      return;
    }

    setIsInvalid(raw.trim().length > 0);
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onBlur, event);
    setIsFocused(false);
    if (event.defaultPrevented) return;
    commit();
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (event) => {
    invokeEventHandler(local.onFocus, event);
    if (event.defaultPrevented) return;
    setIsFocused(true);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented) return;

    if (event.key === "Enter") {
      event.preventDefault();
      commit();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setInputValue(lastValidValue());
      setIsInvalid(false);
      event.currentTarget.blur();
    }
  };

  return (
    <div
      class={twMerge(
        CLASSES.base,
        local.fullWidth && CLASSES.flag.fullWidth,
        isDisabled() && CLASSES.flag.disabled,
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="color-field"
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <div
        class={twMerge(
          CLASSES.slot.group,
          isInvalid() && CLASSES.flag.groupInvalid,
          local.fullWidth && CLASSES.flag.groupFullWidth,
        )}
        data-slot="color-field-group"
        data-disabled={isDisabled() ? "true" : "false"}
        data-invalid={isInvalid() ? "true" : "false"}
      >
        <input
          {...others}
          type="text"
          value={inputValue()}
          disabled={isDisabled()}
          class={CLASSES.slot.input}
          data-slot="color-field-input"
          spellcheck={false}
          autocapitalize="off"
          autocomplete="off"
          autocorrect="off"
          aria-invalid={isInvalid() ? "true" : "false"}
          onInput={handleInput}
          onBlur={handleBlur}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default ColorField;

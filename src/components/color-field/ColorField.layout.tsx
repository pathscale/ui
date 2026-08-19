import "./ColorField.css";
import type { JSX } from "@solidjs/web";
import {
  type Component,
  createSignal,
  createTrackedEffect,
  omit,
} from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import {
  type ColorFormat,
  formatColor,
  parseColor,
} from "../color-wheel-flower/ColorUtils";
import type { State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ColorField.recipe";

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
  UIBaseProps & {
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    state?: State;
    format?: ColorFieldFormat;
    fullWidth?: boolean;
  };

const ColorField: Layout<typeof componentRecipe, ColorFieldProps> = () => {
  const others = omit(
    props,
    "class",
    "value",
    "defaultValue",
    "onChange",
    "state",
    "disabled",
    "format",
    "fullWidth",
    "dataTheme",
    "onInput",
    "onBlur",
    "onFocus",
    "onKeyDown",
  );

  const format = () => props.format ?? "hex";
  const isDisabled = () =>
    Boolean(props.state === "disabled") || Boolean(props.disabled);

  const initialValue = () => {
    const seed = props.value ?? props.defaultValue ?? FALLBACK_COLOR;
    return normalizeColor(seed, format()) ?? FALLBACK_COLOR;
  };

  const [inputValue, setInputValue] = createSignal(initialValue());
  const [lastValidValue, setLastValidValue] = createSignal(initialValue());
  const [isInvalid, setIsInvalid] = createSignal(false);
  const [isFocused, setIsFocused] = createSignal(false);

  createTrackedEffect(() => {
    const nextValue = props.value;
    const nextFormat = format();

    if (isFocused()) return;

    if (nextValue !== undefined) {
      const normalized =
        normalizeColor(nextValue, nextFormat) ?? lastValidValue();
      setInputValue(normalized);
      setLastValidValue(normalized);
      setIsInvalid(false);
      return;
    }

    const normalized =
      normalizeColor(lastValidValue(), nextFormat) ?? FALLBACK_COLOR;
    setInputValue(normalized);
    setLastValidValue(normalized);
    setIsInvalid(false);
  });

  const emitIfValid = (value: string) => {
    const normalized = normalizeColor(value, format());
    if (!normalized) return null;
    props.onChange?.(normalized);
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

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, InputEvent> = (
    event,
  ) => {
    invokeEventHandler(props.onInput, event);
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

  const handleBlur: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    invokeEventHandler(props.onBlur, event);
    setIsFocused(false);
    if (event.defaultPrevented) return;
    commit();
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    invokeEventHandler(props.onFocus, event);
    if (event.defaultPrevented) return;
    setIsFocused(true);
  };

  const handleKeyDown: JSX.EventHandlerUnion<
    HTMLInputElement,
    KeyboardEvent
  > = (event) => {
    invokeEventHandler(props.onKeyDown, event);
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
      {...{
        class: twMerge(
          CLASSES.base,
          props.fullWidth && CLASSES.flag.fullWidth,
          isDisabled() && CLASSES.flag.disabled,
          props.class,
        ),
      }}
      data-theme={props.dataTheme}
      data-slot="color-field"
      data-disabled={isDisabled() ? "true" : "false"}
      data-invalid={isInvalid() ? "true" : "false"}
      aria-disabled={isDisabled() ? "true" : "false"}
    >
      <div
        {...{
          class: twMerge(
            CLASSES.slot.group,
            isInvalid() && CLASSES.flag.groupInvalid,
            props.fullWidth && CLASSES.flag.groupFullWidth,
          ),
        }}
        data-slot="color-field-group"
        data-disabled={isDisabled() ? "true" : "false"}
        data-invalid={isInvalid() ? "true" : "false"}
      >
        <input
          {...others}
          type="text"
          value={inputValue()}
          disabled={isDisabled()}
          {...{ class: CLASSES.slot.input }}
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

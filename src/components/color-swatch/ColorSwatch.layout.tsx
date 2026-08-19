import "./ColorSwatch.css";
import type { JSX } from "@solidjs/web";
import {omit, useContext, type Component} from "solid-js";
import { twMerge } from "../../lib/twMerge";
import { ColorSwatchPickerContext } from "../color-swatch-picker/ColorSwatchPicker.generated";
import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./ColorSwatch.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ColorSwatch.recipe";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type ColorSwatchShape = "circle" | "square";
export type ColorSwatchSize = "xs" | "sm" | "md" | "lg" | "xl";

export type ColorSwatchProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "onSelect"> &
  UIBaseProps & {
    color: string;
    colorName?: string;
    shape?: ColorSwatchShape;
    size?: ColorSwatchSize;
    isSelected?: boolean;
    state?: State;
    onSelect?: (color: string) => void;
    onChange?: (color: string) => void;
  };

const ColorSwatch: Layout<typeof componentRecipe, ColorSwatchProps> = () => {
  const picker = useContext(ColorSwatchPickerContext);

  const others = omit(
    props,
    "class",
    "color",
    "colorName",
    "shape",
    "size",
    "isSelected",
    "state",
    "disabled",
    "onSelect",
    "onChange",
    "onClick",
    "onKeyDown",
    "style",
    "dataTheme",
    "aria-label",
    "role",
    "tabindex",
  );

  const isInsidePicker = () => Boolean(picker);
  const hasPickerSelection = () => (picker ? picker.value() !== undefined : false);
  const shape = () => props.shape ?? "circle";
  const size = () => props.size ?? "md";

  const isDisabled = () => {
    const localDisabled = Boolean((props.state === "disabled")) || Boolean(props.disabled);
    const pickerDisabled = picker ? picker.isDisabled() : false;
    return localDisabled || pickerDisabled;
  };

  const isSelected = () => {
    if (props.isSelected !== undefined) {
      return Boolean(props.isSelected);
    }

    if (!picker) {
      return false;
    }

    return picker.value() === props.color;
  };

  const emitSelection = () => {
    props.onSelect?.(props.color);
    props.onChange?.(props.color);
    picker?.select(props.color);
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented || isDisabled()) return;
    emitSelection();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      emitSelection();
    }
  };

  const style = (): JSX.CSSProperties => {
    const userStyle = props.style as JSX.CSSProperties | undefined;

    return {
      "--color-swatch-current": props.color,
      ...userStyle,
    };
  };

  const tabindex = () => {
    if (props.tabindex !== undefined) {
      return props.tabindex;
    }

    if (!isInsidePicker()) {
      return undefined;
    }

    if (!hasPickerSelection()) {
      return 0;
    }

    return isSelected() ? 0 : -1;
  };

  return (
    <button
      {...others}
      type="button"
      class={twMerge(
        CLASSES.base,
        CLASSES.shape[shape()],
        CLASSES.size[size()],
        props.class,
      )}
      data-theme={props.dataTheme}
      data-slot="color-swatch"
      data-color-value={props.color}
      data-picker-item={isInsidePicker() ? "true" : "false"}
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      role={props.role ?? (isInsidePicker() ? "radio" : "option")}
      tabindex={tabindex()}
      aria-label={local["aria-label"] ?? props.colorName ?? `Color ${props.color}`}
      aria-selected={isSelected() ? "true" : "false"}
      aria-checked={isInsidePicker() ? (isSelected() ? "true" : "false") : undefined}
      aria-disabled={isDisabled() ? "true" : "false"}
      style={style()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    />
  );
};

export default ColorSwatch;

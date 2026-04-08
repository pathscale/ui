import "./ColorSwatch.css";
import { splitProps, useContext, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { ColorSwatchPickerContext } from "../color-swatch-picker/ColorSwatchPicker";
import type { IComponentBaseProps } from "../types";

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
  IComponentBaseProps & {
    color: string;
    colorName?: string;
    shape?: ColorSwatchShape;
    size?: ColorSwatchSize;
    isSelected?: boolean;
    isDisabled?: boolean;
    onSelect?: (color: string) => void;
    onChange?: (color: string) => void;
  };

const shapeClassMap: Record<ColorSwatchShape, string> = {
  circle: "color-swatch--circle",
  square: "color-swatch--square",
};

const sizeClassMap: Record<ColorSwatchSize, string> = {
  xs: "color-swatch--xs",
  sm: "color-swatch--sm",
  md: "color-swatch--md",
  lg: "color-swatch--lg",
  xl: "color-swatch--xl",
};

const ColorSwatch: Component<ColorSwatchProps> = (props) => {
  const picker = useContext(ColorSwatchPickerContext);

  const [local, others] = splitProps(props, [
    "class",
    "className",
    "color",
    "colorName",
    "shape",
    "size",
    "isSelected",
    "isDisabled",
    "disabled",
    "onSelect",
    "onChange",
    "onClick",
    "onKeyDown",
    "style",
    "dataTheme",
    "aria-label",
    "role",
    "tabIndex",
  ]);

  const isInsidePicker = () => Boolean(picker);
  const hasPickerSelection = () => (picker ? picker.value() !== undefined : false);
  const shape = () => local.shape ?? "circle";
  const size = () => local.size ?? "md";

  const isDisabled = () => {
    const localDisabled = Boolean(local.isDisabled) || Boolean(local.disabled);
    const pickerDisabled = picker ? picker.isDisabled() : false;
    return localDisabled || pickerDisabled;
  };

  const isSelected = () => {
    if (local.isSelected !== undefined) {
      return Boolean(local.isSelected);
    }

    if (!picker) {
      return false;
    }

    return picker.value() === local.color;
  };

  const emitSelection = () => {
    local.onSelect?.(local.color);
    local.onChange?.(local.color);
    picker?.select(local.color);
  };

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented || isDisabled()) return;
    emitSelection();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      emitSelection();
    }
  };

  const style = (): JSX.CSSProperties => {
    const userStyle = local.style as JSX.CSSProperties | undefined;

    return {
      "--color-swatch-current": local.color,
      ...userStyle,
    };
  };

  const tabIndex = () => {
    if (local.tabIndex !== undefined) {
      return local.tabIndex;
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
        "color-swatch",
        shapeClassMap[shape()],
        sizeClassMap[size()],
        local.class,
        local.className,
      )}
      data-theme={local.dataTheme}
      data-slot="color-swatch"
      data-color-value={local.color}
      data-picker-item={isInsidePicker() ? "true" : "false"}
      data-selected={isSelected() ? "true" : "false"}
      data-disabled={isDisabled() ? "true" : "false"}
      disabled={isDisabled()}
      role={local.role ?? (isInsidePicker() ? "radio" : "option")}
      tabIndex={tabIndex()}
      aria-label={local["aria-label"] ?? local.colorName ?? `Color ${local.color}`}
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

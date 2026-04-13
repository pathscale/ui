import "./ColorSwatchPicker.css";
import {
  createContext,
  createMemo,
  createSignal,
  splitProps,
  type Accessor,
  type Component,
  type JSX,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ColorSwatchPicker.classes";

const invokeEventHandler = (handler: unknown, event: Event) => {
  if (typeof handler === "function") {
    (handler as (event: Event) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type ColorSwatchPickerContextValue = {
  value: Accessor<string | undefined>;
  isDisabled: Accessor<boolean>;
  select: (value: string) => void;
};

export const ColorSwatchPickerContext = createContext<ColorSwatchPickerContextValue>();

export type ColorSwatchPickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> &
  IComponentBaseProps & {
    children: JSX.Element;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    isDisabled?: boolean;
  };

const ColorSwatchPicker: Component<ColorSwatchPickerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "children",
    "value",
    "defaultValue",
    "onChange",
    "isDisabled",
    "dataTheme",
    "role",
    "onKeyDown",
  ]);

  const [internalValue, setInternalValue] = createSignal<string | undefined>(local.defaultValue);
  let rootRef: HTMLDivElement | undefined;

  const isControlled = () => local.value !== undefined;
  const currentValue = () => (isControlled() ? local.value : internalValue());
  const isDisabled = () => Boolean(local.isDisabled);

  const setValue = (next: string) => {
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalValue(next);
    }
    local.onChange?.(next);
  };

  const getEnabledItems = () => {
    if (!rootRef) return [] as HTMLButtonElement[];

    return Array.from(
      rootRef.querySelectorAll<HTMLButtonElement>(
        '[data-picker-item="true"][data-disabled="false"]',
      ),
    );
  };

  const findFocusedOrSelectedIndex = (items: HTMLButtonElement[]) => {
    if (!items.length) return -1;

    const active = document.activeElement;
    const focusedIndex = items.findIndex((item) => item === active);
    if (focusedIndex >= 0) return focusedIndex;

    const selected = currentValue();
    if (!selected) return 0;

    const selectedIndex = items.findIndex((item) => item.dataset.colorValue === selected);
    return selectedIndex >= 0 ? selectedIndex : 0;
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    const key = event.key;
    const moveNext = key === "ArrowRight" || key === "ArrowDown";
    const movePrev = key === "ArrowLeft" || key === "ArrowUp";
    const moveFirst = key === "Home";
    const moveLast = key === "End";

    if (!moveNext && !movePrev && !moveFirst && !moveLast) {
      return;
    }

    const items = getEnabledItems();
    if (!items.length) return;

    event.preventDefault();

    const currentIndex = findFocusedOrSelectedIndex(items);
    let nextIndex = currentIndex;

    if (moveFirst) {
      nextIndex = 0;
    } else if (moveLast) {
      nextIndex = items.length - 1;
    } else if (moveNext) {
      nextIndex = (currentIndex + 1 + items.length) % items.length;
    } else if (movePrev) {
      nextIndex = (currentIndex - 1 + items.length) % items.length;
    }

    const nextItem = items[nextIndex];
    if (!nextItem) return;

    nextItem.focus();

    const nextColor = nextItem.dataset.colorValue;
    if (nextColor) {
      setValue(nextColor);
    }
  };

  const context = createMemo<ColorSwatchPickerContextValue>(() => ({
    value: currentValue,
    isDisabled,
    select: setValue,
  }));

  return (
    <ColorSwatchPickerContext.Provider value={context()}>
      <div
        {...others}
        ref={rootRef}
        {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
        data-theme={local.dataTheme}
        data-slot="color-swatch-picker"
        data-disabled={isDisabled() ? "true" : "false"}
        role={local.role ?? "radiogroup"}
        aria-disabled={isDisabled() ? "true" : "false"}
        onKeyDown={handleKeyDown}
      >
        {local.children}
      </div>
    </ColorSwatchPickerContext.Provider>
  );
};

export { ColorSwatchPicker as default, ColorSwatchPicker };

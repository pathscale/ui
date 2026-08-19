import "./ColorSwatchPicker.css";
import type { JSX } from "@solidjs/web";
import {
  type Accessor,
  type Component,
  createContext,
  createMemo,
  createSignal,
  omit,
} from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { State, UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./ColorSwatchPicker.recipe";

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

export const ColorSwatchPickerContext =
  createContext<ColorSwatchPickerContextValue | null>(null);

export type ColorSwatchPickerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> &
  UIBaseProps & {
    children: JSX.Element;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    state?: State;
  };

const ColorSwatchPicker: Layout<
  typeof componentRecipe,
  ColorSwatchPickerProps
> = () => {
  const others = omit(
    props,
    "class",
    "children",
    "value",
    "defaultValue",
    "onChange",
    "state",
    "dataTheme",
    "role",
    "onKeyDown",
  );

  const [internalValue, setInternalValue] = createSignal<string | undefined>(
    props.defaultValue,
  );
  let rootRef: HTMLDivElement | undefined;

  const isControlled = () => props.value !== undefined;
  const currentValue = () => (isControlled() ? props.value : internalValue());
  const isDisabled = () => Boolean(props.state === "disabled");

  const setValue = (next: string) => {
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalValue(next);
    }
    props.onChange?.(next);
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

    const selectedIndex = items.findIndex(
      (item) => item.dataset.colorValue === selected,
    );
    return selectedIndex >= 0 ? selectedIndex : 0;
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (
    event,
  ) => {
    invokeEventHandler(props.onKeyDown, event);
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
    <ColorSwatchPickerContext value={context()}>
      <div
        {...others}
        ref={rootRef}
        {...{ class: twMerge(CLASSES.base, props.class) }}
        data-theme={props.dataTheme}
        data-slot="color-swatch-picker"
        data-disabled={isDisabled() ? "true" : "false"}
        role={props.role ?? "radiogroup"}
        aria-disabled={isDisabled() ? "true" : "false"}
        onKeyDown={handleKeyDown}
      >
        {props.children}
      </div>
    </ColorSwatchPickerContext>
  );
};

export { ColorSwatchPicker as default, ColorSwatchPicker };

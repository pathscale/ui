import "./Accordion.css";
import type { JSX } from "@solidjs/web";
import {Show, createContext, createMemo, createSignal, createUniqueId, omit, useContext, type Component, type ParentComponent} from "solid-js";
import { twMerge } from "../../lib/twMerge";

import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Accordion.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Accordion.recipe";

export type AccordionSelectionMode = "single" | "multiple";
export type AccordionVariant = "default" | "surface";
export type AccordionValue = string | string[];

const normalizeAccordionValue = (
  value: AccordionValue | undefined,
  selectionMode: AccordionSelectionMode,
) => {
  if (value === undefined) return [];

  const raw = Array.isArray(value) ? value : [value];
  const normalized = Array.from(new Set(raw.map((entry) => String(entry))));
  return selectionMode === "single" ? normalized.slice(0, 1) : normalized;
};

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

type AccordionContextValue = {
  selectionMode: () => AccordionSelectionMode;
  variant: () => AccordionVariant;
  hideSeparator: () => boolean;
  isDisabled: () => boolean;
  isItemExpanded: (value: string) => boolean;
  toggleItem: (value: string) => void;
  handleTriggerKeyDown: (
    event: KeyboardEvent,
    currentTarget: HTMLButtonElement,
  ) => void;
};

/*
 * Defaulted to `null`: this context is optional by construction.
 *
 * Consumers either optional-chain it or guard on it, so the component works
 * standalone without its root, which is a supported shape. Solid 2 made that
 * throw: `getContext` raises `ContextNotFoundError` when the resolved value is
 * `undefined`, and it throws before the optional chain can run. `null` is a
 * value, so the lookup succeeds and the existing reads behave as they always
 * have.
 *
 * A truthy default such as `{}` would silence the throw and be worse: the
 * optional chain would then call methods that do not exist.
 */
const AccordionContext = createContext<AccordionContextValue | null>(null);

type AccordionItemContextValue = {
  value: () => string;
  triggerId: () => string;
  contentId: () => string;
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  toggle: () => void;
};

/*
 * Defaulted to `null`: this context is optional by construction.
 *
 * Consumers either optional-chain it or guard on it, so the component works
 * standalone without its root, which is a supported shape. Solid 2 made that
 * throw: `getContext` raises `ContextNotFoundError` when the resolved value is
 * `undefined`, and it throws before the optional chain can run. `null` is a
 * value, so the lookup succeeds and the existing reads behave as they always
 * have.
 *
 * A truthy default such as `{}` would silence the throw and be worse: the
 * optional chain would then call methods that do not exist.
 */
const AccordionItemContext = createContext<AccordionItemContextValue | null>(null);

export type AccordionRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    selectionMode?: AccordionSelectionMode;
    value?: AccordionValue;
    defaultValue?: AccordionValue;
    onValueChange?: (value: string[]) => void;
    hideSeparator?: boolean;
    variant?: AccordionVariant;
    state?: State;
    disabled?: boolean;
  };

export type AccordionItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    value?: string;
    children?: JSX.Element;
    state?: State;
    disabled?: boolean;
  };

export type AccordionTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  UIBaseProps & {
    children?: JSX.Element;
    showIndicator?: boolean;
    indicator?: JSX.Element;
  };

export type AccordionContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    keepMounted?: boolean;
  };

export type AccordionIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const AccordionRoot: Layout<typeof componentRecipe, AccordionRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "selectionMode",
    "value",
    "defaultValue",
    "onValueChange",
    "hideSeparator",
    "variant",
    "state",
    "disabled",
    "ref",
  );

  const selectionMode = () => props.selectionMode ?? "single";
  const variant = () => props.variant ?? "default";
  const hideSeparator = () => Boolean(props.hideSeparator);
  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled);

  const [internalValue, setInternalValue] = createSignal<string[]>(
    normalizeAccordionValue(props.defaultValue, selectionMode()),
  );

  const selectedValues = createMemo(() =>
    props.value !== undefined
      ? normalizeAccordionValue(props.value, selectionMode())
      : normalizeAccordionValue(internalValue(), selectionMode()),
  );

  const isItemExpanded = (value: string) => selectedValues().includes(value);

  const setSelectedValues = (nextValues: string[]) => {
    const normalizedNextValues = normalizeAccordionValue(nextValues, selectionMode());

    if (props.value === undefined) {
      setInternalValue(normalizedNextValues);
    }

    props.onValueChange?.(normalizedNextValues);
  };

  const toggleItem = (value: string) => {
    if (isDisabled()) return;

    const currentValues = selectedValues();
    const isExpanded = currentValues.includes(value);

    if (selectionMode() === "single") {
      setSelectedValues(isExpanded ? [] : [value]);
      return;
    }

    const next = new Set(currentValues);
    if (isExpanded) {
      next.delete(value);
    } else {
      next.add(value);
    }

    setSelectedValues(Array.from(next));
  };

  let rootRef: HTMLDivElement | undefined;

  const handleTriggerKeyDown = (
    event: KeyboardEvent,
    currentTarget: HTMLButtonElement,
  ) => {
    if (
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp" &&
      event.key !== "Home" &&
      event.key !== "End"
    ) {
      return;
    }

    if (!rootRef) return;

    const triggers = Array.from(
      rootRef.querySelectorAll<HTMLButtonElement>('[data-slot="accordion-trigger"]'),
    ).filter(
      (trigger) =>
        !trigger.disabled && trigger.getAttribute("aria-disabled") !== "true",
    );

    if (!triggers.length) return;

    const currentIndex = triggers.indexOf(currentTarget);
    if (currentIndex < 0) return;

    event.preventDefault();

    if (event.key === "Home") {
      triggers[0]?.focus();
      return;
    }

    if (event.key === "End") {
      triggers[triggers.length - 1]?.focus();
      return;
    }

    const direction = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      (currentIndex + direction + triggers.length) % triggers.length;
    triggers[nextIndex]?.focus();
  };

  const contextValue: AccordionContextValue = {
    selectionMode,
    variant,
    hideSeparator,
    isDisabled,
    isItemExpanded,
    toggleItem,
    handleTriggerKeyDown,
  };

  return (
    <AccordionContext value={contextValue}>
      <div
        {...others}
        ref={(node) => {
          rootRef = node;
          if (typeof props.ref === "function") {
            props.ref(node);
          }
        }}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          props.class,
        ) }}
        data-slot="accordion"
        data-selection-mode={selectionMode()}
        data-hide-separator={hideSeparator() ? "true" : undefined}
        data-variant={variant()}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={props.dataTheme}
        style={props.style}
        aria-disabled={isDisabled() ? "true" : undefined}
      >
        {props.children}
      </div>
    </AccordionContext>
  );
};

const AccordionItem: Layout<typeof componentRecipe, AccordionItemProps> = () => {
  const accordion = useContext(AccordionContext);
  const others = omit(
    props,
    "value",
    "children",
    "class",
    "dataTheme",
    "style",
    "state",
    "disabled",
  );

  const uniqueId = createUniqueId();
  const itemValue = () => props.value ?? uniqueId;
  const triggerId = () => `accordion-trigger-${uniqueId}`;
  const contentId = () => `accordion-content-${uniqueId}`;

  const isExpanded = () =>
    accordion?.isItemExpanded(itemValue()) ?? false;
  const isDisabled = () =>
    Boolean((props.state === "disabled")) ||
    Boolean(props.disabled) ||
    Boolean(accordion?.isDisabled());

  const toggle = () => {
    if (isDisabled()) return;
    accordion?.toggleItem(itemValue());
  };

  const itemContextValue: AccordionItemContextValue = {
    value: itemValue,
    triggerId,
    contentId,
    isExpanded,
    isDisabled,
    toggle,
  };

  return (
    <AccordionItemContext value={itemContextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Item.base,
          isExpanded() && CLASSES.Item.flag.expanded,
          isDisabled() && CLASSES.Item.flag.disabled,
          accordion?.hideSeparator() && CLASSES.Item.flag.hideSeparator,
          props.class,
        ) }}
        data-slot="accordion-item"
        data-expanded={isExpanded() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </div>
    </AccordionItemContext>
  );
};

const AccordionTrigger: Layout<typeof componentRecipe, AccordionTriggerProps> = () => {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "onClick",
    "onKeyDown",
    "type",
    "showIndicator",
    "indicator",
  );

  const isDisabled = () => Boolean(item?.isDisabled());

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(props.onClick, event);
    if (event.defaultPrevented || isDisabled()) return;
    item?.toggle();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(props.onKeyDown, event);
    if (event.defaultPrevented || isDisabled()) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      item?.toggle();
      return;
    }

    accordion?.handleTriggerKeyDown(event, event.currentTarget);
  };

  return (
    <button
      {...others}
      id={item?.triggerId()}
      type={props.type ?? "button"}
      {...{ class: twMerge(CLASSES.Trigger.base, props.class) }}
      data-slot="accordion-trigger"
      data-expanded={item?.isExpanded() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      aria-expanded={item?.isExpanded() ? "true" : "false"}
      aria-controls={item?.contentId()}
      aria-disabled={isDisabled() ? "true" : undefined}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {props.children}
      <Show when={props.showIndicator !== false}>
        <AccordionIndicator>{props.indicator}</AccordionIndicator>
      </Show>
    </button>
  );
};

const AccordionContent: Layout<typeof componentRecipe, AccordionContentProps> = () => {
  const item = useContext(AccordionItemContext);
  const others = omit(props, "children", "class", "dataTheme", "style", "keepMounted");

  const expanded = () => Boolean(item?.isExpanded());
  const keepMounted = () => props.keepMounted ?? true;

  if (!keepMounted() && !expanded()) {
    return null;
  }

  return (
    <div
      {...others}
      id={item?.contentId()}
      role="region"
      {...{ class: twMerge(
        CLASSES.Content.base,
        expanded() && CLASSES.Content.flag.expanded,
        props.class,
      ) }}
      data-slot="accordion-content"
      data-expanded={expanded() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      aria-hidden={expanded() ? "false" : "true"}
      aria-labelledby={item?.triggerId()}
    >
      <div {...{ class: CLASSES.Body.base }} data-slot="accordion-body">
        <div {...{ class: CLASSES.BodyInner.base }} data-slot="accordion-body-inner">
          {props.children}
        </div>
      </div>
    </div>
  );
};

const AccordionIndicator: Layout<typeof componentRecipe, AccordionIndicatorProps> = () => {
  const item = useContext(AccordionItemContext);
  const others = omit(props, "children", "class", "dataTheme", "style");

  const expanded = () => Boolean(item?.isExpanded());

  return (
    <span
      {...others}
      aria-hidden="true"
      {...{ class: twMerge(
        CLASSES.Indicator.base,
        expanded() && CLASSES.Indicator.flag.expanded,
        props.class,
      ) }}
      data-slot="accordion-indicator"
      data-expanded={expanded() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children ?? (
        <svg
          fill="none"
          role="presentation"
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
        >
          <path
            d="M6 9L12 15L18 9"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </span>
  );
};

const Accordion = Object.assign(AccordionRoot, {
  Root: AccordionRoot,
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
  Indicator: AccordionIndicator,
});

export default Accordion;
export {
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionIndicator,
};
export type { AccordionRootProps as AccordionProps };

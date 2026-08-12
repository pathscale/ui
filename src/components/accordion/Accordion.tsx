import "./Accordion.css";
import {
  Show,
  createContext,
  createMemo,
  createSignal,
  createUniqueId,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Accordion.classes";

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

const AccordionContext = createContext<AccordionContextValue>();

type AccordionItemContextValue = {
  value: () => string;
  triggerId: () => string;
  contentId: () => string;
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  toggle: () => void;
};

const AccordionItemContext = createContext<AccordionItemContextValue>();

export type AccordionRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    selectionMode?: AccordionSelectionMode;
    value?: AccordionValue;
    defaultValue?: AccordionValue;
    onValueChange?: (value: string[]) => void;
    hideSeparator?: boolean;
    variant?: AccordionVariant;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type AccordionItemProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    value?: string;
    children?: JSX.Element;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type AccordionTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    showIndicator?: boolean;
    indicator?: JSX.Element;
  };

export type AccordionContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    keepMounted?: boolean;
  };

export type AccordionIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const AccordionRoot: ParentComponent<AccordionRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "selectionMode",
    "value",
    "defaultValue",
    "onValueChange",
    "hideSeparator",
    "variant",
    "isDisabled",
    "disabled",
    "ref",
  ]);

  const selectionMode = () => local.selectionMode ?? "single";
  const variant = () => local.variant ?? "default";
  const hideSeparator = () => Boolean(local.hideSeparator);
  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);

  const [internalValue, setInternalValue] = createSignal<string[]>(
    normalizeAccordionValue(local.defaultValue, selectionMode()),
  );

  const selectedValues = createMemo(() =>
    local.value !== undefined
      ? normalizeAccordionValue(local.value, selectionMode())
      : normalizeAccordionValue(internalValue(), selectionMode()),
  );

  const isItemExpanded = (value: string) => selectedValues().includes(value);

  const setSelectedValues = (nextValues: string[]) => {
    const normalizedNextValues = normalizeAccordionValue(nextValues, selectionMode());

    if (local.value === undefined) {
      setInternalValue(normalizedNextValues);
    }

    local.onValueChange?.(normalizedNextValues);
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
    <AccordionContext.Provider value={contextValue}>
      <div
        {...others}
        ref={(node) => {
          rootRef = node;
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        {...{ class: twMerge(
          CLASSES.Root.base,
          CLASSES.Root.variant[variant()],
          local.class,
          local.className,
        ) }}
        data-slot="accordion"
        data-selection-mode={selectionMode()}
        data-hide-separator={hideSeparator() ? "true" : undefined}
        data-variant={variant()}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
        aria-disabled={isDisabled() ? "true" : undefined}
      >
        {local.children}
      </div>
    </AccordionContext.Provider>
  );
};

const AccordionItem: ParentComponent<AccordionItemProps> = (props) => {
  const accordion = useContext(AccordionContext);
  const [local, others] = splitProps(props, [
    "value",
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "isDisabled",
    "disabled",
  ]);

  const uniqueId = createUniqueId();
  const itemValue = () => local.value ?? uniqueId;
  const triggerId = () => `accordion-trigger-${uniqueId}`;
  const contentId = () => `accordion-content-${uniqueId}`;

  const isExpanded = () =>
    accordion?.isItemExpanded(itemValue()) ?? false;
  const isDisabled = () =>
    Boolean(local.isDisabled) ||
    Boolean(local.disabled) ||
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
    <AccordionItemContext.Provider value={itemContextValue}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.Item.base,
          isExpanded() && CLASSES.Item.flag.expanded,
          isDisabled() && CLASSES.Item.flag.disabled,
          accordion?.hideSeparator() && CLASSES.Item.flag.hideSeparator,
          local.class,
          local.className,
        ) }}
        data-slot="accordion-item"
        data-expanded={isExpanded() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </AccordionItemContext.Provider>
  );
};

const AccordionTrigger: Component<AccordionTriggerProps> = (props) => {
  const accordion = useContext(AccordionContext);
  const item = useContext(AccordionItemContext);

  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onClick",
    "onKeyDown",
    "type",
    "showIndicator",
    "indicator",
  ]);

  const isDisabled = () => Boolean(item?.isDisabled());

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented || isDisabled()) return;
    item?.toggle();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    invokeEventHandler(local.onKeyDown, event);
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
      type={local.type ?? "button"}
      {...{ class: twMerge(CLASSES.Trigger.base, local.class, local.className) }}
      data-slot="accordion-trigger"
      data-expanded={item?.isExpanded() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-expanded={item?.isExpanded() ? "true" : "false"}
      aria-controls={item?.contentId()}
      aria-disabled={isDisabled() ? "true" : undefined}
      disabled={isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {local.children}
      <Show when={local.showIndicator !== false}>
        <AccordionIndicator>{local.indicator}</AccordionIndicator>
      </Show>
    </button>
  );
};

const AccordionContent: ParentComponent<AccordionContentProps> = (props) => {
  const item = useContext(AccordionItemContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "keepMounted",
  ]);

  const expanded = () => Boolean(item?.isExpanded());
  const keepMounted = () => local.keepMounted ?? true;

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
        local.class,
        local.className,
      ) }}
      data-slot="accordion-content"
      data-expanded={expanded() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-hidden={expanded() ? "false" : "true"}
      aria-labelledby={item?.triggerId()}
    >
      <div {...{ class: CLASSES.Body.base }} data-slot="accordion-body">
        <div {...{ class: CLASSES.BodyInner.base }} data-slot="accordion-body-inner">
          {local.children}
        </div>
      </div>
    </div>
  );
};

const AccordionIndicator: Component<AccordionIndicatorProps> = (props) => {
  const item = useContext(AccordionItemContext);
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const expanded = () => Boolean(item?.isExpanded());

  return (
    <span
      {...others}
      aria-hidden="true"
      {...{ class: twMerge(
        CLASSES.Indicator.base,
        expanded() && CLASSES.Indicator.flag.expanded,
        local.class,
        local.className,
      ) }}
      data-slot="accordion-indicator"
      data-expanded={expanded() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children ?? (
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

import "./Collapsible.css";
import type { JSX } from "@solidjs/web";
import {Show, createContext, createMemo, createSignal, createUniqueId, omit, useContext, type Component, type ParentComponent} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps, State } from "../vocabulary";
import { CLASSES } from "./Collapsible.recipe";
import type { Layout } from "../../lib/layouts";
import { shouldMountCollapsibleContent } from "./Collapsible.mounting";
import { componentRecipe } from "./Collapsible.recipe";

type CollapsibleContextValue = {
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  triggerId: () => string;
  contentId: () => string;
  toggle: () => void;
};

const CollapsibleContext = createContext<CollapsibleContextValue>();

const useCollapsibleContext = () => {
  const ctx = useContext(CollapsibleContext);
  if (!ctx) throw new Error("Collapsible compound components must be used within <Collapsible>");
  return ctx;
};

export type CollapsibleRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    id?: string;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    state?: State;
    disabled?: boolean;
  };

export type CollapsibleHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

export type CollapsibleTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  UIBaseProps & {
    children?: JSX.Element;
  };

export type CollapsibleContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    keepMounted?: boolean;
  };

export type CollapsibleBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

export type CollapsibleIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const normalizeKey = (value: string) => String(value);

const CollapsibleRoot: Layout<typeof componentRecipe, CollapsibleRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "id",
    "open",
    "defaultOpen",
    "onOpenChange",
    "state",
    "disabled",
  );

  const uniqueId = createUniqueId();
  const itemId = () => normalizeKey(props.id ?? uniqueId);
  const triggerId = () => `collapsible-trigger-${itemId()}`;
  const contentId = () => `collapsible-content-${itemId()}`;

  const [internalOpen, setInternalOpen] = createSignal(Boolean(props.defaultOpen));
  const isControlled = createMemo(() => props.open !== undefined);
  const standaloneOpen = createMemo(() =>
    isControlled() ? Boolean(props.open) : internalOpen(),
  );

  const isDisabled = () => Boolean((props.state === "disabled")) || Boolean(props.disabled);
  const isExpanded = () => standaloneOpen();

  const setOpen = (next: boolean) => {
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalOpen(next);
    }
    if (standaloneOpen() !== next) {
      props.onOpenChange?.(next);
    }
  };

  const toggle = () => setOpen(!isExpanded());

  const ctx: CollapsibleContextValue = {
    isExpanded,
    isDisabled,
    triggerId,
    contentId,
    toggle,
  };

  return (
    <CollapsibleContext value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.base,
          isExpanded() && CLASSES.flag.expanded,
          isDisabled() && CLASSES.flag.disabled,
          props.class,
        ) }}
        data-slot="collapsible"
        data-expanded={isExpanded() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </div>
    </CollapsibleContext>
  );
};

const CollapsibleHeading: Layout<typeof componentRecipe, CollapsibleHeadingProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <h3
      {...others}
      {...{ class: twMerge(CLASSES.slot.heading, props.class) }}
      data-slot="collapsible-heading"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </h3>
  );
};

const CollapsibleTrigger: Layout<typeof componentRecipe, CollapsibleTriggerProps> = () => {
  const ctx = useCollapsibleContext();
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "onClick",
    "onKeyDown",
    "type",
  );

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    if (typeof props.onClick === "function") props.onClick(event);
    if (event.defaultPrevented) return;
    ctx.toggle();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    if (typeof props.onKeyDown === "function") props.onKeyDown(event);
    if (event.defaultPrevented) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ctx.toggle();
    }
  };

  return (
    <button
      {...others}
      id={ctx.triggerId()}
      type={props.type ?? "button"}
      {...{ class: twMerge(CLASSES.slot.trigger, props.class) }}
      data-slot="collapsible-trigger"
      data-expanded={ctx.isExpanded() ? "true" : "false"}
      data-theme={props.dataTheme}
      style={props.style}
      aria-expanded={ctx.isExpanded() ? "true" : "false"}
      aria-controls={ctx.contentId()}
      aria-disabled={ctx.isDisabled() ? "true" : undefined}
      disabled={ctx.isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {props.children}
    </button>
  );
};

const CollapsibleContent: Layout<typeof componentRecipe, CollapsibleContentProps> = () => {
  const ctx = useCollapsibleContext();
  const others = omit(props, "children", "class", "dataTheme", "style", "keepMounted");

  const expanded = () => ctx.isExpanded();
  const keepMounted = () => props.keepMounted ?? true;

  return (
    <Show when={shouldMountCollapsibleContent(keepMounted(), expanded())}>
      <div
        {...others}
        id={ctx.contentId()}
        role="region"
        {...{ class: twMerge(CLASSES.slot.content, props.class) }}
        data-slot="collapsible-content"
        data-expanded={expanded() ? "true" : "false"}
        data-theme={props.dataTheme}
        style={props.style}
        aria-hidden={expanded() ? "false" : "true"}
        aria-labelledby={ctx.triggerId()}
      >
        {props.children}
      </div>
    </Show>
  );
};

const CollapsibleBody: Layout<typeof componentRecipe, CollapsibleBodyProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.body, props.class) }}
      data-slot="collapsible-body"
      data-theme={props.dataTheme}
      style={props.style}
    >
      <div {...{ class: CLASSES.slot.bodyInner }} data-slot="collapsible-body-inner">
        {props.children}
      </div>
    </div>
  );
};

const CollapsibleIndicator: Layout<typeof componentRecipe, CollapsibleIndicatorProps> = () => {
  const ctx = useCollapsibleContext();
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <span
      {...others}
      aria-hidden="true"
      {...{ class: twMerge(CLASSES.slot.indicator, props.class) }}
      data-slot="collapsible-indicator"
      data-expanded={ctx.isExpanded() ? "true" : "false"}
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

const Collapsible = Object.assign(CollapsibleRoot, {
  Root: CollapsibleRoot,
  Heading: CollapsibleHeading,
  Trigger: CollapsibleTrigger,
  Content: CollapsibleContent,
  Body: CollapsibleBody,
  Indicator: CollapsibleIndicator,
});

export default Collapsible;
export {
  CollapsibleRoot,
  CollapsibleHeading,
  CollapsibleTrigger,
  CollapsibleContent,
  CollapsibleBody,
  CollapsibleIndicator,
};

export type { CollapsibleRootProps as CollapsibleProps };

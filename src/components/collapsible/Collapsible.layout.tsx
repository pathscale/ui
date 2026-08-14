import "./Collapsible.css";
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
import { CLASSES } from "./Collapsible.recipe";
import type { Layout } from "../../lib/layouts";
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
  IComponentBaseProps & {
    children?: JSX.Element;
    id?: string;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type CollapsibleHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type CollapsibleTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type CollapsibleContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    keepMounted?: boolean;
  };

export type CollapsibleBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type CollapsibleIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const normalizeKey = (value: string) => String(value);

const CollapsibleRoot: Layout<typeof componentRecipe, CollapsibleRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "isDisabled",
    "disabled",
  ]);

  const uniqueId = createUniqueId();
  const itemId = () => normalizeKey(local.id ?? uniqueId);
  const triggerId = () => `collapsible-trigger-${itemId()}`;
  const contentId = () => `collapsible-content-${itemId()}`;

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const isControlled = createMemo(() => local.isOpen !== undefined);
  const standaloneOpen = createMemo(() =>
    isControlled() ? Boolean(local.isOpen) : internalOpen(),
  );

  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled);
  const isExpanded = () => standaloneOpen();

  const setOpen = (next: boolean) => {
    if (isDisabled()) return;

    if (!isControlled()) {
      setInternalOpen(next);
    }
    if (standaloneOpen() !== next) {
      local.onOpenChange?.(next);
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
    <CollapsibleContext.Provider value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.base,
          isExpanded() && CLASSES.flag.expanded,
          isDisabled() && CLASSES.flag.disabled,
          local.class,
          local.className,
        ) }}
        data-slot="collapsible"
        data-expanded={isExpanded() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </CollapsibleContext.Provider>
  );
};

const CollapsibleHeading: Layout<typeof componentRecipe, CollapsibleHeadingProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <h3
      {...others}
      {...{ class: twMerge(CLASSES.slot.heading, local.class, local.className) }}
      data-slot="collapsible-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h3>
  );
};

const CollapsibleTrigger: Layout<typeof componentRecipe, CollapsibleTriggerProps> = () => {
  const ctx = useCollapsibleContext();
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onClick",
    "onKeyDown",
    "type",
  ]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    if (typeof local.onClick === "function") local.onClick(event);
    if (event.defaultPrevented) return;
    ctx.toggle();
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLButtonElement, KeyboardEvent> = (event) => {
    if (typeof local.onKeyDown === "function") local.onKeyDown(event);
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
      type={local.type ?? "button"}
      {...{ class: twMerge(CLASSES.slot.trigger, local.class, local.className) }}
      data-slot="collapsible-trigger"
      data-expanded={ctx.isExpanded() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-expanded={ctx.isExpanded() ? "true" : "false"}
      aria-controls={ctx.contentId()}
      aria-disabled={ctx.isDisabled() ? "true" : undefined}
      disabled={ctx.isDisabled()}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {local.children}
    </button>
  );
};

const CollapsibleContent: Layout<typeof componentRecipe, CollapsibleContentProps> = () => {
  const ctx = useCollapsibleContext();
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "keepMounted",
  ]);

  const expanded = () => ctx.isExpanded();
  const keepMounted = () => local.keepMounted ?? true;

  if (!keepMounted() && !expanded()) {
    return null;
  }

  return (
    <div
      {...others}
      id={ctx.contentId()}
      role="region"
      {...{ class: twMerge(CLASSES.slot.content, local.class, local.className) }}
      data-slot="collapsible-content"
      data-expanded={expanded() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
      aria-hidden={expanded() ? "false" : "true"}
      aria-labelledby={ctx.triggerId()}
    >
      {local.children}
    </div>
  );
};

const CollapsibleBody: Layout<typeof componentRecipe, CollapsibleBodyProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.body, local.class, local.className) }}
      data-slot="collapsible-body"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <div {...{ class: CLASSES.slot.bodyInner }} data-slot="collapsible-body-inner">
        {local.children}
      </div>
    </div>
  );
};

const CollapsibleIndicator: Layout<typeof componentRecipe, CollapsibleIndicatorProps> = () => {
  const ctx = useCollapsibleContext();
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <span
      {...others}
      aria-hidden="true"
      {...{ class: twMerge(CLASSES.slot.indicator, local.class, local.className) }}
      data-slot="collapsible-indicator"
      data-expanded={ctx.isExpanded() ? "true" : "false"}
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

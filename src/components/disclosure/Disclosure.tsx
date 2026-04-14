import "./Disclosure.css";
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
import { CLASSES } from "./Disclosure.classes";
import { DisclosureGroupContext, type DisclosureGroupContextValue } from "../disclosure-group/DisclosureGroup";

type DisclosureContextValue = {
  isExpanded: () => boolean;
  isDisabled: () => boolean;
  triggerId: () => string;
  contentId: () => string;
  toggle: () => void;
};

const DisclosureContext = createContext<DisclosureContextValue>();

const useDisclosureContext = () => {
  const ctx = useContext(DisclosureContext);
  if (!ctx) throw new Error("Disclosure compound components must be used within <Disclosure>");
  return ctx;
};

export type DisclosureRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    id?: string;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    isDisabled?: boolean;
    disabled?: boolean;
  };

export type DisclosureHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type DisclosureTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "disabled"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type DisclosureContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    keepMounted?: boolean;
  };

export type DisclosureBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type DisclosureIndicatorProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const normalizeKey = (value: string) => String(value);

const getGroupExpanded = (group: DisclosureGroupContextValue | undefined, id: string) => {
  if (!group) return false;
  return group.expandedKeys().has(id);
};

const updateGroupExpanded = (
  group: DisclosureGroupContextValue | undefined,
  id: string,
  nextOpen: boolean,
) => {
  if (!group) return;
  if (group.isDisabled()) return;

  if (group.allowsMultipleExpanded()) {
    const next = new Set(group.expandedKeys());
    if (nextOpen) {
      next.add(id);
    } else {
      next.delete(id);
    }
    group.setExpandedKeys(next);
    return;
  }

  group.setExpandedKeys(nextOpen ? new Set([id]) : new Set());
};

const DisclosureRoot: ParentComponent<DisclosureRootProps> = (props) => {
  const group = useContext(DisclosureGroupContext);
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
  const triggerId = () => `disclosure-trigger-${itemId()}`;
  const contentId = () => `disclosure-content-${itemId()}`;

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const isControlled = createMemo(() => local.isOpen !== undefined);
  const standaloneOpen = createMemo(() =>
    isControlled() ? Boolean(local.isOpen) : internalOpen(),
  );

  const isDisabled = () => Boolean(local.isDisabled) || Boolean(local.disabled) || Boolean(group?.isDisabled());
  const isExpanded = () => (group ? getGroupExpanded(group, itemId()) : standaloneOpen());

  const setOpen = (next: boolean) => {
    if (isDisabled()) return;
    if (group) {
      updateGroupExpanded(group, itemId(), next);
      return;
    }

    if (!isControlled()) {
      setInternalOpen(next);
    }
    if (standaloneOpen() !== next) {
      local.onOpenChange?.(next);
    }
  };

  const toggle = () => setOpen(!isExpanded());

  const ctx: DisclosureContextValue = {
    isExpanded,
    isDisabled,
    triggerId,
    contentId,
    toggle,
  };

  return (
    <DisclosureContext.Provider value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(
          CLASSES.base,
          isExpanded() && CLASSES.flag.expanded,
          isDisabled() && CLASSES.flag.disabled,
          local.class,
          local.className,
        ) }}
        data-slot="disclosure"
        data-expanded={isExpanded() ? "true" : "false"}
        data-disabled={isDisabled() ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </DisclosureContext.Provider>
  );
};

const DisclosureHeading: Component<DisclosureHeadingProps> = (props) => {
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
      data-slot="disclosure-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h3>
  );
};

const DisclosureTrigger: Component<DisclosureTriggerProps> = (props) => {
  const ctx = useDisclosureContext();
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
      data-slot="disclosure-trigger"
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

const DisclosureContent: ParentComponent<DisclosureContentProps> = (props) => {
  const ctx = useDisclosureContext();
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
      data-slot="disclosure-content"
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

const DisclosureBody: Component<DisclosureBodyProps> = (props) => {
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
      data-slot="disclosure-body"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <div {...{ class: CLASSES.slot.bodyInner }} data-slot="disclosure-body-inner">
        {local.children}
      </div>
    </div>
  );
};

const DisclosureIndicator: Component<DisclosureIndicatorProps> = (props) => {
  const ctx = useDisclosureContext();
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
      data-slot="disclosure-indicator"
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

const Disclosure = Object.assign(DisclosureRoot, {
  Root: DisclosureRoot,
  Heading: DisclosureHeading,
  Trigger: DisclosureTrigger,
  Content: DisclosureContent,
  Body: DisclosureBody,
  Indicator: DisclosureIndicator,
});

export default Disclosure;
export {
  DisclosureRoot,
  DisclosureHeading,
  DisclosureTrigger,
  DisclosureContent,
  DisclosureBody,
  DisclosureIndicator,
};

export type { DisclosureRootProps as DisclosureProps };

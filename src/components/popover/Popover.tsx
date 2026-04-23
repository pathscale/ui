import "./Popover.css";
import {
  Show,
  createEffect,
  createContext,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import {
  createOverlayPosition,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import { CLASSES } from "./Popover.classes";

export type PopoverPlacement = OverlayPlacement;

type PopoverContextValue = {
  isOpen: () => boolean;
  setIsOpen: (next: boolean, options?: { focusTrigger?: boolean }) => void;
  preferredPlacement: () => PopoverPlacement;
  placement: () => PopoverPlacement;
  setPlacement: (next: PopoverPlacement) => void;
  autoFlip: () => boolean;
  triggerRef: () => HTMLElement | undefined;
  setTriggerRef: (el: HTMLElement) => void;
  contentRef: () => HTMLElement | undefined;
  setContentRef: (el: HTMLElement) => void;
  triggerId: () => string;
  contentId: () => string;
  offset: () => number;
  onInteractOutside?: (event: Event) => void;
};

const PopoverContext = createContext<PopoverContextValue>();

const usePopoverContext = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover compound components must be used within <Popover>");
  return ctx;
};

export type PopoverRootProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: PopoverPlacement;
    autoFlip?: boolean;
    offset?: number;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    onInteractOutside?: (event: Event) => void;
  };

const PopoverRoot: ParentComponent<PopoverRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "placement",
    "autoFlip",
    "offset",
    "closeOnOutsideClick",
    "closeOnEscape",
    "onInteractOutside",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement | undefined>();
  const [contentRef, setContentRef] = createSignal<HTMLElement | undefined>();
  const [triggerId] = createSignal(`popover-trigger-${Math.random().toString(36).slice(2, 8)}`);
  const [contentId] = createSignal(`popover-content-${Math.random().toString(36).slice(2, 8)}`);
  const [resolvedPlacement, setResolvedPlacement] = createSignal<PopoverPlacement>(
    local.placement ?? "bottom",
  );

  const isControlled = createMemo(() => local.isOpen !== undefined);
  const isOpen = createMemo(() => (isControlled() ? Boolean(local.isOpen) : internalOpen()));

  const setIsOpen = (next: boolean, options?: { focusTrigger?: boolean }) => {
    if (!isControlled()) setInternalOpen(next);
    if (isOpen() !== next) local.onOpenChange?.(next);
    if (!next && options?.focusTrigger) {
      triggerRef()?.focus();
    }
  };

  const preferredPlacement = () => local.placement ?? "bottom";
  const placement = () => resolvedPlacement();
  const offset = () => local.offset ?? 8;
  const autoFlip = () => local.autoFlip ?? true;

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen()) return;
      if (local.closeOnOutsideClick === false) return;
      const content = contentRef();
      const trigger = triggerRef();
      if (content?.contains(event.target as Node)) return;
      if (trigger?.contains(event.target as Node)) return;
      local.onInteractOutside?.(event);
      setIsOpen(false, { focusTrigger: false });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen()) return;
      if (local.closeOnEscape === false) return;
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false, { focusTrigger: true });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    });
  });

  const ctx: PopoverContextValue = {
    isOpen,
    setIsOpen,
    preferredPlacement,
    placement,
    setPlacement: setResolvedPlacement,
    autoFlip,
    triggerRef,
    setTriggerRef,
    contentRef,
    setContentRef,
    triggerId,
    contentId,
    offset,
    onInteractOutside: local.onInteractOutside,
  };

  return (
    <PopoverContext.Provider value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(CLASSES.slot.root, local.class, local.className) }}
        data-slot="popover-root"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </PopoverContext.Provider>
  );
};

export type PopoverTriggerProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverTrigger: Component<PopoverTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onClick",
    "onKeyDown",
  ]);

  const ctx = usePopoverContext();

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (typeof local.onClick === "function") local.onClick(event);
    if (event.defaultPrevented) return;
    ctx.setIsOpen(!ctx.isOpen());
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    if (typeof local.onKeyDown === "function") local.onKeyDown(event);
    if (event.defaultPrevented) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      ctx.setIsOpen(!ctx.isOpen());
    }
    if (event.key === "Escape" && ctx.isOpen()) {
      event.preventDefault();
      ctx.setIsOpen(false, { focusTrigger: true });
    }
  };

  return (
    <div
      {...others}
      ref={(el) => ctx.setTriggerRef(el)}
      id={ctx.triggerId()}
      role="button"
      tabIndex={0}
      {...{ class: twMerge(CLASSES.slot.trigger, local.class, local.className) }}
      data-slot="popover-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      aria-haspopup="dialog"
      aria-expanded={ctx.isOpen() ? "true" : "false"}
      aria-controls={ctx.isOpen() ? ctx.contentId() : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {local.children}
    </div>
  );
};

export type PopoverContentProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
    sideOffset?: number;
  };

const PopoverContent: Component<PopoverContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "sideOffset",
  ]);

  const ctx = usePopoverContext();
  const overlayPosition = createOverlayPosition({
    open: ctx.isOpen,
    triggerRef: ctx.triggerRef,
    overlayRef: ctx.contentRef,
    placement: ctx.preferredPlacement,
    offset: () => local.sideOffset ?? ctx.offset(),
    autoFlip: ctx.autoFlip,
    align: () => "center",
  });

  createEffect(() => {
    ctx.setPlacement(overlayPosition.placement());
  });

  const style = () => {
    const overlayStyle = overlayPosition.style();

    if (typeof local.style === "string") {
      return [
        local.style,
        Object.entries(overlayStyle)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join("; "),
      ]
        .filter(Boolean)
        .join("; ");
    }

    return {
      ...(local.style ?? {}),
      ...overlayStyle,
    } as JSX.CSSProperties;
  };

  return (
    <Show when={ctx.isOpen()}>
      <Portal>
        <div
          {...others}
          ref={(el) => ctx.setContentRef(el)}
          id={ctx.contentId()}
          role="dialog"
          {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
          data-slot="popover-content"
          data-open={ctx.isOpen() ? "true" : "false"}
          data-placement={ctx.placement()}
          data-theme={local.dataTheme}
          style={style()}
          aria-labelledby={ctx.triggerId()}
          aria-hidden={ctx.isOpen() ? "false" : "true"}
        >
          {local.children}
        </div>
      </Portal>
    </Show>
  );
};

export type PopoverDialogProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverDialog: Component<PopoverDialogProps> = (props) => {
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
      {...{ class: twMerge(CLASSES.slot.dialog, local.class, local.className) }}
      data-slot="popover-dialog"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

export type PopoverArrowProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
    children?: JSX.Element;
  };

const PopoverArrow: Component<PopoverArrowProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const ctx = usePopoverContext();

  const defaultArrow = (
    <svg
      aria-hidden="true"
      data-slot="popover-arrow-svg"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M0 0C5.48483 8 6.5 8 12 0Z" fill="currentColor" />
    </svg>
  );

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.arrow, local.class, local.className) }}
      data-slot="popover-arrow"
      data-placement={ctx.placement()}
      data-theme={local.dataTheme}
      style={local.style}
      aria-hidden="true"
    >
      {local.children ?? defaultArrow}
    </span>
  );
};

export type PopoverHeadingProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverHeading: Component<PopoverHeadingProps> = (props) => {
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
      data-slot="popover-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h3>
  );
};

const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Dialog: PopoverDialog,
  Arrow: PopoverArrow,
  Heading: PopoverHeading,
});

export default Popover;
export {
  PopoverRoot,
  PopoverTrigger,
  PopoverContent,
  PopoverDialog,
  PopoverArrow,
  PopoverHeading,
};

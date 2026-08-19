import "./Popover.css";
import {Show, createContext, createMemo, createSignal, createTrackedEffect, onSettled, omit, useContext, type Component, type ParentComponent} from "solid-js";
import { Portal, type JSX} from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

import "../_shared/material.css";
import type { Material, UIBaseProps } from "../vocabulary";
import {
  createOverlayPosition,
  type OverlayAnchorRect,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import { CLASSES } from "./Popover.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Popover.recipe";

export type PopoverPlacement = OverlayPlacement;
export type PopoverAnchorRect = OverlayAnchorRect;
export type PopoverAnchor = PopoverAnchorRect | (() => PopoverAnchorRect | undefined);

type PopoverContextValue = {
  isOpen: () => boolean;
  setIsOpen: (next: boolean, options?: { focusTrigger?: boolean }) => void;
  preferredPlacement: () => PopoverPlacement;
  placement: () => PopoverPlacement;
  setPlacement: (next: PopoverPlacement) => void;
  autoFlip: () => boolean;
  anchorRect: () => PopoverAnchorRect | undefined;
  triggerRef: () => HTMLElement | undefined;
  setTriggerRef: (el: HTMLElement) => void;
  contentRef: () => HTMLElement | undefined;
  setContentRef: (el: HTMLElement) => void;
  triggerId: () => string;
  contentId: () => string;
  offset: () => number;
  onInteractOutside?: (event: Event) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover compound components must be used within <Popover>");
  return ctx;
};

export type PopoverRootProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: PopoverPlacement;
    autoFlip?: boolean;
    offset?: number;
    anchorRect?: PopoverAnchor;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    onInteractOutside?: (event: Event) => void;
  };

const PopoverRoot: Layout<typeof componentRecipe, PopoverRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "open",
    "defaultOpen",
    "onOpenChange",
    "placement",
    "autoFlip",
    "offset",
    "anchorRect",
    "closeOnOutsideClick",
    "closeOnEscape",
    "onInteractOutside",
  );

  const [internalOpen, setInternalOpen] = createSignal(Boolean(props.defaultOpen));
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement | undefined>();
  const [contentRef, setContentRef] = createSignal<HTMLElement | undefined>();
  const [triggerId] = createSignal(`popover-trigger-${Math.random().toString(36).slice(2, 8)}`);
  const [contentId] = createSignal(`popover-content-${Math.random().toString(36).slice(2, 8)}`);
  const [resolvedPlacement, setResolvedPlacement] = createSignal<PopoverPlacement>(
    props.placement ?? "bottom",
  );

  const isControlled = createMemo(() => props.open !== undefined);
  const isOpen = createMemo(() => (isControlled() ? Boolean(props.open) : internalOpen()));

  const setIsOpen = (next: boolean, options?: { focusTrigger?: boolean }) => {
    if (!isControlled()) setInternalOpen(next);
    if (isOpen() !== next) props.onOpenChange?.(next);
    if (!next && options?.focusTrigger) {
      triggerRef()?.focus();
    }
  };

  const preferredPlacement = () => props.placement ?? "bottom";
  const placement = () => resolvedPlacement();
  const offset = () => props.offset ?? 8;
  const autoFlip = () => props.autoFlip ?? true;
  const anchorRect = () =>
    typeof props.anchorRect === "function" ? props.anchorRect() : props.anchorRect;

  onSettled(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen()) return;
      if (props.closeOnOutsideClick === false) return;
      const content = contentRef();
      const trigger = triggerRef();
      if (content?.contains(event.target as Node)) return;
      if (trigger?.contains(event.target as Node)) return;
      props.onInteractOutside?.(event);
      setIsOpen(false, { focusTrigger: false });
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen()) return;
      if (props.closeOnEscape === false) return;
      if (event.key !== "Escape") return;
      event.preventDefault();
      setIsOpen(false, { focusTrigger: true });
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  });

  const ctx: PopoverContextValue = {
    isOpen,
    setIsOpen,
    preferredPlacement,
    placement,
    setPlacement: setResolvedPlacement,
    autoFlip,
    anchorRect,
    triggerRef,
    setTriggerRef,
    contentRef,
    setContentRef,
    triggerId,
    contentId,
    offset,
    onInteractOutside: props.onInteractOutside,
  };

  return (
    <PopoverContext value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(CLASSES.slot.root, props.class) }}
        data-slot="popover-root"
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </div>
    </PopoverContext>
  );
};

export type PopoverTriggerProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverTrigger: Layout<typeof componentRecipe, PopoverTriggerProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "onClick", "onKeyDown");

  const ctx = usePopoverContext();

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (typeof props.onClick === "function") props.onClick(event);
    if (event.defaultPrevented) return;
    ctx.setIsOpen(!ctx.isOpen());
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    if (typeof props.onKeyDown === "function") props.onKeyDown(event);
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
      tabindex={0}
      {...{ class: twMerge(CLASSES.slot.trigger, props.class) }}
      data-slot="popover-trigger"
      data-theme={props.dataTheme}
      style={props.style}
      aria-haspopup="dialog"
      aria-expanded={ctx.isOpen() ? "true" : "false"}
      aria-controls={ctx.isOpen() ? ctx.contentId() : undefined}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {props.children}
    </div>
  );
};

export type PopoverContentProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
    sideOffset?: number;
    /** What the panel is made of. `solid` by default. */
    material?: Material;
  };

const PopoverContent: Layout<typeof componentRecipe, PopoverContentProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "sideOffset", "material");

  const ctx = usePopoverContext();
  const overlayPosition = createOverlayPosition({
    open: ctx.isOpen,
    triggerRef: ctx.triggerRef,
    anchorRect: ctx.anchorRect,
    overlayRef: ctx.contentRef,
    placement: ctx.preferredPlacement,
    offset: () => props.sideOffset ?? ctx.offset(),
    autoFlip: ctx.autoFlip,
    align: () => "center",
  });

  createTrackedEffect(() => {
    ctx.setPlacement(overlayPosition.placement());
  });

  const style = () => {
    const overlayStyle = overlayPosition.style();

    if (typeof props.style === "string") {
      return [
        props.style,
        Object.entries(overlayStyle)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join("; "),
      ]
        .filter(Boolean)
        .join("; ");
    }

    return {
      ...(props.style ?? {}),
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
          {...{ class: twMerge(CLASSES.base, props.class) }}
          data-slot="popover-content"
          data-material={props.material ?? "solid"}
      data-material-explicit={props.material ? "" : undefined}
          data-open={ctx.isOpen() ? "true" : "false"}
          data-placement={ctx.placement()}
          data-theme={props.dataTheme}
          style={style()}
          aria-labelledby={ctx.triggerRef() ? ctx.triggerId() : undefined}
          aria-hidden={ctx.isOpen() ? "false" : "true"}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
};

export type PopoverDialogProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverDialog: Layout<typeof componentRecipe, PopoverDialogProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.dialog, props.class) }}
      data-slot="popover-dialog"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export type PopoverArrowProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
    children?: JSX.Element;
  };

const PopoverArrow: Layout<typeof componentRecipe, PopoverArrowProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

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
      {...{ class: twMerge(CLASSES.slot.arrow, props.class) }}
      data-slot="popover-arrow"
      data-placement={ctx.placement()}
      data-theme={props.dataTheme}
      style={props.style}
      aria-hidden="true"
    >
      {props.children ?? defaultArrow}
    </span>
  );
};

export type PopoverHeadingProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverHeading: Layout<typeof componentRecipe, PopoverHeadingProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <h3
      {...others}
      {...{ class: twMerge(CLASSES.slot.heading, props.class) }}
      data-slot="popover-heading"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
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

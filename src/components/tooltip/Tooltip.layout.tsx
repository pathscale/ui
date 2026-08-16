import "./Tooltip.css";
import {createContext, createSignal, createTrackedEffect, onCleanup, omit, useContext, Show, type Component, type ParentComponent} from "solid-js";
import { Portal, type JSX} from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import {
  createOverlayPosition,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Tooltip.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Tooltip.recipe";

/* -------------------------------------------------------------------------------------------------
 * Tooltip Context
 * -----------------------------------------------------------------------------------------------*/
type TooltipContextValue = {
  isOpen: () => boolean;
  setIsOpen: (v: boolean) => void;
  openTooltip: () => void;
  closeTooltip: () => void;
  preferredPlacement: () => TooltipPlacement;
  placement: () => TooltipPlacement;
  setPlacement: (next: TooltipPlacement) => void;
  autoFlip: () => boolean;
  sideOffset: () => number;
  showArrow: () => boolean;
  triggerRef: () => HTMLElement | undefined;
  setTriggerRef: (el: HTMLElement) => void;
  contentRef: () => HTMLElement | undefined;
  setContentRef: (el: HTMLElement) => void;
  dataTheme: () => string | undefined;
};

const TooltipContext = createContext<TooltipContextValue>();

const useTooltipContext = () => {
  const ctx = useContext(TooltipContext);
  if (!ctx)
    throw new Error(
      "Tooltip compound components must be used within <Tooltip>",
    );
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type TooltipPlacement = OverlayPlacement;

export type TooltipRootProps = UIBaseProps & {
  children: JSX.Element;
  placement?: TooltipPlacement;
  autoFlip?: boolean;
  sideOffset?: number;
  showArrow?: boolean;
  delay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export type TooltipTriggerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type TooltipContentProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type TooltipArrowProps = JSX.HTMLAttributes<HTMLSpanElement> &
  UIBaseProps & {
    children?: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Tooltip Root
 * -----------------------------------------------------------------------------------------------*/
const TooltipRoot: Layout<typeof componentRecipe, TooltipRootProps> = () => {
  const _others = omit(
    props,
    "children",
    "placement",
    "autoFlip",
    "sideOffset",
    "showArrow",
    "delay",
    "closeDelay",
    "open",
    "defaultOpen",
    "onOpenChange",
    "dataTheme",
    "class",
    "style",
  );

  const [internalOpen, setInternalOpen] = createSignal(
    Boolean(props.defaultOpen),
  );
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement | undefined>();
  const [contentRef, setContentRef] = createSignal<HTMLElement | undefined>();
  const [resolvedPlacement, setResolvedPlacement] =
    createSignal<TooltipPlacement>(props.placement ?? "top");
  let delayTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  const isControlled = () => props.open !== undefined;
  const isOpen = () =>
    isControlled() ? Boolean(props.open) : internalOpen();

  const setIsOpen = (v: boolean) => {
    if (!isControlled()) setInternalOpen(v);
    props.onOpenChange?.(v);
  };

  const openTooltip = () => {
    clearTimeout(closeTimer);
    clearTimeout(delayTimer);
    delayTimer = setTimeout(() => setIsOpen(true), props.delay ?? 0);
  };

  const closeTooltip = () => {
    clearTimeout(delayTimer);
    clearTimeout(closeTimer);
    closeTimer = setTimeout(() => setIsOpen(false), props.closeDelay ?? 100);
  };

  onCleanup(() => {
    clearTimeout(delayTimer);
    clearTimeout(closeTimer);
  });

  const ctx: TooltipContextValue = {
    isOpen,
    setIsOpen,
    openTooltip,
    closeTooltip,
    preferredPlacement: () => props.placement ?? "top",
    placement: () => resolvedPlacement(),
    setPlacement: setResolvedPlacement,
    autoFlip: () => props.autoFlip ?? true,
    sideOffset: () => props.sideOffset ?? 12,
    showArrow: () => Boolean(props.showArrow),
    triggerRef,
    setTriggerRef,
    contentRef,
    setContentRef,
    dataTheme: () => props.dataTheme,
  };

  return (
    <TooltipContext value={ctx}>
      <span
        {...{ class: twMerge(CLASSES.base, props.class) }}
        data-slot="tooltip-root"
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </span>
    </TooltipContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip Trigger
 * -----------------------------------------------------------------------------------------------*/
const TooltipTrigger: Layout<typeof componentRecipe, TooltipTriggerProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "onMouseEnter",
    "onMouseLeave",
    "onFocusIn",
    "onFocusOut",
  );

  const ctx = useTooltipContext();

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    e,
  ) => {
    ctx.openTooltip();
    if (typeof props.onMouseEnter === "function") props.onMouseEnter(e);
  };

  const handleMouseLeave: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    e,
  ) => {
    ctx.closeTooltip();
    if (typeof props.onMouseLeave === "function") props.onMouseLeave(e);
  };

  const handleFocusIn: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (
    e,
  ) => {
    ctx.openTooltip();
    if (typeof props.onFocusIn === "function") props.onFocusIn(e);
  };

  const handleFocusOut: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (
    e,
  ) => {
    ctx.setIsOpen(false);
    if (typeof props.onFocusOut === "function") props.onFocusOut(e);
  };

  return (
    <div
      {...others}
      ref={(el) => ctx.setTriggerRef(el)}
      {...{
        class: twMerge(CLASSES.slot.trigger, props.class),
      }}
      data-slot="tooltip-trigger"
      data-theme={props.dataTheme}
      style={props.style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusIn={handleFocusIn}
      onFocusOut={handleFocusOut}
    >
      {props.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip Content
 * -----------------------------------------------------------------------------------------------*/
const TooltipContent: Layout<typeof componentRecipe, TooltipContentProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "onMouseEnter",
    "onMouseLeave",
  );

  const ctx = useTooltipContext();
  const overlayPosition = createOverlayPosition({
    open: ctx.isOpen,
    triggerRef: ctx.triggerRef,
    overlayRef: ctx.contentRef,
    placement: ctx.preferredPlacement,
    offset: ctx.sideOffset,
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

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    event,
  ) => {
    ctx.openTooltip();
    if (typeof props.onMouseEnter === "function") props.onMouseEnter(event);
  };

  const handleMouseLeave: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (
    event,
  ) => {
    ctx.closeTooltip();
    if (typeof props.onMouseLeave === "function") props.onMouseLeave(event);
  };

  return (
    <Show when={ctx.isOpen()}>
      <Portal>
        <div
          {...others}
          ref={(el) => ctx.setContentRef(el)}
          role="tooltip"
          {...{
            class: twMerge(CLASSES.slot.content, props.class),
          }}
          data-slot="tooltip-content"
          data-placement={ctx.placement()}
          data-open={ctx.isOpen() ? "true" : "false"}
          data-theme={props.dataTheme ?? ctx.dataTheme()}
          style={style()}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip Arrow
 * -----------------------------------------------------------------------------------------------*/
const TooltipArrow: Layout<typeof componentRecipe, TooltipArrowProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  const ctx = useTooltipContext();

  const defaultArrow = (
    <svg
      aria-hidden="true"
      data-slot="tooltip-arrow-svg"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0C5.48483 8 6.5 8 12 0Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.arrow, props.class) }}
      data-slot="tooltip-arrow"
      data-placement={ctx.placement()}
      data-theme={props.dataTheme}
      style={props.style}
      aria-hidden="true"
    >
      <Show
        when={props.children}
        fallback={defaultArrow}
      >
        {props.children}
      </Show>
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Tooltip = Object.assign(TooltipRoot, {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
  Arrow: TooltipArrow,
});

export default Tooltip;
export { TooltipRoot, TooltipTrigger, TooltipContent, TooltipArrow };

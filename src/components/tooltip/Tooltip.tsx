import "./Tooltip.css";
import {
  createContext,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  Show,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Tooltip.classes";

/* -------------------------------------------------------------------------------------------------
 * Tooltip Context
 * -----------------------------------------------------------------------------------------------*/
type TooltipContextValue = {
  isOpen: () => boolean;
  setIsOpen: (v: boolean) => void;
  placement: () => TooltipPlacement;
  showArrow: () => boolean;
  triggerRef: () => HTMLElement | undefined;
  setTriggerRef: (el: HTMLElement) => void;
};

const TooltipContext = createContext<TooltipContextValue>();

const useTooltipContext = () => {
  const ctx = useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip compound components must be used within <Tooltip>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export type TooltipRootProps = IComponentBaseProps & {
  children: JSX.Element;
  placement?: TooltipPlacement;
  showArrow?: boolean;
  delay?: number;
  closeDelay?: number;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export type TooltipTriggerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type TooltipContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type TooltipArrowProps = JSX.HTMLAttributes<HTMLSpanElement> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Tooltip Root
 * -----------------------------------------------------------------------------------------------*/
const TooltipRoot: ParentComponent<TooltipRootProps> = (props) => {
  const [local, _others] = splitProps(props, [
    "children",
    "placement",
    "showArrow",
    "delay",
    "closeDelay",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement | undefined>();

  const isControlled = () => local.isOpen !== undefined;
  const isOpen = () => (isControlled() ? Boolean(local.isOpen) : internalOpen());

  const setIsOpen = (v: boolean) => {
    if (!isControlled()) setInternalOpen(v);
    local.onOpenChange?.(v);
  };

  const ctx: TooltipContextValue = {
    isOpen,
    setIsOpen,
    placement: () => local.placement ?? "top",
    showArrow: () => Boolean(local.showArrow),
    triggerRef,
    setTriggerRef,
  };

  return (
    <TooltipContext.Provider value={ctx}>
      <span
        {...{ class: twMerge(CLASSES.base, local.class, local.className) }}
        data-slot="tooltip-root"
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </span>
    </TooltipContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip Trigger
 * -----------------------------------------------------------------------------------------------*/
const TooltipTrigger: Component<TooltipTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onMouseEnter",
    "onMouseLeave",
    "onFocusIn",
    "onFocusOut",
  ]);

  const ctx = useTooltipContext();
  let delayTimer: ReturnType<typeof setTimeout> | undefined;
  let closeTimer: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    clearTimeout(delayTimer);
    clearTimeout(closeTimer);
  });

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (e) => {
    clearTimeout(closeTimer);
    ctx.setIsOpen(true);
    if (typeof local.onMouseEnter === "function") local.onMouseEnter(e);
  };

  const handleMouseLeave: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (e) => {
    closeTimer = setTimeout(() => ctx.setIsOpen(false), 100);
    if (typeof local.onMouseLeave === "function") local.onMouseLeave(e);
  };

  const handleFocusIn: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (e) => {
    clearTimeout(closeTimer);
    ctx.setIsOpen(true);
    if (typeof local.onFocusIn === "function") local.onFocusIn(e);
  };

  const handleFocusOut: JSX.EventHandlerUnion<HTMLDivElement, FocusEvent> = (e) => {
    ctx.setIsOpen(false);
    if (typeof local.onFocusOut === "function") local.onFocusOut(e);
  };

  return (
    <div
      {...others}
      ref={(el) => ctx.setTriggerRef(el)}
      {...{ class: twMerge(CLASSES.slot.trigger, local.class, local.className) }}
      data-slot="tooltip-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocusIn={handleFocusIn}
      onFocusOut={handleFocusOut}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip Content
 * -----------------------------------------------------------------------------------------------*/
const TooltipContent: Component<TooltipContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const ctx = useTooltipContext();

  return (
    <div
      {...others}
      role="tooltip"
      {...{ class: twMerge(CLASSES.slot.content, local.class, local.className) }}
      data-slot="tooltip-content"
      data-placement={ctx.placement()}
      data-open={ctx.isOpen() ? "true" : "false"}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Tooltip Arrow
 * -----------------------------------------------------------------------------------------------*/
const TooltipArrow: Component<TooltipArrowProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

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
      <path d="M0 0C5.48483 8 6.5 8 12 0Z" fill="currentColor" />
    </svg>
  );

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.arrow, local.class, local.className) }}
      data-slot="tooltip-arrow"
      data-placement={ctx.placement()}
      data-theme={local.dataTheme}
      style={local.style}
      aria-hidden="true"
    >
      <Show when={local.children} fallback={defaultArrow}>
        {local.children}
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

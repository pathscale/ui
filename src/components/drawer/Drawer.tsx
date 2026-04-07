import "./Drawer.css";
import {
  createContext,
  createEffect,
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
import { Portal } from "solid-js/web";
import type { IComponentBaseProps } from "../types";

/* -------------------------------------------------------------------------------------------------
 * Drawer Context
 * -----------------------------------------------------------------------------------------------*/
export type DrawerPlacement = "top" | "bottom" | "left" | "right";
export type DrawerBackdropVariant = "opaque" | "blur" | "transparent";

type DrawerAnimState = "entering" | "open" | "exiting" | "closed";

type DrawerContextValue = {
  isOpen: () => boolean;
  setIsOpen: (v: boolean) => void;
  placement: () => DrawerPlacement;
  isDismissable: () => boolean;
  animState: () => DrawerAnimState;
};

const DrawerContext = createContext<DrawerContextValue>();

const useDrawerContext = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("Drawer compound components must be used within <Drawer>");
  return ctx;
};

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type DrawerRootProps = IComponentBaseProps & {
  children: JSX.Element;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};

export type DrawerTriggerProps = Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerBackdropProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    variant?: DrawerBackdropVariant;
    isDismissable?: boolean;
  };

export type DrawerContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    placement?: DrawerPlacement;
  };

export type DrawerDialogProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerHandleProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

export type DrawerCloseTriggerProps = Omit<JSX.HTMLAttributes<HTMLButtonElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

/* -------------------------------------------------------------------------------------------------
 * Drawer Root
 * -----------------------------------------------------------------------------------------------*/
const DrawerRoot: ParentComponent<DrawerRootProps> = (props) => {
  const [local, _others] = splitProps(props, [
    "children",
    "isOpen",
    "defaultOpen",
    "onOpenChange",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));

  const isControlled = () => local.isOpen !== undefined;
  const isOpen = () => (isControlled() ? Boolean(local.isOpen) : internalOpen());

  const setIsOpen = (v: boolean) => {
    if (!isControlled()) setInternalOpen(v);
    local.onOpenChange?.(v);
  };

  const ctx: DrawerContextValue = {
    isOpen,
    setIsOpen,
    placement: () => "bottom",
    isDismissable: () => true,
    animState: () => "closed" as DrawerAnimState,
  };

  return (
    <DrawerContext.Provider value={ctx}>
      {local.children}
    </DrawerContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Trigger
 * -----------------------------------------------------------------------------------------------*/
const DrawerTrigger: Component<DrawerTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onClick",
  ]);

  const ctx = useDrawerContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (e) => {
    ctx.setIsOpen(true);
    if (typeof local.onClick === "function") local.onClick(e);
  };

  return (
    <button
      {...others}
      type="button"
      class={twMerge("drawer__trigger", local.class, local.className)}
      data-slot="drawer-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children}
    </button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Backdrop
 * -----------------------------------------------------------------------------------------------*/
const BACKDROP_VARIANT_MAP: Record<DrawerBackdropVariant, string> = {
  opaque: "drawer__backdrop--opaque",
  blur: "drawer__backdrop--blur",
  transparent: "drawer__backdrop--transparent",
};

const DrawerBackdrop: ParentComponent<DrawerBackdropProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
    "isDismissable",
    "onClick",
  ]);

  const ctx = useDrawerContext();
  const variant = () => local.variant ?? "opaque";
  const isDismissable = () => local.isDismissable !== false;

  // Track enter/exit animation state
  const [animState, setAnimState] = createSignal<"entering" | "open" | "exiting" | "closed">("closed");

  createEffect(() => {
    if (ctx.isOpen()) {
      setAnimState("entering");
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimState("open"));
      });
    } else if (animState() === "open" || animState() === "entering") {
      setAnimState("exiting");
    }
  });

  const handleTransitionEnd = () => {
    if (animState() === "exiting") {
      setAnimState("closed");
    }
  };

  const handleBackdropClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (e) => {
    if (e.target === e.currentTarget && isDismissable()) {
      ctx.setIsOpen(false);
    }
    if (typeof local.onClick === "function") local.onClick(e);
  };

  // Lock body scroll when open
  createEffect(() => {
    const state = animState();
    if (state === "entering" || state === "open") {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      onCleanup(() => {
        document.body.style.overflow = prev;
      });
    }
  });

  // Handle Escape key
  createEffect(() => {
    if (!ctx.isOpen() || !isDismissable()) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setIsOpen(false);
    };
    document.addEventListener("keydown", handler);
    onCleanup(() => document.removeEventListener("keydown", handler));
  });

  // Provide updated context with isDismissable and animState
  const updatedCtx: DrawerContextValue = {
    isOpen: ctx.isOpen,
    setIsOpen: ctx.setIsOpen,
    placement: ctx.placement,
    isDismissable,
    animState,
  };

  return (
    <Show when={animState() !== "closed"}>
      <Portal>
        <DrawerContext.Provider value={updatedCtx}>
          <div
            {...others}
            class={twMerge(
              "drawer__backdrop",
              BACKDROP_VARIANT_MAP[variant()],
              local.class,
              local.className,
            )}
            data-slot="drawer-backdrop"
            data-entering={animState() === "entering" ? "true" : undefined}
            data-exiting={animState() === "exiting" ? "true" : undefined}
            data-theme={local.dataTheme}
            style={local.style}
            onClick={handleBackdropClick}
            onTransitionEnd={handleTransitionEnd}
          >
            {local.children}
          </div>
        </DrawerContext.Provider>
      </Portal>
    </Show>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Content
 * -----------------------------------------------------------------------------------------------*/
const PLACEMENT_CLASS_MAP: Record<DrawerPlacement, string> = {
  top: "drawer__content--top",
  bottom: "drawer__content--bottom",
  left: "drawer__content--left",
  right: "drawer__content--right",
};

const DrawerContent: ParentComponent<DrawerContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "placement",
  ]);

  const parentCtx = useDrawerContext();
  const placement = () => local.placement ?? "bottom";

  // Provide updated context with placement
  const updatedCtx: DrawerContextValue = {
    isOpen: parentCtx.isOpen,
    setIsOpen: parentCtx.setIsOpen,
    isDismissable: parentCtx.isDismissable,
    animState: parentCtx.animState,
    placement,
  };

  return (
    <DrawerContext.Provider value={updatedCtx}>
      <div
        {...others}
        class={twMerge(
          "drawer__content",
          PLACEMENT_CLASS_MAP[placement()],
          local.class,
          local.className,
        )}
        data-slot="drawer-content"
        data-placement={placement()}
        data-entering={parentCtx.animState() === "entering" ? "true" : undefined}
        data-exiting={parentCtx.animState() === "exiting" ? "true" : undefined}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </DrawerContext.Provider>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Dialog
 * -----------------------------------------------------------------------------------------------*/
const DrawerDialog: ParentComponent<DrawerDialogProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const ctx = useDrawerContext();

  return (
    <div
      {...others}
      role="dialog"
      aria-modal="true"
      class={twMerge("drawer__dialog", local.class, local.className)}
      data-slot="drawer-dialog"
      data-placement={ctx.placement()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Header
 * -----------------------------------------------------------------------------------------------*/
const DrawerHeader: ParentComponent<DrawerHeaderProps> = (props) => {
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
      class={twMerge("drawer__header", local.class, local.className)}
      data-slot="drawer-header"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Heading
 * -----------------------------------------------------------------------------------------------*/
const DrawerHeading: ParentComponent<DrawerHeadingProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <h2
      {...others}
      class={twMerge("drawer__heading", local.class, local.className)}
      data-slot="drawer-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h2>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Body
 * -----------------------------------------------------------------------------------------------*/
const DrawerBody: ParentComponent<DrawerBodyProps> = (props) => {
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
      class={twMerge("drawer__body", local.class, local.className)}
      data-slot="drawer-body"
      data-theme={local.dataTheme}
      style={Object.assign({}, local.style, { "touch-action": "pan-y" })}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Footer
 * -----------------------------------------------------------------------------------------------*/
const DrawerFooter: ParentComponent<DrawerFooterProps> = (props) => {
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
      class={twMerge("drawer__footer", local.class, local.className)}
      data-slot="drawer-footer"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Handle
 * -----------------------------------------------------------------------------------------------*/
const DrawerHandle: Component<DrawerHandleProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      aria-hidden="true"
      class={twMerge("drawer__handle", local.class, local.className)}
      data-slot="drawer-handle"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <div data-slot="drawer-handle-bar" />
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Close Trigger
 * -----------------------------------------------------------------------------------------------*/
const DrawerCloseTrigger: Component<DrawerCloseTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "onClick",
  ]);

  const ctx = useDrawerContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (e) => {
    ctx.setIsOpen(false);
    if (typeof local.onClick === "function") local.onClick(e);
  };

  return (
    <button
      {...others}
      type="button"
      class={twMerge("drawer__close-trigger", local.class, local.className)}
      data-slot="drawer-close-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      aria-label="Close"
      onClick={handleClick}
    >
      <Show
        when={local.children}
        fallback={
          <svg
            aria-hidden="true"
            fill="none"
            height="16"
            viewBox="0 0 24 24"
            width="16"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-width="2"
            />
          </svg>
        }
      >
        {local.children}
      </Show>
    </button>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Drawer Close — wraps any element and closes the drawer on click
 * -----------------------------------------------------------------------------------------------*/
export type DrawerCloseProps = {
  children: JSX.Element;
};

const DrawerClose: ParentComponent<DrawerCloseProps> = (props) => {
  const ctx = useDrawerContext();

  const handleClick = () => {
    ctx.setIsOpen(false);
  };

  return (
    <span data-slot="drawer-close" onClick={handleClick}>
      {props.children}
    </span>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
const Drawer = Object.assign(DrawerRoot, {
  Root: DrawerRoot,
  Trigger: DrawerTrigger,
  Backdrop: DrawerBackdrop,
  Content: DrawerContent,
  Dialog: DrawerDialog,
  Header: DrawerHeader,
  Heading: DrawerHeading,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Handle: DrawerHandle,
  CloseTrigger: DrawerCloseTrigger,
  Close: DrawerClose,
});

export default Drawer;
export {
  DrawerRoot,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerContent,
  DrawerDialog,
  DrawerHeader,
  DrawerHeading,
  DrawerBody,
  DrawerFooter,
  DrawerHandle,
  DrawerCloseTrigger,
  DrawerClose,
};

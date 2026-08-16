import "./Drawer.css";
import {Show, createEffect, createSignal, createUniqueId, onCleanup, omit, type Component, type ParentComponent} from "solid-js";
import { Portal, type JSX} from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import "../_shared/material.css";
import type { Material, UIBaseProps } from "../vocabulary";
import {
  focusFirst,
  isSidePlacement,
  isVisibleState,
  trapFocus,
  type DrawerAnimState,
  type DrawerBackdropVariant,
  type DrawerCloseReason,
  type DrawerPlacement,
  type DrawerScrollBehavior,
  type DrawerSize,
} from "./Drawer.a11y";
import { CLASSES } from "./Drawer.recipe";
import { DrawerContext, useDrawerContext, type DrawerContextValue } from "./Drawer.context";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Drawer.recipe";

export type {
  DrawerPlacement,
  DrawerSize,
  DrawerBackdropVariant,
  DrawerScrollBehavior,
} from "./Drawer.a11y";

/* --------------------------- body-scroll locking -------------------------- */

let bodyLockCount = 0;
let prevBodyOverflow = "";
let prevBodyPaddingRight = "";

const lockBodyScroll = () => {
  if (bodyLockCount === 0) {
    prevBodyOverflow = document.body.style.overflow;
    prevBodyPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
    document.body.style.overflow = "hidden";
  }
  bodyLockCount += 1;
};

const unlockBodyScroll = () => {
  if (bodyLockCount <= 0) return;
  bodyLockCount -= 1;
  if (bodyLockCount === 0) {
    document.body.style.overflow = prevBodyOverflow;
    document.body.style.paddingRight = prevBodyPaddingRight;
  }
};

/* --------------------------------- props --------------------------------- */

export type DrawerRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    placement?: DrawerPlacement;
    size?: DrawerSize;
    backdrop?: DrawerBackdropVariant;
    scrollBehavior?: DrawerScrollBehavior;
    isDismissable?: boolean;
    shouldCloseOnEsc?: boolean;
    shouldCloseOnBackdropClick?: boolean;
    trapFocus?: boolean;
    restoreFocus?: boolean;
  };

export type DrawerTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DrawerBackdropProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    variant?: DrawerBackdropVariant;
    /** @deprecated Configure dismissability at Drawer.Root `isDismissable` */
    isDismissable?: boolean;
    /** @deprecated Configure backdrop closing at Drawer.Root `shouldCloseOnBackdropClick` */
    shouldCloseOnBackdropClick?: boolean;
  };

export type DrawerContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    /** @deprecated Configure placement at Drawer.Root `placement` */
    placement?: DrawerPlacement;
    scrollBehavior?: DrawerScrollBehavior;
    /** What the panel is made of. `solid` by default. */
    material?: Material;
  };

export type DrawerDialogSide = "left" | "right";

export type DrawerDialogProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    side?: DrawerDialogSide;
    width?: string;
    maxWidth?: string;
    bg?: string;
    padding?: string;
    borderWidth?: string;
    borderColor?: string;
    size?: DrawerSize;
  };

export type DrawerHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DrawerHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    id?: string;
  };

export type DrawerBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    id?: string;
  };

export type DrawerFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DrawerHandleProps = JSX.HTMLAttributes<HTMLDivElement> & UIBaseProps;

export type DrawerCloseTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

export type DrawerCloseProps = {
  children: JSX.Element;
};

/* ---------------------------------- root --------------------------------- */

const EXIT_MS = 200;

const DrawerRoot: Layout<typeof componentRecipe, DrawerRootProps> = () => {
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
    "size",
    "backdrop",
    "scrollBehavior",
    "isDismissable",
    "shouldCloseOnEsc",
    "shouldCloseOnBackdropClick",
    "trapFocus",
    "restoreFocus",
  );

  const [internalOpen, setInternalOpen] = createSignal(Boolean(props.defaultOpen));
  const [animState, setAnimState] = createSignal<DrawerAnimState>(
    props.open ?? props.defaultOpen ? "open" : "closed",
  );

  const [dialogRef, setDialogRef] = createSignal<HTMLDivElement | undefined>();
  const [labelledBy, setLabelledBy] = createSignal<string | undefined>();
  const [describedBy, setDescribedBy] = createSignal<string | undefined>();

  const [placementOverride, setPlacementOverride] = createSignal<DrawerPlacement | undefined>(
    undefined,
  );
  const [backdropDismissableOverride, setBackdropDismissableOverride] = createSignal<
    boolean | undefined
  >(undefined);
  const [backdropCloseOnClickOverride, setBackdropCloseOnClickOverride] = createSignal<
    boolean | undefined
  >(undefined);

  const isControlled = () => props.open !== undefined;
  const isOpen = () => (isControlled() ? Boolean(props.open) : internalOpen());

  const placement = () => placementOverride() ?? props.placement ?? "bottom";
  const size = () => props.size ?? "md";
  const backdrop = () => props.backdrop ?? "opaque";
  const scrollBehavior = () => props.scrollBehavior ?? "inside";
  const isDismissable = () => backdropDismissableOverride() ?? props.isDismissable ?? true;
  const shouldCloseOnEsc = () => props.shouldCloseOnEsc ?? true;
  const shouldCloseOnBackdropClick = () =>
    backdropCloseOnClickOverride() ?? props.shouldCloseOnBackdropClick ?? true;
  const trapFocusEnabled = () => props.trapFocus ?? true;
  const restoreFocusEnabled = () => props.restoreFocus ?? true;

  const setIsOpen = (next: boolean) => {
    if (next === isOpen()) return;
    if (!isControlled()) setInternalOpen(next);
    props.onOpenChange?.(next);
  };

  const requestClose = (reason: DrawerCloseReason) => {
    if (!isDismissable()) return;
    if (reason === "escape" && !shouldCloseOnEsc()) return;
    if (reason === "backdrop" && !shouldCloseOnBackdropClick()) return;
    setIsOpen(false);
  };

  let exitTimer: ReturnType<typeof setTimeout> | undefined;

  createEffect(() => {
    const open = isOpen();
    const state = animState();

    if (open) {
      if (exitTimer) {
        clearTimeout(exitTimer);
        exitTimer = undefined;
      }
      if (state === "closed" || state === "exiting") {
        setAnimState("entering");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setAnimState("open"));
        });
      }
      return;
    }

    if (state === "open" || state === "entering") {
      setAnimState("exiting");
      exitTimer = setTimeout(() => setAnimState("closed"), EXIT_MS);
    }
  });

  onCleanup(() => {
    if (exitTimer) clearTimeout(exitTimer);
  });

  let hasScrollLock = false;
  createEffect(() => {
    const visible = isVisibleState(animState());
    if (visible && !hasScrollLock) {
      lockBodyScroll();
      hasScrollLock = true;
    } else if (!visible && hasScrollLock) {
      unlockBodyScroll();
      hasScrollLock = false;
    }
  });

  onCleanup(() => {
    if (hasScrollLock) unlockBodyScroll();
  });

  let restoreFocusTarget: HTMLElement | null = null;
  createEffect(() => {
    const state = animState();
    const dialog = dialogRef();
    if (!isVisibleState(state) || !dialog) return;

    if (!restoreFocusTarget) {
      const active = document.activeElement;
      if (active instanceof HTMLElement) restoreFocusTarget = active;
    }

    queueMicrotask(() => {
      if (trapFocusEnabled() && !dialog.contains(document.activeElement)) {
        focusFirst(dialog);
      }
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (!isVisibleState(animState())) return;

      if (event.key === "Escape") {
        event.preventDefault();
        requestClose("escape");
        return;
      }

      if (event.key === "Tab" && trapFocusEnabled()) {
        trapFocus(event, dialog);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    onCleanup(() => document.removeEventListener("keydown", onKeyDown));
  });

  createEffect(() => {
    if (animState() !== "closed" || !restoreFocusEnabled()) return;
    if (!restoreFocusTarget) return;
    queueMicrotask(() => {
      restoreFocusTarget?.focus?.();
      restoreFocusTarget = null;
    });
  });

  const contextValue: DrawerContextValue = {
    isOpen,
    setIsOpen,
    requestClose,
    animState,
    placement,
    size,
    backdrop,
    scrollBehavior,
    isDismissable,
    shouldCloseOnEsc,
    shouldCloseOnBackdropClick,
    trapFocus: trapFocusEnabled,
    restoreFocus: restoreFocusEnabled,
    dialogRef,
    setDialogRef,
    labelledBy,
    setLabelledBy,
    describedBy,
    setDescribedBy,
    setPlacementOverride,
    setBackdropDismissableOverride,
    setBackdropCloseOnClickOverride,
  };

  return (
    <DrawerContext value={contextValue}>
      <div
        {...others}
        class={twMerge(
          CLASSES.Root.base,
          isOpen() && CLASSES.Root.state.open,
          animState() === "entering" && CLASSES.Root.state.entering,
          animState() === "exiting" && CLASSES.Root.state.exiting,
          animState() === "closed" && CLASSES.Root.state.closed,
          props.class,
        )}
        data-slot="drawer-root"
        data-open={isVisibleState(animState()) ? "true" : "false"}
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </div>
    </DrawerContext>
  );
};

const DrawerTrigger: Layout<typeof componentRecipe, DrawerTriggerProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "onClick");

  const ctx = useDrawerContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    ctx.setIsOpen(true);
    if (typeof props.onClick === "function") props.onClick(event);
  };

  return (
    <button
      {...others}
      type="button"
      class={twMerge(CLASSES.Trigger.base, props.class)}
      data-slot="drawer-trigger"
      data-theme={props.dataTheme}
      style={props.style}
      onClick={handleClick}
    >
      {props.children}
    </button>
  );
};

const DrawerContent: Layout<typeof componentRecipe, DrawerContentProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "placement",
    "scrollBehavior",
    "material",
  );

  const ctx = useDrawerContext();
  const placement = () => props.placement ?? ctx.placement();
  const scrollBehavior = () => props.scrollBehavior ?? ctx.scrollBehavior();

  createEffect(() => {
    if (props.placement === undefined) return;
    ctx.setPlacementOverride(props.placement);
    onCleanup(() => ctx.setPlacementOverride(undefined));
  });

  return (
    <div
      {...others}
      class={twMerge(
        CLASSES.Content.base,
        CLASSES.Content.placement[placement()],
        CLASSES.Content.scroll[scrollBehavior()],
        ctx.animState() === "entering" && CLASSES.Content.state.entering,
        ctx.animState() === "exiting" && CLASSES.Content.state.exiting,
        props.class,
      )}
      data-slot="drawer-content"
      data-material={props.material ?? "solid"}
      data-placement={placement()}
      data-scroll={scrollBehavior()}
      data-entering={ctx.animState() === "entering" ? "true" : undefined}
      data-exiting={ctx.animState() === "exiting" ? "true" : undefined}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const DrawerBackdrop: Layout<typeof componentRecipe, DrawerBackdropProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "variant",
    "isDismissable",
    "shouldCloseOnBackdropClick",
    "onClick",
  );

  const ctx = useDrawerContext();
  const variant = () => props.variant ?? ctx.backdrop();

  createEffect(() => {
    if (props.isDismissable !== undefined) {
      ctx.setBackdropDismissableOverride(props.isDismissable);
      onCleanup(() => ctx.setBackdropDismissableOverride(undefined));
    }
  });

  createEffect(() => {
    if (props.shouldCloseOnBackdropClick !== undefined) {
      ctx.setBackdropCloseOnClickOverride(props.shouldCloseOnBackdropClick);
      onCleanup(() => ctx.setBackdropCloseOnClickOverride(undefined));
    }
  });

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (event.target === event.currentTarget) {
      ctx.requestClose("backdrop");
    }
    if (typeof props.onClick === "function") props.onClick(event);
  };

  return (
    <Show when={ctx.animState() !== "closed"}>
      <Portal>
        <div
          {...others}
          class={twMerge(
            CLASSES.Backdrop.base,
            CLASSES.Backdrop.variant[variant()],
            ctx.animState() === "entering" && CLASSES.Backdrop.state.entering,
            ctx.animState() === "exiting" && CLASSES.Backdrop.state.exiting,
            props.class,
          )}
          data-slot="drawer-backdrop"
          data-entering={ctx.animState() === "entering" ? "true" : undefined}
          data-exiting={ctx.animState() === "exiting" ? "true" : undefined}
          data-theme={props.dataTheme}
          style={props.style}
          onClick={handleClick}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
};

const SIDE_MAP: Record<DrawerDialogSide, string> = {
  left: "drawer__dialog--side-left",
  right: "drawer__dialog--side-right",
};
const DrawerDialog: Layout<typeof componentRecipe, DrawerDialogProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "side",
    "width",
    "maxWidth",
    "bg",
    "padding",
    "borderWidth",
    "borderColor",
    "ref",
    "size",
    "role",
    "tabIndex",
    "aria-labelledby",
    "aria-describedby",
  );

  const ctx = useDrawerContext();
  const placement = () => ctx.placement();
  const axis = () => (isSidePlacement(placement()) ? "side" : "edge");
  const size = () => props.size ?? ctx.size();

  const mergedStyle = (): JSX.CSSProperties => {
    const s: JSX.CSSProperties = {};
    if (typeof props.style === "object" && props.style) Object.assign(s, props.style);
    if (props.width) s["--drawer-dialog-width"] = props.width;
    if (props.maxWidth) s["--drawer-dialog-max-width"] = props.maxWidth;
    if (props.bg) s["--drawer-dialog-bg"] = props.bg;
    if (props.padding) s["--drawer-dialog-padding"] = props.padding;
    if (props.borderWidth) s["--drawer-dialog-border-width"] = props.borderWidth;
    if (props.borderColor) s["--drawer-dialog-border-color"] = props.borderColor;
    return s;
  };

  const hasCustomSize = () => Boolean(props.width || props.maxWidth);
  const hasCustomPadding = () => Boolean(props.padding);
  const hasCustomBg = () => Boolean(props.bg);

  return (
    <div
      {...others}
      ref={(node) => {
        ctx.setDialogRef(node);
        if (typeof props.ref === "function") props.ref(node);
      }}
      role={props.role ?? "dialog"}
      aria-modal="true"
      aria-labelledby={local["aria-labelledby"] ?? ctx.labelledBy()}
      aria-describedby={local["aria-describedby"] ?? ctx.describedBy()}
      tabIndex={props.tabIndex ?? -1}
      class={twMerge(
        CLASSES.Dialog.base,
        CLASSES.Dialog.axis[axis()],
        CLASSES.Dialog.size[axis()][size()],
        ctx.animState() === "entering" && CLASSES.Dialog.state.entering,
        ctx.animState() === "exiting" && CLASSES.Dialog.state.exiting,
        props.side ? SIDE_MAP[props.side] : undefined,
        hasCustomBg() ? "drawer__dialog--custom-bg" : undefined,
        hasCustomSize() ? "drawer__dialog--custom-size" : undefined,
        hasCustomPadding() ? "drawer__dialog--custom-padding" : undefined,
        props.class,
      )}
      data-slot="drawer-dialog"
      data-placement={placement()}
      data-size={size()}
      data-theme={props.dataTheme}
      style={mergedStyle()}
    >
      {props.children}
    </div>
  );
};

const DrawerHeader: Layout<typeof componentRecipe, DrawerHeaderProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      class={twMerge(CLASSES.Header.base, props.class)}
      data-slot="drawer-header"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const DrawerHeading: Layout<typeof componentRecipe, DrawerHeadingProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "id");
  const ctx = useDrawerContext();
  const uid = createUniqueId();
  const headingId = () => props.id ?? `drawer-heading-${uid}`;

  createEffect(() => {
    const id = headingId();
    ctx.setLabelledBy(id);
    onCleanup(() => {
      if (ctx.labelledBy() === id) ctx.setLabelledBy(undefined);
    });
  });

  return (
    <h2
      {...others}
      id={headingId()}
      class={twMerge(CLASSES.Heading.base, props.class)}
      data-slot="drawer-heading"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </h2>
  );
};

const DrawerBody: Layout<typeof componentRecipe, DrawerBodyProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style", "id");
  const ctx = useDrawerContext();
  const uid = createUniqueId();
  const bodyId = () => props.id ?? `drawer-body-${uid}`;

  createEffect(() => {
    const id = bodyId();
    ctx.setDescribedBy(id);
    onCleanup(() => {
      if (ctx.describedBy() === id) ctx.setDescribedBy(undefined);
    });
  });

  return (
    <div
      {...others}
      id={bodyId()}
      class={twMerge(CLASSES.Body.base, props.class)}
      data-slot="drawer-body"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const DrawerFooter: Layout<typeof componentRecipe, DrawerFooterProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <div
      {...others}
      class={twMerge(CLASSES.Footer.base, props.class)}
      data-slot="drawer-footer"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

const DrawerHandle: Layout<typeof componentRecipe, DrawerHandleProps> = () => {
  const others = omit(props, "class", "dataTheme", "style");

  return (
    <div
      {...others}
      aria-hidden="true"
      class={twMerge(CLASSES.Handle.base, props.class)}
      data-slot="drawer-handle"
      data-theme={props.dataTheme}
      style={props.style}
    >
      <div class={CLASSES.Handle.bar} data-slot="drawer-handle-bar" />
    </div>
  );
};

const DrawerCloseTrigger: Layout<typeof componentRecipe, DrawerCloseTriggerProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "startIcon",
    "endIcon",
    "onClick",
    "aria-label",
  );

  const ctx = useDrawerContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    ctx.requestClose("trigger");
    if (typeof props.onClick === "function") props.onClick(event);
  };

  return (
    <button
      {...others}
      type="button"
      aria-label={local["aria-label"] ?? "Close"}
      class={twMerge(CLASSES.CloseTrigger.base, props.class)}
      data-slot="drawer-close-trigger"
      data-theme={props.dataTheme}
      style={props.style}
      onClick={handleClick}
    >
      {props.startIcon ? (
        <span class={twMerge(CLASSES.CloseTrigger.icon, CLASSES.CloseTrigger.iconStart)}>
          {props.startIcon}
        </span>
      ) : null}
      {props.children}
      {props.endIcon ? (
        <span class={twMerge(CLASSES.CloseTrigger.icon, CLASSES.CloseTrigger.iconEnd)}>
          {props.endIcon}
        </span>
      ) : null}
    </button>
  );
};

const DrawerClose: Layout<typeof componentRecipe, DrawerCloseProps> = () => {
  const ctx = useDrawerContext();

  const handleClick = () => {
    ctx.requestClose("trigger");
  };

  return (
    <span data-slot="drawer-close" onClick={handleClick}>
      {props.children}
    </span>
  );
};

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

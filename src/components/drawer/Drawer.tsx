import "./Drawer.css";
import {
  Show,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
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
import { CLASSES } from "./Drawer.classes";
import { DrawerContext, useDrawerContext, type DrawerContextValue } from "./Drawer.context";

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
  IComponentBaseProps & {
    children: JSX.Element;
    isOpen?: boolean;
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
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerBackdropProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    variant?: DrawerBackdropVariant;
    /** @deprecated Configure dismissability at Drawer.Root `isDismissable` */
    isDismissable?: boolean;
    /** @deprecated Configure backdrop closing at Drawer.Root `shouldCloseOnBackdropClick` */
    shouldCloseOnBackdropClick?: boolean;
  };

export type DrawerContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    /** @deprecated Configure placement at Drawer.Root `placement` */
    placement?: DrawerPlacement;
    scrollBehavior?: DrawerScrollBehavior;
  };

export type DrawerDialogSide = "left" | "right";

export type DrawerDialogProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
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
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    id?: string;
  };

export type DrawerBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    id?: string;
  };

export type DrawerFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type DrawerHandleProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

export type DrawerCloseTriggerProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  IComponentBaseProps & {
    children?: JSX.Element;
    startIcon?: JSX.Element;
    endIcon?: JSX.Element;
  };

export type DrawerCloseProps = {
  children: JSX.Element;
};

/* ---------------------------------- root --------------------------------- */

const EXIT_MS = 200;

const DrawerRoot: ParentComponent<DrawerRootProps> = (props) => {
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
    "size",
    "backdrop",
    "scrollBehavior",
    "isDismissable",
    "shouldCloseOnEsc",
    "shouldCloseOnBackdropClick",
    "trapFocus",
    "restoreFocus",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [animState, setAnimState] = createSignal<DrawerAnimState>(
    Boolean(local.isOpen ?? local.defaultOpen) ? "open" : "closed",
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

  const isControlled = () => local.isOpen !== undefined;
  const isOpen = () => (isControlled() ? Boolean(local.isOpen) : internalOpen());

  const placement = () => placementOverride() ?? local.placement ?? "bottom";
  const size = () => local.size ?? "md";
  const backdrop = () => local.backdrop ?? "opaque";
  const scrollBehavior = () => local.scrollBehavior ?? "inside";
  const isDismissable = () => backdropDismissableOverride() ?? local.isDismissable ?? true;
  const shouldCloseOnEsc = () => local.shouldCloseOnEsc ?? true;
  const shouldCloseOnBackdropClick = () =>
    backdropCloseOnClickOverride() ?? local.shouldCloseOnBackdropClick ?? true;
  const trapFocusEnabled = () => local.trapFocus ?? true;
  const restoreFocusEnabled = () => local.restoreFocus ?? true;

  const setIsOpen = (next: boolean) => {
    if (next === isOpen()) return;
    if (!isControlled()) setInternalOpen(next);
    local.onOpenChange?.(next);
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
    <DrawerContext.Provider value={contextValue}>
      <div
        {...others}
        class={twMerge(
          CLASSES.Root.base,
          isOpen() && CLASSES.Root.state.open,
          animState() === "entering" && CLASSES.Root.state.entering,
          animState() === "exiting" && CLASSES.Root.state.exiting,
          animState() === "closed" && CLASSES.Root.state.closed,
          local.class,
          local.className,
        )}
        data-slot="drawer-root"
        data-open={isVisibleState(animState()) ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </DrawerContext.Provider>
  );
};

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

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    ctx.setIsOpen(true);
    if (typeof local.onClick === "function") local.onClick(event);
  };

  return (
    <button
      {...others}
      type="button"
      class={twMerge(CLASSES.Trigger.base, local.class, local.className)}
      data-slot="drawer-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children}
    </button>
  );
};

const DrawerContent: ParentComponent<DrawerContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "placement",
    "scrollBehavior",
  ]);

  const ctx = useDrawerContext();
  const placement = () => local.placement ?? ctx.placement();
  const scrollBehavior = () => local.scrollBehavior ?? ctx.scrollBehavior();

  createEffect(() => {
    if (local.placement === undefined) return;
    ctx.setPlacementOverride(local.placement);
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
        local.class,
        local.className,
      )}
      data-slot="drawer-content"
      data-placement={placement()}
      data-scroll={scrollBehavior()}
      data-entering={ctx.animState() === "entering" ? "true" : undefined}
      data-exiting={ctx.animState() === "exiting" ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
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
    "shouldCloseOnBackdropClick",
    "onClick",
  ]);

  const ctx = useDrawerContext();
  const variant = () => local.variant ?? ctx.backdrop();

  createEffect(() => {
    if (local.isDismissable !== undefined) {
      ctx.setBackdropDismissableOverride(local.isDismissable);
      onCleanup(() => ctx.setBackdropDismissableOverride(undefined));
    }
  });

  createEffect(() => {
    if (local.shouldCloseOnBackdropClick !== undefined) {
      ctx.setBackdropCloseOnClickOverride(local.shouldCloseOnBackdropClick);
      onCleanup(() => ctx.setBackdropCloseOnClickOverride(undefined));
    }
  });

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (event.target === event.currentTarget) {
      ctx.requestClose("backdrop");
    }
    if (typeof local.onClick === "function") local.onClick(event);
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
            local.class,
            local.className,
          )}
          data-slot="drawer-backdrop"
          data-entering={ctx.animState() === "entering" ? "true" : undefined}
          data-exiting={ctx.animState() === "exiting" ? "true" : undefined}
          data-theme={local.dataTheme}
          style={local.style}
          onClick={handleClick}
        >
          {local.children}
        </div>
      </Portal>
    </Show>
  );
};

const SIDE_MAP: Record<DrawerDialogSide, string> = {
  left: "drawer__dialog--side-left",
  right: "drawer__dialog--side-right",
};
const DrawerDialog: ParentComponent<DrawerDialogProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
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
  ]);

  const ctx = useDrawerContext();
  const placement = () => ctx.placement();
  const axis = () => (isSidePlacement(placement()) ? "side" : "edge");
  const size = () => local.size ?? ctx.size();

  const mergedStyle = (): JSX.CSSProperties => {
    const s: JSX.CSSProperties = {};
    if (typeof local.style === "object" && local.style) Object.assign(s, local.style);
    if (local.width) s["--drawer-dialog-width"] = local.width;
    if (local.maxWidth) s["--drawer-dialog-max-width"] = local.maxWidth;
    if (local.bg) s["--drawer-dialog-bg"] = local.bg;
    if (local.padding) s["--drawer-dialog-padding"] = local.padding;
    if (local.borderWidth) s["--drawer-dialog-border-width"] = local.borderWidth;
    if (local.borderColor) s["--drawer-dialog-border-color"] = local.borderColor;
    return s;
  };

  const hasCustomSize = () => Boolean(local.width || local.maxWidth);
  const hasCustomPadding = () => Boolean(local.padding);
  const hasCustomBg = () => Boolean(local.bg);

  return (
    <div
      {...others}
      ref={(node) => {
        ctx.setDialogRef(node);
        if (typeof local.ref === "function") local.ref(node);
      }}
      role={local.role ?? "dialog"}
      aria-modal="true"
      aria-labelledby={local["aria-labelledby"] ?? ctx.labelledBy()}
      aria-describedby={local["aria-describedby"] ?? ctx.describedBy()}
      tabIndex={local.tabIndex ?? -1}
      class={twMerge(
        CLASSES.Dialog.base,
        CLASSES.Dialog.axis[axis()],
        CLASSES.Dialog.size[axis()][size()],
        ctx.animState() === "entering" && CLASSES.Dialog.state.entering,
        ctx.animState() === "exiting" && CLASSES.Dialog.state.exiting,
        local.side ? SIDE_MAP[local.side] : undefined,
        hasCustomBg() ? "drawer__dialog--custom-bg" : undefined,
        hasCustomSize() ? "drawer__dialog--custom-size" : undefined,
        hasCustomPadding() ? "drawer__dialog--custom-padding" : undefined,
        local.class,
        local.className,
      )}
      data-slot="drawer-dialog"
      data-placement={placement()}
      data-size={size()}
      data-theme={local.dataTheme}
      style={mergedStyle()}
    >
      {local.children}
    </div>
  );
};

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
      class={twMerge(CLASSES.Header.base, local.class, local.className)}
      data-slot="drawer-header"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DrawerHeading: ParentComponent<DrawerHeadingProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
  ]);
  const ctx = useDrawerContext();
  const uid = createUniqueId();
  const headingId = () => local.id ?? `drawer-heading-${uid}`;

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
      class={twMerge(CLASSES.Heading.base, local.class, local.className)}
      data-slot="drawer-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h2>
  );
};

const DrawerBody: ParentComponent<DrawerBodyProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
  ]);
  const ctx = useDrawerContext();
  const uid = createUniqueId();
  const bodyId = () => local.id ?? `drawer-body-${uid}`;

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
      class={twMerge(CLASSES.Body.base, local.class, local.className)}
      data-slot="drawer-body"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

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
      class={twMerge(CLASSES.Footer.base, local.class, local.className)}
      data-slot="drawer-footer"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DrawerHandle: Component<DrawerHandleProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      aria-hidden="true"
      class={twMerge(CLASSES.Handle.base, local.class, local.className)}
      data-slot="drawer-handle"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <div class={CLASSES.Handle.bar} data-slot="drawer-handle-bar" />
    </div>
  );
};

const DrawerCloseTrigger: Component<DrawerCloseTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "startIcon",
    "endIcon",
    "onClick",
    "aria-label",
  ]);

  const ctx = useDrawerContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    ctx.requestClose("trigger");
    if (typeof local.onClick === "function") local.onClick(event);
  };

  return (
    <button
      {...others}
      type="button"
      aria-label={local["aria-label"] ?? "Close"}
      class={twMerge(CLASSES.CloseTrigger.base, local.class, local.className)}
      data-slot="drawer-close-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.startIcon ? (
        <span class={twMerge(CLASSES.CloseTrigger.icon, CLASSES.CloseTrigger.iconStart)}>
          {local.startIcon}
        </span>
      ) : null}
      {local.children}
      {local.endIcon ? (
        <span class={twMerge(CLASSES.CloseTrigger.icon, CLASSES.CloseTrigger.iconEnd)}>
          {local.endIcon}
        </span>
      ) : null}
    </button>
  );
};

const DrawerClose: ParentComponent<DrawerCloseProps> = (props) => {
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

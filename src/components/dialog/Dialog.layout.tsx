import "./Dialog.css";
import {
  Show,
  createContext,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  splitProps,
  useContext,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Dialog.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Dialog.recipe";

export type DialogPlacement = "auto" | "top" | "center" | "bottom";
export type DialogSize = "xs" | "sm" | "md" | "lg" | "cover" | "full";
export type DialogBackdropVariant = "opaque" | "blur" | "transparent";
export type DialogScrollBehavior = "inside" | "outside";

type DialogAnimState = "entering" | "open" | "exiting" | "closed";

type DialogContextValue = {
  isOpen: () => boolean;
  setIsOpen: (next: boolean) => void;
  animState: () => DialogAnimState;
  isDismissable: () => boolean;
  shouldCloseOnEsc: () => boolean;
  shouldCloseOnBackdropClick: () => boolean;
  placement: () => DialogPlacement;
  size: () => DialogSize;
  backdrop: () => DialogBackdropVariant;
  scrollBehavior: () => DialogScrollBehavior;
  contentRef: () => HTMLDivElement | undefined;
  setContentRef: (node: HTMLDivElement | undefined) => void;
  labelledBy: () => string | undefined;
  setLabelledBy: (id: string | undefined) => void;
  describedBy: () => string | undefined;
  setDescribedBy: (id: string | undefined) => void;
};

const DialogContext = createContext<DialogContextValue>();

const useModalContext = () => {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error("Dialog compound components must be used within <Dialog>.");
  }
  return context;
};

const isVisibleState = (state: DialogAnimState) => state === "entering" || state === "open";

let bodyLockCount = 0;
let previousBodyOverflow = "";
let previousBodyPaddingRight = "";

const lockBodyScroll = () => {
  if (bodyLockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    previousBodyPaddingRight = document.body.style.paddingRight;

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
    document.body.style.overflow = previousBodyOverflow;
    document.body.style.paddingRight = previousBodyPaddingRight;
  }
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable='true']",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const getFocusableElements = (container: HTMLElement) =>
  Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((element) => {
    if (element.hasAttribute("disabled")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.tabIndex < 0) return false;
    return !element.hidden;
  });

const trapFocus = (event: KeyboardEvent, container: HTMLElement) => {
  const focusable = getFocusableElements(container);

  if (focusable.length === 0) {
    event.preventDefault();
    container.focus();
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
    return;
  }

  if (event.shiftKey && (active === first || active === container)) {
    event.preventDefault();
    last.focus();
  }
};

const focusFirstElement = (container: HTMLElement) => {
  const autofocus = container.querySelector<HTMLElement>("[autofocus]");
  if (autofocus) {
    autofocus.focus();
    return;
  }

  const focusable = getFocusableElements(container);
  if (focusable.length > 0) {
    focusable[0].focus();
    return;
  }

  container.focus();
};

export type DialogRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    isDismissable?: boolean;
    shouldCloseOnEsc?: boolean;
    shouldCloseOnBackdropClick?: boolean;
    placement?: DialogPlacement;
    size?: DialogSize;
    backdrop?: DialogBackdropVariant;
    scrollBehavior?: DialogScrollBehavior;
  };

export type DialogTriggerProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DialogBackdropProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    variant?: DialogBackdropVariant;
    isDismissable?: boolean;
    shouldCloseOnBackdropClick?: boolean;
  };

export type DialogContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
    placement?: DialogPlacement;
    size?: DialogSize;
    backdrop?: DialogBackdropVariant;
    scrollBehavior?: DialogScrollBehavior;
    isDismissable?: boolean;
    shouldCloseOnBackdropClick?: boolean;
  };

export type DialogHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DialogHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DialogBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DialogFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DialogIconProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children: JSX.Element;
  };

export type DialogCloseTriggerProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
  };

const DialogRoot: Layout<typeof componentRecipe, DialogRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "ref",
    "open",
    "defaultOpen",
    "onOpenChange",
    "isDismissable",
    "shouldCloseOnEsc",
    "shouldCloseOnBackdropClick",
    "placement",
    "size",
    "backdrop",
    "scrollBehavior",
  ]);

  const [internalOpen, setInternalOpen] = createSignal(Boolean(local.defaultOpen));
  const [animState, setAnimState] = createSignal<DialogAnimState>(
    Boolean(local.open ?? local.defaultOpen) ? "open" : "closed",
  );
  const [contentRef, setContentRef] = createSignal<HTMLDivElement | undefined>(undefined);
  const [labelledBy, setLabelledBy] = createSignal<string | undefined>(undefined);
  const [describedBy, setDescribedBy] = createSignal<string | undefined>(undefined);

  const isControlled = () => local.open !== undefined;
  const isOpen = () => (isControlled() ? Boolean(local.open) : internalOpen());

  const setIsOpen = (next: boolean) => {
    if (isOpen() === next) return;

    if (!isControlled()) {
      setInternalOpen(next);
    }

    local.onOpenChange?.(next);
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
      exitTimer = setTimeout(() => setAnimState("closed"), 180);
    }
  });

  onCleanup(() => {
    if (exitTimer) {
      clearTimeout(exitTimer);
    }
  });

  let hasScrollLock = false;
  createEffect(() => {
    const shouldLock = isVisibleState(animState());
    if (shouldLock && !hasScrollLock) {
      lockBodyScroll();
      hasScrollLock = true;
    } else if (!shouldLock && hasScrollLock) {
      unlockBodyScroll();
      hasScrollLock = false;
    }
  });

  onCleanup(() => {
    if (hasScrollLock) {
      unlockBodyScroll();
      hasScrollLock = false;
    }
  });

  let restoreFocusTarget: HTMLElement | null = null;
  createEffect(() => {
    const state = animState();
    const content = contentRef();
    if (!isVisibleState(state) || !content) return;

    const activeElement = document.activeElement;
    if (!restoreFocusTarget && activeElement instanceof HTMLElement) {
      restoreFocusTarget = activeElement;
    }

    queueMicrotask(() => {
      if (!content.contains(document.activeElement)) {
        focusFirstElement(content);
      }
    });

    const handleDocumentKeyDown = (event: KeyboardEvent) => {
      if (!isVisibleState(animState())) return;

      if (event.key === "Escape") {
        if (local.isDismissable !== false && local.shouldCloseOnEsc !== false) {
          event.preventDefault();
          setIsOpen(false);
        }
        return;
      }

      if (event.key === "Tab") {
        trapFocus(event, content);
      }
    };

    document.addEventListener("keydown", handleDocumentKeyDown);

    onCleanup(() => {
      document.removeEventListener("keydown", handleDocumentKeyDown);
    });
  });

  createEffect(() => {
    if (animState() !== "closed") return;
    if (!restoreFocusTarget) return;

    queueMicrotask(() => {
      restoreFocusTarget?.focus?.();
      restoreFocusTarget = null;
    });
  });

  const contextValue: DialogContextValue = {
    isOpen,
    setIsOpen,
    animState,
    isDismissable: () => local.isDismissable !== false,
    shouldCloseOnEsc: () => local.shouldCloseOnEsc !== false,
    shouldCloseOnBackdropClick: () => local.shouldCloseOnBackdropClick !== false,
    placement: () => local.placement ?? "auto",
    size: () => local.size ?? "md",
    backdrop: () => local.backdrop ?? "opaque",
    scrollBehavior: () => local.scrollBehavior ?? "inside",
    contentRef,
    setContentRef,
    labelledBy,
    setLabelledBy,
    describedBy,
    setDescribedBy,
  };

  return (
    <DialogContext.Provider value={contextValue}>
      <div
        {...others}
        ref={(node) => {
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        {...{ class: twMerge(
          CLASSES.Root.base,
          isVisibleState(animState()) && CLASSES.Root.flag.open,
          local.class,
        ) }}
        data-slot="dialog-root"
        data-open={isVisibleState(animState()) ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </DialogContext.Provider>
  );
};

const DialogTrigger: Layout<typeof componentRecipe, DialogTriggerProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "type",
    "onClick",
  ]);

  const context = useModalContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    context.setIsOpen(true);
    if (typeof local.onClick === "function") {
      local.onClick(event);
    }
  };

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      {...{ class: twMerge(CLASSES.Trigger.base, local.class) }}
      data-slot="dialog-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children}
    </button>
  );
};

const DialogBackdrop: Layout<typeof componentRecipe, DialogBackdropProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "variant",
    "isDismissable",
    "shouldCloseOnBackdropClick",
    "onClick",
  ]);

  const context = useModalContext();
  const variant = () => local.variant ?? context.backdrop();
  const dismissable = () => local.isDismissable ?? context.isDismissable();
  const shouldCloseOnBackdropClick = () =>
    local.shouldCloseOnBackdropClick ?? context.shouldCloseOnBackdropClick();
  const isEntering = () => context.animState() === "entering";
  const isExiting = () => context.animState() === "exiting";

  const handleClick: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    if (
      dismissable() &&
      shouldCloseOnBackdropClick() &&
      event.target === event.currentTarget
    ) {
      context.setIsOpen(false);
    }

    if (typeof local.onClick === "function") {
      local.onClick(event);
    }
  };

  return (
    <div
      {...others}
      {...{ class: twMerge(
        CLASSES.Backdrop.base,
        CLASSES.Backdrop.variant[variant()],
        isEntering() && CLASSES.Backdrop.state.entering,
        isExiting() && CLASSES.Backdrop.state.exiting,
        local.class,
      ) }}
      data-slot="dialog-backdrop"
      data-entering={isEntering() ? "true" : undefined}
      data-exiting={isExiting() ? "true" : undefined}
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children}
    </div>
  );
};

const DialogContent: Layout<typeof componentRecipe, DialogContentProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "ref",
    "placement",
    "size",
    "backdrop",
    "scrollBehavior",
    "isDismissable",
    "shouldCloseOnBackdropClick",
    "role",
    "tabIndex",
    "aria-labelledby",
    "aria-describedby",
  ]);

  const context = useModalContext();

  const placement = () => local.placement ?? context.placement();
  const size = () => local.size ?? context.size();
  const scrollBehavior = () => local.scrollBehavior ?? context.scrollBehavior();
  const isEntering = () => context.animState() === "entering";
  const isExiting = () => context.animState() === "exiting";
  const containerSizeClass = () => {
    if (size() === "cover") return CLASSES.Container.size.cover;
    if (size() === "full") return CLASSES.Container.size.full;
    return undefined;
  };

  return (
    <Show when={context.animState() !== "closed"}>
      <Portal>
        <DialogBackdrop
          variant={local.backdrop}
          isDismissable={local.isDismissable}
          shouldCloseOnBackdropClick={local.shouldCloseOnBackdropClick}
          dataTheme={local.dataTheme}
        >
          <div
            {...{ class: twMerge(
              CLASSES.Container.base,
              CLASSES.Container.placement[placement()],
              CLASSES.Container.scroll[scrollBehavior()],
              containerSizeClass(),
              isEntering() && CLASSES.Container.state.entering,
              isExiting() && CLASSES.Container.state.exiting,
            ) }}
            data-slot="dialog-container"
            data-placement={placement()}
            data-entering={isEntering() ? "true" : undefined}
            data-exiting={isExiting() ? "true" : undefined}
          >
            <div
              {...others}
              ref={(node) => {
                context.setContentRef(node);
                if (typeof local.ref === "function") {
                  local.ref(node);
                }
              }}
              role={local.role ?? "dialog"}
              aria-dialog="true"
              aria-labelledby={local["aria-labelledby"] ?? context.labelledBy()}
              aria-describedby={local["aria-describedby"] ?? context.describedBy()}
              tabIndex={local.tabIndex ?? -1}
              {...{ class: twMerge(
                CLASSES.Content.base,
                CLASSES.Content.scroll[scrollBehavior()],
                CLASSES.Content.size[size()],
                isEntering() && CLASSES.Content.state.entering,
                isExiting() && CLASSES.Content.state.exiting,
                local.class,
              ) }}
              data-slot="dialog-content"
              data-placement={placement()}
              data-size={size()}
              data-scroll={scrollBehavior()}
              data-entering={isEntering() ? "true" : undefined}
              data-exiting={isExiting() ? "true" : undefined}
              data-theme={local.dataTheme}
              style={local.style}
            >
              {local.children}
            </div>
          </div>
        </DialogBackdrop>
      </Portal>
    </Show>
  );
};

const DialogHeader: Layout<typeof componentRecipe, DialogHeaderProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Header.base, local.class) }}
      data-slot="dialog-header"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DialogHeading: Layout<typeof componentRecipe, DialogHeadingProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "id",
  ]);

  const context = useModalContext();
  const uniqueId = createUniqueId();
  const headingId = () => local.id ?? `dialog-heading-${uniqueId}`;

  createEffect(() => {
    const id = headingId();
    context.setLabelledBy(id);

    onCleanup(() => {
      if (context.labelledBy() === id) {
        context.setLabelledBy(undefined);
      }
    });
  });

  return (
    <h2
      {...others}
      id={headingId()}
      {...{ class: twMerge(CLASSES.Heading.base, local.class) }}
      data-slot="dialog-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h2>
  );
};

const DialogIcon: Layout<typeof componentRecipe, DialogIconProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Icon.base, local.class) }}
      data-slot="dialog-icon"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DialogBody: Layout<typeof componentRecipe, DialogBodyProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "id",
  ]);

  const context = useModalContext();
  const uniqueId = createUniqueId();
  const bodyId = () => local.id ?? `dialog-body-${uniqueId}`;

  createEffect(() => {
    const id = bodyId();
    context.setDescribedBy(id);

    onCleanup(() => {
      if (context.describedBy() === id) {
        context.setDescribedBy(undefined);
      }
    });
  });

  return (
    <div
      {...others}
      id={bodyId()}
      {...{ class: twMerge(
        CLASSES.Body.base,
        CLASSES.Body.scroll[context.scrollBehavior()],
        local.class,
      ) }}
      data-slot="dialog-body"
      data-scroll={context.scrollBehavior()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DialogFooter: Layout<typeof componentRecipe, DialogFooterProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.Footer.base, local.class) }}
      data-slot="dialog-footer"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const DialogCloseTrigger: Layout<typeof componentRecipe, DialogCloseTriggerProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "type",
    "onClick",
    "aria-label",
  ]);

  const context = useModalContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    context.setIsOpen(false);
    if (typeof local.onClick === "function") {
      local.onClick(event);
    }
  };

  return (
    <button
      {...others}
      type={local.type ?? "button"}
      aria-label={local["aria-label"] ?? "Close dialog"}
      {...{ class: twMerge(CLASSES.CloseTrigger.base, local.class) }}
      data-slot="dialog-close-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children ?? (
        <svg
          {...{ class: CLASSES.CloseTrigger.icon }}
          data-slot="dialog-close-trigger-icon"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M18 6L6 18M6 6L18 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      )}
    </button>
  );
};

type DialogComponent = Component<DialogRootProps> & {
  Root: Component<DialogRootProps>;
  Trigger: Component<DialogTriggerProps>;
  Backdrop: Component<DialogBackdropProps>;
  Content: Component<DialogContentProps>;
  Header: Component<DialogHeaderProps>;
  Heading: Component<DialogHeadingProps>;
  Icon: Component<DialogIconProps>;
  Body: Component<DialogBodyProps>;
  Footer: Component<DialogFooterProps>;
  CloseTrigger: Component<DialogCloseTriggerProps>;
};

const Dialog = Object.assign(DialogRoot, {
  Root: DialogRoot,
  Trigger: DialogTrigger,
  Backdrop: DialogBackdrop,
  Content: DialogContent,
  Header: DialogHeader,
  Heading: DialogHeading,
  Icon: DialogIcon,
  Body: DialogBody,
  Footer: DialogFooter,
  CloseTrigger: DialogCloseTrigger,
}) as DialogComponent;

export type DialogProps = DialogRootProps;
export type DialogPanelProps = DialogContentProps;
export {
  DialogRoot,
  DialogTrigger,
  DialogBackdrop,
  DialogContent,
  DialogHeader,
  DialogHeading,
  DialogIcon,
  DialogBody,
  DialogFooter,
  DialogCloseTrigger,
};

export default Dialog;

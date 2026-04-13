import "./Modal.css";
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

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Modal.classes";

export type ModalPlacement = "auto" | "top" | "center" | "bottom";
export type ModalSize = "xs" | "sm" | "md" | "lg" | "cover" | "full";
export type ModalBackdropVariant = "opaque" | "blur" | "transparent";
export type ModalScrollBehavior = "inside" | "outside";

type ModalAnimState = "entering" | "open" | "exiting" | "closed";

type ModalContextValue = {
  isOpen: () => boolean;
  setIsOpen: (next: boolean) => void;
  animState: () => ModalAnimState;
  isDismissable: () => boolean;
  shouldCloseOnEsc: () => boolean;
  shouldCloseOnBackdropClick: () => boolean;
  placement: () => ModalPlacement;
  size: () => ModalSize;
  backdrop: () => ModalBackdropVariant;
  scrollBehavior: () => ModalScrollBehavior;
  contentRef: () => HTMLDivElement | undefined;
  setContentRef: (node: HTMLDivElement | undefined) => void;
  labelledBy: () => string | undefined;
  setLabelledBy: (id: string | undefined) => void;
  describedBy: () => string | undefined;
  setDescribedBy: (id: string | undefined) => void;
};

const ModalContext = createContext<ModalContextValue>();

const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within <Modal>.");
  }
  return context;
};

const isVisibleState = (state: ModalAnimState) => state === "entering" || state === "open";

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

export type ModalRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    isOpen?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (isOpen: boolean) => void;
    isDismissable?: boolean;
    shouldCloseOnEsc?: boolean;
    shouldCloseOnBackdropClick?: boolean;
    placement?: ModalPlacement;
    size?: ModalSize;
    backdrop?: ModalBackdropVariant;
    scrollBehavior?: ModalScrollBehavior;
  };

export type ModalTriggerProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ModalBackdropProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    variant?: ModalBackdropVariant;
    isDismissable?: boolean;
    shouldCloseOnBackdropClick?: boolean;
  };

export type ModalContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    placement?: ModalPlacement;
    size?: ModalSize;
    backdrop?: ModalBackdropVariant;
    scrollBehavior?: ModalScrollBehavior;
    isDismissable?: boolean;
    shouldCloseOnBackdropClick?: boolean;
  };

export type ModalHeaderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ModalHeadingProps = Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ModalBodyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ModalFooterProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ModalIconProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
  };

export type ModalCloseTriggerProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

const ModalRoot: ParentComponent<ModalRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "ref",
    "isOpen",
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
  const [animState, setAnimState] = createSignal<ModalAnimState>(
    Boolean(local.isOpen ?? local.defaultOpen) ? "open" : "closed",
  );
  const [contentRef, setContentRef] = createSignal<HTMLDivElement | undefined>(undefined);
  const [labelledBy, setLabelledBy] = createSignal<string | undefined>(undefined);
  const [describedBy, setDescribedBy] = createSignal<string | undefined>(undefined);

  const isControlled = () => local.isOpen !== undefined;
  const isOpen = () => (isControlled() ? Boolean(local.isOpen) : internalOpen());

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

  const contextValue: ModalContextValue = {
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
    <ModalContext.Provider value={contextValue}>
      <div
        {...others}
        ref={(node) => {
          if (typeof local.ref === "function") {
            local.ref(node);
          }
        }}
        class={twMerge(
          CLASSES.Root.base,
          isVisibleState(animState()) && CLASSES.Root.flag.open,
          local.class,
          local.className,
        )}
        data-slot="modal-root"
        data-open={isVisibleState(animState()) ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        {local.children}
      </div>
    </ModalContext.Provider>
  );
};

const ModalTrigger: Component<ModalTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
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
      class={twMerge(CLASSES.Trigger.base, local.class, local.className)}
      data-slot="modal-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children}
    </button>
  );
};

const ModalBackdrop: ParentComponent<ModalBackdropProps> = (props) => {
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
      class={twMerge(
        CLASSES.Backdrop.base,
        CLASSES.Backdrop.variant[variant()],
        isEntering() && CLASSES.Backdrop.state.entering,
        isExiting() && CLASSES.Backdrop.state.exiting,
        local.class,
        local.className,
      )}
      data-slot="modal-backdrop"
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

const ModalContent: ParentComponent<ModalContentProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
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
        <ModalBackdrop
          variant={local.backdrop}
          isDismissable={local.isDismissable}
          shouldCloseOnBackdropClick={local.shouldCloseOnBackdropClick}
          dataTheme={local.dataTheme}
        >
          <div
            class={twMerge(
              CLASSES.Container.base,
              CLASSES.Container.placement[placement()],
              CLASSES.Container.scroll[scrollBehavior()],
              containerSizeClass(),
              isEntering() && CLASSES.Container.state.entering,
              isExiting() && CLASSES.Container.state.exiting,
            )}
            data-slot="modal-container"
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
              aria-modal="true"
              aria-labelledby={local["aria-labelledby"] ?? context.labelledBy()}
              aria-describedby={local["aria-describedby"] ?? context.describedBy()}
              tabIndex={local.tabIndex ?? -1}
              class={twMerge(
                CLASSES.Content.base,
                CLASSES.Content.scroll[scrollBehavior()],
                CLASSES.Content.size[size()],
                isEntering() && CLASSES.Content.state.entering,
                isExiting() && CLASSES.Content.state.exiting,
                local.class,
                local.className,
              )}
              data-slot="modal-content"
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
        </ModalBackdrop>
      </Portal>
    </Show>
  );
};

const ModalHeader: ParentComponent<ModalHeaderProps> = (props) => {
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
      data-slot="modal-header"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const ModalHeading: ParentComponent<ModalHeadingProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
  ]);

  const context = useModalContext();
  const uniqueId = createUniqueId();
  const headingId = () => local.id ?? `modal-heading-${uniqueId}`;

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
      class={twMerge(CLASSES.Heading.base, local.class, local.className)}
      data-slot="modal-heading"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </h2>
  );
};

const ModalIcon: ParentComponent<ModalIconProps> = (props) => {
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
      class={twMerge(CLASSES.Icon.base, local.class, local.className)}
      data-slot="modal-icon"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const ModalBody: ParentComponent<ModalBodyProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
  ]);

  const context = useModalContext();
  const uniqueId = createUniqueId();
  const bodyId = () => local.id ?? `modal-body-${uniqueId}`;

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
      class={twMerge(
        CLASSES.Body.base,
        CLASSES.Body.scroll[context.scrollBehavior()],
        local.class,
        local.className,
      )}
      data-slot="modal-body"
      data-scroll={context.scrollBehavior()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const ModalFooter: ParentComponent<ModalFooterProps> = (props) => {
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
      data-slot="modal-footer"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const ModalCloseTrigger: Component<ModalCloseTriggerProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
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
      aria-label={local["aria-label"] ?? "Close modal"}
      class={twMerge(CLASSES.CloseTrigger.base, local.class, local.className)}
      data-slot="modal-close-trigger"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    >
      {local.children ?? (
        <svg
          class={CLASSES.CloseTrigger.icon}
          data-slot="modal-close-trigger-icon"
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

type ModalComponent = Component<ModalRootProps> & {
  Root: Component<ModalRootProps>;
  Trigger: Component<ModalTriggerProps>;
  Backdrop: Component<ModalBackdropProps>;
  Content: Component<ModalContentProps>;
  Header: Component<ModalHeaderProps>;
  Heading: Component<ModalHeadingProps>;
  Icon: Component<ModalIconProps>;
  Body: Component<ModalBodyProps>;
  Footer: Component<ModalFooterProps>;
  CloseTrigger: Component<ModalCloseTriggerProps>;
};

const Modal = Object.assign(ModalRoot, {
  Root: ModalRoot,
  Trigger: ModalTrigger,
  Backdrop: ModalBackdrop,
  Content: ModalContent,
  Header: ModalHeader,
  Heading: ModalHeading,
  Icon: ModalIcon,
  Body: ModalBody,
  Footer: ModalFooter,
  CloseTrigger: ModalCloseTrigger,
}) as ModalComponent;

export type ModalProps = ModalRootProps;
export type DialogProps = ModalContentProps;
export {
  ModalRoot,
  ModalTrigger,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalHeading,
  ModalIcon,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
};

export default Modal;

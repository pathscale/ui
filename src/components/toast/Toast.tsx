import "./Toast.css";
import {
  For,
  Show,
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  splitProps,
  useContext,
  type Accessor,
  type Component,
  type JSX,
  type ParentComponent,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import Button, { type ButtonProps } from "../button";
import CloseButton, { type CloseButtonProps } from "../close-button";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Toast.classes";

export const DEFAULT_GAP = 12;
export const DEFAULT_MAX_VISIBLE_TOAST = 3;
export const DEFAULT_SCALE_FACTOR = 0.05;
export const DEFAULT_TOAST_TIMEOUT = 4000;
export const DEFAULT_TOAST_WIDTH = 460;

const DEFAULT_QUEUE_MAX_VISIBLE_TOAST = Number.MAX_SAFE_INTEGER;
const DEFAULT_EXIT_DURATION = 220;

const invokeEventHandler = <T extends Event>(handler: unknown, event: T) => {
  if (typeof handler === "function") {
    (handler as (event: T) => void)(event);
    return;
  }

  if (Array.isArray(handler) && typeof handler[0] === "function") {
    handler[0](handler[1], event);
  }
};

export type ToastPlacement =
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "top"
  | "top-start"
  | "top-end"
  | "bottom start"
  | "bottom end"
  | "top start"
  | "top end";

export type ToastVariant =
  | "default"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "error";

type ResolvedToastVariant = "default" | "accent" | "success" | "warning" | "danger";
type PlacementKey = keyof typeof CLASSES.Provider.placement;

const normalizeVariant = (variant?: ToastVariant): ResolvedToastVariant => {
  if (variant === "info") return "accent";
  if (variant === "error") return "danger";
  return variant ?? "default";
};

const normalizePlacement = (placement?: ToastPlacement): PlacementKey => {
  const normalized = (placement ?? "bottom-end").trim().toLowerCase();

  switch (normalized) {
    case "bottom":
      return "bottom";
    case "bottom start":
    case "bottom-start":
      return "bottomStart";
    case "bottom end":
    case "bottom-end":
      return "bottomEnd";
    case "top":
      return "top";
    case "top start":
    case "top-start":
      return "topStart";
    case "top end":
    case "top-end":
      return "topEnd";
    default:
      return "bottomEnd";
  }
};

const isBottomPlacement = (placement: PlacementKey) => placement.startsWith("bottom");

export type ToastActionProps = Omit<ButtonProps, "variant" | "size">;

export interface ToastContentValue {
  indicator?: JSX.Element;
  title?: JSX.Element;
  description?: JSX.Element;
  variant?: ToastVariant;
  actionProps?: ToastActionProps;
  isLoading?: boolean;
}

export interface ToastQueueAddOptions {
  key?: string;
  timeout?: number;
  onClose?: () => void;
}

export interface ToastQueueItem<T extends object = ToastContentValue> {
  key: string;
  content: T;
  createdAt: number;
  timeout: number;
  isEntering: boolean;
  isExiting: boolean;
}

export interface ToastQueueOptions {
  maxVisibleToasts?: number;
  exitDuration?: number;
}

type ToastTimerMeta = {
  remaining: number;
  startedAt: number;
  timer?: ReturnType<typeof setTimeout>;
};

export class ToastQueue<T extends object = ToastContentValue> {
  private readonly readToasts: Accessor<ToastQueueItem<T>[]>;
  private readonly setToasts: (
    value: ToastQueueItem<T>[] | ((prev: ToastQueueItem<T>[]) => ToastQueueItem<T>[]),
  ) => ToastQueueItem<T>[];

  private readonly listeners = new Set<() => void>();
  private readonly closeCallbacks = new Map<string, (() => void) | undefined>();
  private readonly timeoutMeta = new Map<string, ToastTimerMeta>();
  private readonly exitTimers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly maxVisibleToasts?: number;

  private paused = false;
  private keyCounter = 0;
  private readonly exitDuration: number;

  constructor(options?: ToastQueueOptions) {
    const [toasts, setToasts] = createSignal<ToastQueueItem<T>[]>([]);
    this.readToasts = toasts;
    this.setToasts = setToasts;
    this.maxVisibleToasts = options?.maxVisibleToasts;
    this.exitDuration = options?.exitDuration ?? DEFAULT_EXIT_DURATION;
  }

  private emit = () => {
    for (const listener of this.listeners) {
      listener();
    }
  };

  private updateToasts = (updater: (prev: ToastQueueItem<T>[]) => ToastQueueItem<T>[]) => {
    this.setToasts((prev) => updater(prev));
    this.emit();
  };

  private scheduleTimeout = (key: string, duration: number) => {
    if (duration <= 0) return;

    if (this.paused) {
      this.timeoutMeta.set(key, {
        remaining: duration,
        startedAt: 0,
      });
      return;
    }

    const meta: ToastTimerMeta = {
      remaining: duration,
      startedAt: Date.now(),
    };

    meta.timer = setTimeout(() => {
      this.close(key);
    }, duration);

    this.timeoutMeta.set(key, meta);
  };

  private clearTimeoutFor = (key: string) => {
    const meta = this.timeoutMeta.get(key);
    if (meta?.timer) {
      clearTimeout(meta.timer);
    }

    this.timeoutMeta.delete(key);
  };

  private clearExitTimerFor = (key: string) => {
    const timer = this.exitTimers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.exitTimers.delete(key);
    }
  };

  add(content: T, options?: ToastQueueAddOptions): string {
    const timeout = options?.timeout ?? DEFAULT_TOAST_TIMEOUT;
    const key = options?.key ?? `toast-${++this.keyCounter}`;

    this.closeCallbacks.set(key, options?.onClose);

    this.updateToasts((prev) => [
      {
        key,
        content,
        timeout,
        createdAt: Date.now(),
        isEntering: true,
        isExiting: false,
      },
      ...prev,
    ]);

    queueMicrotask(() => {
      this.updateToasts((prev) =>
        prev.map((toast) =>
          toast.key === key && toast.isEntering ? { ...toast, isEntering: false } : toast,
        ),
      );
    });

    this.scheduleTimeout(key, timeout);
    return key;
  }

  close(key: string): void {
    const toast = this.readToasts().find((entry) => entry.key === key);
    if (!toast || toast.isExiting) return;

    this.clearTimeoutFor(key);

    this.updateToasts((prev) =>
      prev.map((entry) =>
        entry.key === key
          ? {
              ...entry,
              isEntering: false,
              isExiting: true,
            }
          : entry,
      ),
    );

    this.clearExitTimerFor(key);
    const timer = setTimeout(() => {
      this.remove(key, true);
    }, this.exitDuration);

    this.exitTimers.set(key, timer);
  }

  remove(key: string, invokeOnClose = true): void {
    this.clearTimeoutFor(key);
    this.clearExitTimerFor(key);

    const callback = this.closeCallbacks.get(key);
    this.closeCallbacks.delete(key);

    this.updateToasts((prev) => prev.filter((entry) => entry.key !== key));

    if (invokeOnClose) {
      callback?.();
    }
  }

  clear(invokeOnClose = false): void {
    for (const meta of this.timeoutMeta.values()) {
      if (meta.timer) {
        clearTimeout(meta.timer);
      }
    }

    for (const timer of this.exitTimers.values()) {
      clearTimeout(timer);
    }

    const callbacks = invokeOnClose
      ? Array.from(this.closeCallbacks.values()).filter(
          (callback): callback is () => void => typeof callback === "function",
        )
      : [];

    this.timeoutMeta.clear();
    this.exitTimers.clear();
    this.closeCallbacks.clear();

    this.updateToasts(() => []);

    for (const callback of callbacks) {
      callback();
    }
  }

  pauseAll(): void {
    if (this.paused) return;

    const now = Date.now();

    for (const [key, meta] of this.timeoutMeta.entries()) {
      if (meta.timer) {
        clearTimeout(meta.timer);
        meta.timer = undefined;
      }

      if (meta.startedAt > 0) {
        const elapsed = now - meta.startedAt;
        meta.remaining = Math.max(0, meta.remaining - elapsed);
      }

      meta.startedAt = 0;
      this.timeoutMeta.set(key, meta);
    }

    this.paused = true;
  }

  resumeAll(): void {
    if (!this.paused) return;

    this.paused = false;

    for (const [key, meta] of this.timeoutMeta.entries()) {
      if (meta.remaining <= 0) {
        this.close(key);
        continue;
      }

      meta.startedAt = Date.now();
      meta.timer = setTimeout(() => {
        this.close(key);
      }, meta.remaining);

      this.timeoutMeta.set(key, meta);
    }
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  toasts(): ToastQueueItem<T>[] {
    return this.readToasts();
  }

  get visibleToasts(): ToastQueueItem<T>[] {
    return this.readToasts();
  }

  getQueue(): ToastQueue<T> {
    return this;
  }
}

type ToastItemContextValue = {
  variant: Accessor<ResolvedToastVariant>;
  isLoading: Accessor<boolean>;
  onClose?: () => void;
};

const ToastItemContext = createContext<ToastItemContextValue>();

const useToastItemContext = () => {
  const context = useContext(ToastItemContext);
  if (!context) {
    throw new Error("Toast compound components must be used within <Toast>.");
  }
  return context;
};

const InfoIcon = () => (
  <svg
    class={CLASSES.Indicator.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 16v-4" />
    <path d="M12 8h.01" />
  </svg>
);

const SuccessIcon = () => (
  <svg
    class={CLASSES.Indicator.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m9 12 2 2 4-4" />
  </svg>
);

const WarningIcon = () => (
  <svg
    class={CLASSES.Indicator.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const DangerIcon = () => (
  <svg
    class={CLASSES.Indicator.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

const CloseIcon = () => (
  <svg
    class={CLASSES.Close.icon}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="m18 6-12 12" />
    <path d="m6 6 12 12" />
  </svg>
);

const DefaultIndicator: Component<{ variant: ResolvedToastVariant; isLoading: boolean }> = (
  props,
) => {
  if (props.isLoading) {
    return <span class={CLASSES.Spinner.base} aria-hidden="true" />;
  }

  switch (props.variant) {
    case "success":
      return <SuccessIcon />;
    case "warning":
      return <WarningIcon />;
    case "danger":
      return <DangerIcon />;
    case "accent":
      return <InfoIcon />;
    case "default":
    default:
      return <InfoIcon />;
  }
};

export type ToastRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "title"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    title?: JSX.Element;
    description?: JSX.Element;
    variant?: ToastVariant;
    indicator?: JSX.Element;
    actionProps?: ToastActionProps;
    isLoading?: boolean;
    onClose?: () => void;
    isFrontmost?: boolean;
    isHidden?: boolean;
    isEntering?: boolean;
    isExiting?: boolean;
  };

export type ToastContentProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type ToastIndicatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    variant?: ToastVariant;
  };

export type ToastTitleProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type ToastDescriptionProps = Omit<JSX.HTMLAttributes<HTMLParagraphElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
  };

export type ToastActionButtonProps = ToastActionProps;

export type ToastCloseButtonProps = Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> &
  Omit<CloseButtonProps, "children" | "startIcon" | "endIcon">;

const ToastContent: ParentComponent<ToastContentProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <div
      {...others}
      class={twMerge(CLASSES.Content.base, local.class, local.className)}
      data-slot="toast-content"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </div>
  );
};

const ToastIndicator: Component<ToastIndicatorProps> = (props) => {
  const ctx = useToastItemContext();
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "variant",
  ]);

  const variant = createMemo(() => normalizeVariant(local.variant ?? ctx.variant()));

  return (
    <div
      {...others}
      class={twMerge(CLASSES.Indicator.base, local.class, local.className)}
      data-slot="toast-indicator"
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show
        when={local.children}
        fallback={<DefaultIndicator variant={variant()} isLoading={ctx.isLoading()} />}
      >
        {local.children}
      </Show>
    </div>
  );
};

const ToastTitle: ParentComponent<ToastTitleProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <p
      {...others}
      class={twMerge(CLASSES.Title.base, local.class, local.className)}
      data-slot="toast-title"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </p>
  );
};

const ToastDescription: ParentComponent<ToastDescriptionProps> = (props) => {
  const [local, others] = splitProps(props, ["children", "class", "className", "dataTheme", "style"]);

  return (
    <p
      {...others}
      class={twMerge(CLASSES.Description.base, local.class, local.className)}
      data-slot="toast-description"
      data-theme={local.dataTheme}
      style={local.style}
    >
      {local.children}
    </p>
  );
};

const ToastActionButton: Component<ToastActionButtonProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className"]);

  return (
    <Button
      {...others}
      variant="outline"
      size="sm"
      class={twMerge(CLASSES.Action.base, local.class, local.className)}
      data-slot="toast-action"
    >
      {props.children}
    </Button>
  );
};

const ToastCloseButton: Component<ToastCloseButtonProps> = (props) => {
  const ctx = useToastItemContext();
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "aria-label",
    "dataTheme",
    "style",
    "onClick",
  ]);

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onClick, event);
    if (event.defaultPrevented) return;
    ctx.onClose?.();
  };

  return (
    <CloseButton
      {...others}
      class={twMerge(CLASSES.Close.base, local.class, local.className)}
      aria-label={local["aria-label"] ?? "Dismiss notification"}
      startIcon={<CloseIcon />}
      data-slot="toast-close"
      data-theme={local.dataTheme}
      style={local.style}
      onClick={handleClick}
    />
  );
};

const ToastRoot: ParentComponent<ToastRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "title",
    "description",
    "variant",
    "indicator",
    "actionProps",
    "isLoading",
    "onClose",
    "isFrontmost",
    "isHidden",
    "isEntering",
    "isExiting",
  ]);

  const variant = createMemo(() => normalizeVariant(local.variant));
  const isLoading = createMemo(() => Boolean(local.isLoading));
  const isFrontmost = createMemo(() => local.isFrontmost ?? true);
  const isHidden = createMemo(() => local.isHidden ?? false);

  const contextValue: ToastItemContextValue = {
    variant,
    isLoading,
    onClose: local.onClose,
  };

  const role = createMemo(() => (variant() === "danger" ? "alert" : "status"));
  const ariaLive = createMemo(() => (variant() === "danger" ? "assertive" : "polite"));

  return (
    <ToastItemContext.Provider value={contextValue}>
      <div
        {...others}
        class={twMerge(
          CLASSES.Item.base,
          CLASSES.Item.variant[variant()],
          isFrontmost() && CLASSES.Item.state.frontmost,
          isHidden() && CLASSES.Item.state.hidden,
          local.isEntering && CLASSES.Item.state.entering,
          local.isExiting && CLASSES.Item.state.exiting,
          local.class,
          local.className,
        )}
        role={role()}
        aria-live={ariaLive()}
        data-slot="toast"
        data-variant={variant()}
        data-frontmost={isFrontmost() ? "true" : "false"}
        data-hidden={isHidden() ? "true" : "false"}
        data-theme={local.dataTheme}
        style={local.style}
      >
        <Show
          when={local.children}
          fallback={
            <>
              <ToastIndicator>{local.indicator}</ToastIndicator>

              <ToastContent>
                <Show when={local.title != null}>
                  <ToastTitle>{local.title}</ToastTitle>
                </Show>

                <Show when={local.description != null}>
                  <ToastDescription>{local.description}</ToastDescription>
                </Show>

                <Show when={local.actionProps?.children}>
                  <ToastActionButton {...local.actionProps!} />
                </Show>
              </ToastContent>

              <Show when={local.onClose}>
                <ToastCloseButton />
              </Show>
            </>
          }
        >
          {local.children}
        </Show>
      </div>
    </ToastItemContext.Provider>
  );
};

export type ToastRenderFn = (
  toast: ToastQueueItem<ToastContentValue>,
  dismiss: () => void,
) => JSX.Element;

export type ToastProviderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    placement?: ToastPlacement;
    queue?: ToastQueue<ToastContentValue> | null;
    width?: number | string;
    gap?: number;
    maxVisibleToasts?: number;
    scaleFactor?: number;
    renderToast?: ToastRenderFn;
  };

const ToastProvider: ParentComponent<ToastProviderProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "ref",
    "placement",
    "queue",
    "width",
    "gap",
    "maxVisibleToasts",
    "scaleFactor",
    "renderToast",
    "onMouseEnter",
    "onMouseLeave",
  ]);

  const queue = createMemo(() => (local.queue === undefined ? toastQueue : local.queue));
  const placement = createMemo(() => normalizePlacement(local.placement));
  const gap = createMemo(() => local.gap ?? DEFAULT_GAP);
  const scaleFactor = createMemo(() => local.scaleFactor ?? DEFAULT_SCALE_FACTOR);
  const maxVisible = createMemo(
    () =>
      local.maxVisibleToasts ??
      queue()?.maxVisibleToasts ??
      DEFAULT_MAX_VISIBLE_TOAST,
  );

  const toasts = createMemo(() => queue()?.toasts() ?? []);

  const [frontHeight, setFrontHeight] = createSignal(0);
  const itemRefs = new Map<string, HTMLDivElement>();

  const setItemRef = (key: string, node: HTMLDivElement | undefined) => {
    if (!node) {
      itemRefs.delete(key);
      return;
    }

    itemRefs.set(key, node);
  };

  createEffect(() => {
    const frontmostToast = toasts()[0];
    const frontmostNode = frontmostToast ? itemRefs.get(frontmostToast.key) : undefined;

    if (!frontmostNode) {
      setFrontHeight(0);
      return;
    }

    setFrontHeight(frontmostNode.getBoundingClientRect().height);

    if (typeof ResizeObserver === "undefined") return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setFrontHeight(entry.contentRect.height);
      }
    });

    resizeObserver.observe(frontmostNode);
    onCleanup(() => {
      resizeObserver.disconnect();
    });
  });

  const widthValue = createMemo(() => {
    if (typeof local.width === "number") {
      return `${local.width}px`;
    }

    return local.width ?? `${DEFAULT_TOAST_WIDTH}px`;
  });

  const providerStyle = createMemo<JSX.CSSProperties>(() => ({
    "--toast-width": widthValue(),
    ...(local.style ?? {}),
  }));

  const handleMouseEnter: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onMouseEnter, event);
    queue()?.pauseAll();
  };

  const handleMouseLeave: JSX.EventHandlerUnion<HTMLDivElement, MouseEvent> = (event) => {
    invokeEventHandler(local.onMouseLeave, event);
    queue()?.resumeAll();
  };

  return (
    <div
      {...others}
      ref={local.ref}
      class={twMerge(
        CLASSES.Provider.base,
        CLASSES.Provider.placement[placement()],
        local.class,
        local.className,
      )}
      data-slot="toast-region"
      data-placement={placement()}
      data-theme={local.dataTheme}
      style={providerStyle()}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div class={CLASSES.Provider.stack} data-slot="toast-stack">
        {local.children}

        <For each={toasts()}>
          {(queuedToast, index) => {
            const dismiss = () => {
              queue()?.close(queuedToast.key);
            };

            const isFrontmost = () => index() === 0;
            const hidden = () => index() >= maxVisible();

            const itemStyle = createMemo<JSX.CSSProperties>(() => {
              const offset = index() * gap();
              const direction = isBottomPlacement(placement()) ? -1 : 1;
              const scale = Math.max(0.1, 1 - index() * scaleFactor());

              return {
                transform: `translate3d(0, ${direction * offset}px, 0) scale(${scale})`,
                "z-index": `${Math.max(1, toasts().length - index())}`,
                "--toast-front-height": `${frontHeight()}px`,
              };
            });

            return (
              <div
                ref={(node) => setItemRef(queuedToast.key, node)}
                class={twMerge(
                  CLASSES.Provider.item.base,
                  CLASSES.Provider.item.placement[placement()],
                  hidden() && CLASSES.Provider.item.state.hidden,
                )}
                data-slot="toast-region-item"
                data-index={index()}
                data-hidden={hidden() ? "true" : "false"}
                data-frontmost={isFrontmost() ? "true" : "false"}
                style={itemStyle()}
              >
                <Show
                  when={local.renderToast}
                  fallback={
                    <ToastRoot
                      title={queuedToast.content.title}
                      description={queuedToast.content.description}
                      variant={queuedToast.content.variant}
                      indicator={queuedToast.content.indicator}
                      actionProps={queuedToast.content.actionProps}
                      isLoading={queuedToast.content.isLoading}
                      onClose={dismiss}
                      isFrontmost={isFrontmost()}
                      isHidden={hidden()}
                      isEntering={queuedToast.isEntering}
                      isExiting={queuedToast.isExiting}
                    />
                  }
                >
                  {(renderToast) => renderToast()(queuedToast, dismiss)}
                </Show>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
};

export interface HeroUIToastOptions {
  description?: JSX.Element;
  indicator?: JSX.Element;
  variant?: ToastVariant;
  actionProps?: ToastActionProps;
  isLoading?: boolean;
  timeout?: number;
  onClose?: () => void;
}

export interface ToastPromiseOptions<T = unknown> {
  loading: JSX.Element;
  success: ((data: T) => JSX.Element) | JSX.Element;
  error: ((error: Error) => JSX.Element) | JSX.Element;
}

type ToastFunction = ((message: JSX.Element, options?: HeroUIToastOptions) => string) & {
  success: (message: JSX.Element, options?: Omit<HeroUIToastOptions, "variant">) => string;
  danger: (message: JSX.Element, options?: Omit<HeroUIToastOptions, "variant">) => string;
  error: (message: JSX.Element, options?: Omit<HeroUIToastOptions, "variant">) => string;
  info: (message: JSX.Element, options?: Omit<HeroUIToastOptions, "variant">) => string;
  warning: (message: JSX.Element, options?: Omit<HeroUIToastOptions, "variant">) => string;
  promise: <T>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
  ) => string;
  close: (key: string) => void;
  pauseAll: () => void;
  resumeAll: () => void;
  clear: () => void;
  getQueue: () => ToastQueue<ToastContentValue>;
};

const createToastFunction = (queue: ToastQueue<ToastContentValue>): ToastFunction => {
  const toastFn = ((message: JSX.Element, options?: HeroUIToastOptions) => {
    const timeout = options?.timeout ?? DEFAULT_TOAST_TIMEOUT;

    return queue.add(
      {
        title: message,
        description: options?.description,
        indicator: options?.indicator,
        variant: options?.variant ?? "default",
        actionProps: options?.actionProps,
        isLoading: options?.isLoading,
      },
      {
        timeout,
        onClose: options?.onClose,
      },
    );
  }) as ToastFunction;

  toastFn.success = (message, options) => toastFn(message, { ...options, variant: "success" });
  toastFn.danger = (message, options) => toastFn(message, { ...options, variant: "danger" });
  toastFn.error = (message, options) => toastFn(message, { ...options, variant: "error" });
  toastFn.info = (message, options) => toastFn(message, { ...options, variant: "accent" });
  toastFn.warning = (message, options) => toastFn(message, { ...options, variant: "warning" });

  toastFn.promise = <T,>(
    promise: Promise<T> | (() => Promise<T>),
    options: ToastPromiseOptions<T>,
  ): string => {
    const pendingPromise = typeof promise === "function" ? promise() : promise;

    const loadingToastKey = queue.add(
      {
        title: options.loading,
        variant: "default",
        isLoading: true,
      },
      {
        timeout: 0,
      },
    );

    pendingPromise
      .then((data) => {
        queue.close(loadingToastKey);
        const successMessage =
          typeof options.success === "function"
            ? options.success(data)
            : options.success;
        toastFn.success(successMessage);
      })
      .catch((rawError: unknown) => {
        queue.close(loadingToastKey);
        const error =
          rawError instanceof Error
            ? rawError
            : new Error(typeof rawError === "string" ? rawError : "Unknown error");
        const errorMessage =
          typeof options.error === "function" ? options.error(error) : options.error;
        toastFn.danger(errorMessage);
      });

    return loadingToastKey;
  };

  toastFn.close = (key: string) => {
    queue.close(key);
  };

  toastFn.pauseAll = () => {
    queue.pauseAll();
  };

  toastFn.resumeAll = () => {
    queue.resumeAll();
  };

  toastFn.clear = () => {
    queue.clear();
  };

  toastFn.getQueue = () => queue;

  return toastFn;
};

const toastQueue = new ToastQueue<ToastContentValue>({
  maxVisibleToasts: DEFAULT_QUEUE_MAX_VISIBLE_TOAST,
});

const toast = createToastFunction(toastQueue);

type ToastComponent = ParentComponent<ToastRootProps> & {
  Provider: ParentComponent<ToastProviderProps>;
  Content: ParentComponent<ToastContentProps>;
  Indicator: Component<ToastIndicatorProps>;
  Title: ParentComponent<ToastTitleProps>;
  Description: ParentComponent<ToastDescriptionProps>;
  ActionButton: Component<ToastActionButtonProps>;
  CloseButton: Component<ToastCloseButtonProps>;
  Queue: typeof ToastQueue;
  toast: ToastFunction;
};

const Toast = Object.assign(ToastRoot, {
  Provider: ToastProvider,
  Content: ToastContent,
  Indicator: ToastIndicator,
  Title: ToastTitle,
  Description: ToastDescription,
  ActionButton: ToastActionButton,
  CloseButton: ToastCloseButton,
  Queue: ToastQueue,
  toast,
}) as ToastComponent;

export default Toast;

export {
  ToastRoot,
  ToastProvider,
  ToastContent,
  ToastIndicator,
  ToastTitle,
  ToastDescription,
  ToastActionButton,
  ToastCloseButton,
  toast,
  toastQueue,
};

export type { ToastFunction };

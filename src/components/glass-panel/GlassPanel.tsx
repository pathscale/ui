import { type JSX, splitProps, createSignal, Show } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps, ComponentSize } from "../types";

export type GlassPanelBlur = "none" | "sm" | "md" | "lg" | "xl" | "2xl";

export type GlassPanelProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    blur?: GlassPanelBlur;
    collapsible?: boolean;
    open?: boolean;
    defaultOpen?: boolean;
    onToggle?: (open: boolean) => void;
    title?: string;
    icon?: JSX.Element;
    size?: ComponentSize;
    transparent?: boolean;
    glow?: boolean;
    accent?: "primary" | "secondary" | "accent" | "info" | "success" | "warning" | "error";
  };

const BLUR_MAP: Record<GlassPanelBlur, string> = {
  none: "",
  sm: "backdrop-blur-sm",
  md: "backdrop-blur-md",
  lg: "backdrop-blur-lg",
  xl: "backdrop-blur-xl",
  "2xl": "backdrop-blur-2xl",
};

const SIZE_PADDING: Record<ComponentSize, string> = {
  xs: "p-2",
  sm: "p-3",
  md: "p-4",
  lg: "p-5",
  xl: "p-6",
};

const ACCENT_BORDER: Record<string, string> = {
  primary: "border-l-primary",
  secondary: "border-l-secondary",
  accent: "border-l-accent",
  info: "border-l-info",
  success: "border-l-success",
  warning: "border-l-warning",
  error: "border-l-error",
};

const GlassPanel = (props: GlassPanelProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "blur",
    "collapsible",
    "open",
    "defaultOpen",
    "onToggle",
    "title",
    "icon",
    "size",
    "transparent",
    "glow",
    "accent",
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const blur = () => local.blur ?? "none";
  const size = () => local.size ?? "md";

  const isControlled = () => local.open !== undefined;
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? true);
  const isOpen = () => (isControlled() ? local.open! : internalOpen());

  const handleToggle = () => {
    const next = !isOpen();
    if (!isControlled()) {
      setInternalOpen(next);
    }
    local.onToggle?.(next);
  };

  const containerClasses = () =>
    twMerge(
      "glass-panel",
      "rounded-xl",
      "transition-all duration-200 ease-in-out",
      clsx({
        "bg-transparent": local.transparent,
        [BLUR_MAP[blur()]]: !local.transparent && blur() !== "none",
        "border-l-2": !!local.accent,
        [ACCENT_BORDER[local.accent ?? ""]]: !!local.accent,
      }),
      local.class,
      local.className,
    );

  const glassStyle = (): JSX.CSSProperties => {
    const base: JSX.CSSProperties = { ...((local.style as JSX.CSSProperties) || {}) };
    if (!local.transparent) {
      base.background = "color-mix(in srgb, var(--color-base-200) 85%, transparent)";
      base.border = "1px solid color-mix(in srgb, var(--color-base-content) 8%, transparent)";
    }
    if (local.glow) {
      base["box-shadow"] = "inset 0 1px 0 color-mix(in srgb, var(--color-base-content) 5%, transparent)";
    }
    return base;
  };

  const contentClasses = () =>
    twMerge(
      SIZE_PADDING[size()],
      clsx({
        "animate-collapse-open": local.collapsible && isOpen(),
        "animate-collapse-close": local.collapsible && !isOpen(),
      }),
    );

  return (
    <div
      {...others}
      class={containerClasses()}
      data-theme={local.dataTheme}
      style={glassStyle()}
    >
      <Show when={local.collapsible && local.title}>
        <button
          type="button"
          class="flex w-full items-center justify-between gap-2 px-4 py-3 text-sm font-medium cursor-pointer select-none transition-colors duration-150"
          style={{
            color: "color-mix(in srgb, var(--color-base-content) 50%, transparent)",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "color-mix(in srgb, var(--color-base-content) 80%, transparent)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "color-mix(in srgb, var(--color-base-content) 50%, transparent)"; }}
          onClick={handleToggle}
          aria-expanded={isOpen()}
        >
          <span class="flex items-center gap-2">
            <Show when={local.icon}>{local.icon}</Show>
            {local.title}
          </span>
          <svg
            class={twMerge(
              "h-4 w-4 transition-transform duration-200",
              clsx({ "rotate-180": isOpen() }),
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </Show>

      <Show when={!local.collapsible || isOpen()}>
        <div class={contentClasses()}>{local.children}</div>
      </Show>
    </div>
  );
};

export default GlassPanel;

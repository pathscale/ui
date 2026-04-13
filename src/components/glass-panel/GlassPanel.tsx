import "./GlassPanel.css";
import { type JSX, splitProps, createSignal, createUniqueId, Show } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps, ComponentSize, ComponentColor } from "../types";
import { CLASSES } from "./GlassPanel.classes";

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
    accent?: ComponentColor;
    paddingX?: string;
    paddingY?: string;
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
    "paddingX",
    "paddingY",
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const contentId = createUniqueId();
  const blur = () => local.blur ?? "none";
  const size = () => local.size ?? "md";

  const isControlled = () => local.open !== undefined;
  const [internalOpen, setInternalOpen] = createSignal(local.defaultOpen ?? true);
  const isOpen = () => (isControlled() ? local.open! : internalOpen());
  const accentKey = () => (local.accent ?? "ghost") as ComponentColor;

  const handleToggle = () => {
    const next = !isOpen();
    if (!isControlled()) {
      setInternalOpen(next);
    }
    local.onToggle?.(next);
  };

  const containerClasses = () =>
    twMerge(
      CLASSES.base,
      !local.transparent && CLASSES.blur[blur()],
      local.transparent && CLASSES.flag.transparent,
      local.glow && CLASSES.flag.glow,
      local.accent && CLASSES.accent[accentKey()],
      local.class,
      local.className,
    );

  const contentClasses = () =>
    twMerge(
      CLASSES.slot.content,
      local.collapsible && CLASSES.flag.contentCollapsible,
      local.collapsible && !isOpen() && CLASSES.flag.contentCollapsed,
      (!local.collapsible || isOpen()) && !(local.paddingX || local.paddingY) && CLASSES.size[size()],
      local.paddingX,
      local.paddingY,
    );

  return (
    <div
      {...others}
      {...{ class: containerClasses() }}
      data-theme={local.dataTheme}
      style={local.style}
    >
      <Show when={local.collapsible && local.title}>
        <button
          type="button"
          {...{ class: CLASSES.slot.headerButton }}
          onClick={handleToggle}
          aria-expanded={isOpen()}
          aria-controls={contentId}
        >
          <span {...{ class: CLASSES.slot.headerLabel }}>
            <Show when={local.icon}>{local.icon}</Show>
            {local.title}
          </span>
          <svg
            {...{ class: twMerge(
              CLASSES.slot.chevron,
              isOpen() && CLASSES.flag.chevronOpen,
            ) }}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </Show>

      <div
        id={contentId}
        {...{ class: contentClasses() }}
        style={{
          "grid-template-rows": (!local.collapsible || isOpen()) ? "1fr" : "0fr",
          opacity: (!local.collapsible || isOpen()) ? "1" : "0",
        }}
      >
        <div {...{ class: twMerge(CLASSES.slot.contentInner, local.collapsible && CLASSES.flag.contentInnerHidden) }}>
          {local.children}
        </div>
      </div>
    </div>
  );
};

export default GlassPanel;

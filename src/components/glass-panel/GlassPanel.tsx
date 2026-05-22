import "./GlassPanel.css";
import {
  type JSX,
  Show,
  createEffect,
  createSignal,
  createUniqueId,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type {
  ComponentColor,
  ComponentSize,
  IComponentBaseProps,
} from "../types";
import { CLASSES } from "./GlassPanel.classes";

export type GlassPanelBlur = "none" | "sm" | "md" | "lg" | "xl" | "2xl";
export type GlassPanelEffect = "default" | "liquid";

export type GlassPanelProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    blur?: GlassPanelBlur;
    effect?: GlassPanelEffect;
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
  let rootRef: HTMLDivElement | undefined;

  const [local, others] = splitProps(props, [
    "blur",
    "effect",
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
  const blur = () => local.blur ?? "md";
  const size = () => local.size ?? "md";
  const isLiquid = () => local.effect === "liquid";

  const isControlled = () => local.open !== undefined;
  const [internalOpen, setInternalOpen] = createSignal(
    local.defaultOpen ?? true,
  );
  const isOpen = () => (isControlled() ? local.open === true : internalOpen());
  const accentKey = () => (local.accent ?? "ghost") as ComponentColor;

  const handleToggle = () => {
    const next = !isOpen();
    if (!isControlled()) {
      setInternalOpen(next);
    }
    local.onToggle?.(next);
  };

  createEffect(() => {
    const element = rootRef;
    if (!element) return;

    if (!isLiquid() || local.transparent) {
      element.style.removeProperty("backdrop-filter");
      element.style.removeProperty("-webkit-backdrop-filter");
      return;
    }

    const backdropFilter =
      "blur(var(--glass-panel-blur)) saturate(var(--glass-saturation, 1.2)) brightness(var(--glass-brightness, 1))";
    element.style.backdropFilter = backdropFilter;
    element.style.setProperty("-webkit-backdrop-filter", backdropFilter);
  });

  const containerClasses = () =>
    twMerge(
      CLASSES.base,
      !local.transparent && !isLiquid() && CLASSES.blur[blur()],
      !local.transparent && isLiquid() && CLASSES.flag.liquid,
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
      (!local.collapsible || isOpen()) &&
        !(local.paddingX || local.paddingY) &&
        CLASSES.size[size()],
      local.paddingX,
      local.paddingY,
    );

  return (
    <div
      {...others}
      ref={rootRef}
      {...{ class: containerClasses() }}
      data-theme={local.dataTheme}
      data-glass-effect={isLiquid() ? "liquid" : undefined}
      style={local.style}
    >
      <span class="glass-panel__rim" aria-hidden="true" />
      <span class="glass-panel__depth" aria-hidden="true" />
      <span class="glass-panel__sheen" aria-hidden="true" />

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
            {...{
              class: twMerge(
                CLASSES.slot.chevron,
                isOpen() && CLASSES.flag.chevronOpen,
              ),
            }}
            aria-hidden="true"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </Show>

      <div
        id={contentId}
        {...{ class: contentClasses() }}
        style={{
          "grid-template-rows": !local.collapsible || isOpen() ? "1fr" : "0fr",
          opacity: !local.collapsible || isOpen() ? "1" : "0",
        }}
      >
        <div
          {...{
            class: twMerge(
              CLASSES.slot.contentInner,
              local.collapsible && CLASSES.flag.contentInnerHidden,
            ),
          }}
        >
          {local.children}
        </div>
      </div>
    </div>
  );
};

export default GlassPanel;

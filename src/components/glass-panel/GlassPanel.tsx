import "./GlassPanel.css";
import {
  type JSX,
  Show,
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

const LIQUID_GLASS_DISPLACEMENT_MAP =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'%3E%3Cdefs%3E%3ClinearGradient id='left' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='rgb(56,128,128)'/%3E%3Cstop offset='1' stop-color='rgb(128,128,128)'/%3E%3C/linearGradient%3E%3ClinearGradient id='right' x1='0' x2='1'%3E%3Cstop offset='0' stop-color='rgb(128,128,128)'/%3E%3Cstop offset='1' stop-color='rgb(200,128,128)'/%3E%3C/linearGradient%3E%3ClinearGradient id='top' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='rgb(128,56,128)'/%3E%3Cstop offset='1' stop-color='rgb(128,128,128)'/%3E%3C/linearGradient%3E%3ClinearGradient id='bottom' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='rgb(128,128,128)'/%3E%3Cstop offset='1' stop-color='rgb(128,200,128)'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='512' height='512' fill='rgb(128,128,128)'/%3E%3Crect width='96' height='512' fill='url(%23left)'/%3E%3Crect x='416' width='96' height='512' fill='url(%23right)'/%3E%3Crect width='512' height='96' fill='url(%23top)' opacity='.72'/%3E%3Crect y='416' width='512' height='96' fill='url(%23bottom)' opacity='.72'/%3E%3C/svg%3E";

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
  const liquidFilterId = `glass-panel-liquid-${createUniqueId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const blur = () => local.blur ?? "none";
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

  const containerStyle = () => {
    if (!isLiquid()) return local.style;
    const liquidBackdropFilter = `url(#${liquidFilterId}) blur(12px) saturate(1.22)`;

    return Object.assign(
      {},
      typeof local.style === "object" ? local.style : undefined,
      {
        "--glass-panel-liquid-filter": `url(#${liquidFilterId})`,
        "-webkit-backdrop-filter": liquidBackdropFilter,
        "backdrop-filter": liquidBackdropFilter,
      } as JSX.CSSProperties,
    );
  };

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
      {...{ class: containerClasses() }}
      data-theme={local.dataTheme}
      data-glass-effect={isLiquid() ? "liquid" : undefined}
      style={containerStyle()}
    >
      <Show when={!local.transparent && isLiquid()}>
        <svg
          class="glass-panel__liquid-filter"
          aria-hidden="true"
        >
          <defs>
            <filter
              id={liquidFilterId}
              x="-12%"
              y="-12%"
              width="124%"
              height="124%"
              color-interpolation-filters="sRGB"
            >
              <feImage
                href={LIQUID_GLASS_DISPLACEMENT_MAP}
                x="0"
                y="0"
                width="100%"
                height="100%"
                preserveAspectRatio="none"
                result="displacement-map"
              />
              <feDisplacementMap
                in="SourceGraphic"
                in2="displacement-map"
                scale="14"
                xChannelSelector="R"
                yChannelSelector="G"
                result="refracted"
              />
              <feColorMatrix
                in="refracted"
                type="saturate"
                values="1.16"
              />
            </filter>
          </defs>
        </svg>
      </Show>

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

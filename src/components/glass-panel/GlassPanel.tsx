import "./GlassPanel.css";
import {
  type JSX,
  Show,
  createEffect,
  createSignal,
  createUniqueId,
  onCleanup,
  onMount,
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

type GlassPanelGeometry = {
  width: number;
  height: number;
  radius: number;
};

const LIQUID_DEPTH_RATIO = 0.05;
const LIQUID_RADIUS_RATIO = 0.08;
const LIQUID_STRENGTH_RATIO = 0.5;
const LIQUID_CHROMATIC_ABERRATION_RATIO = 0.025;
const LIQUID_BLUR = 2;

const getDisplacementMap = ({
  height,
  width,
  radius,
  depth,
}: GlassPanelGeometry & { depth: number }) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <style>
        .mix { mix-blend-mode: screen; }
    </style>
    <defs>
        <linearGradient
          id="Y"
          x1="0"
          x2="0"
          y1="${Math.ceil((radius / height) * 15)}%"
          y2="${Math.floor(100 - (radius / height) * 15)}%">
            <stop offset="0%" stop-color="#0F0" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
        <linearGradient
          id="X"
          x1="${Math.ceil((radius / width) * 15)}%"
          x2="${Math.floor(100 - (radius / width) * 15)}%"
          y1="0"
          y2="0">
            <stop offset="0%" stop-color="#F00" />
            <stop offset="100%" stop-color="#000" />
        </linearGradient>
    </defs>

    <rect x="0" y="0" height="${height}" width="${width}" fill="#808080" />
    <g filter="blur(2px)">
      <rect x="0" y="0" height="${height}" width="${width}" fill="#000080" />
      <rect
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          fill="url(#Y)"
          class="mix"
      />
      <rect
          x="0"
          y="0"
          height="${height}"
          width="${width}"
          fill="url(#X)"
          class="mix"
      />
      <rect
          x="${depth}"
          y="${depth}"
          height="${height - 2 * depth}"
          width="${width - 2 * depth}"
          fill="#808080"
          rx="${radius}"
          ry="${radius}"
          filter="blur(${depth}px)"
      />
    </g>
</svg>`)}`;

const getDisplacementFilter = ({
  height,
  width,
  radius,
  depth,
  strength,
  chromaticAberration,
}: GlassPanelGeometry & {
  depth: number;
  strength: number;
  chromaticAberration: number;
}) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`<svg height="${height}" width="${width}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <filter id="displace" color-interpolation-filters="sRGB">
            <feImage x="0" y="0" height="${height}" width="${width}" href="${getDisplacementMap(
    {
      height,
      width,
      radius,
      depth,
    },
  )}" result="displacementMap" />
            <feDisplacementMap
                transform-origin="center"
                in="SourceGraphic"
                in2="displacementMap"
                scale="${strength + chromaticAberration * 2}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
            <feColorMatrix
            type="matrix"
            values="1 0 0 0 0
                    0 0 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedR"
                    />
            <feDisplacementMap
                in="SourceGraphic"
                in2="displacementMap"
                scale="${strength + chromaticAberration}"
                xChannelSelector="R"
                yChannelSelector="G"
            />
            <feColorMatrix
            type="matrix"
            values="0 0 0 0 0
                    0 1 0 0 0
                    0 0 0 0 0
                    0 0 0 1 0"
            result="displacedG"
                    />
            <feDisplacementMap
                    in="SourceGraphic"
                    in2="displacementMap"
                    scale="${strength}"
                    xChannelSelector="R"
                    yChannelSelector="G"
                />
                <feColorMatrix
                type="matrix"
                values="0 0 0 0 0
                        0 0 0 0 0
                        0 0 1 0 0
                        0 0 0 1 0"
                result="displacedB"
                        />
              <feBlend in="displacedR" in2="displacedG" mode="screen"/>
              <feBlend in2="displacedB" mode="screen"/>
        </filter>
    </defs>
</svg>`)}#displace`;

const getPx = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const callEventHandler = <TEvent extends Event>(
  handler: unknown,
  event: TEvent,
) => {
  if (typeof handler === "function") {
    (handler as (event: TEvent) => void)(event);
  }
};

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
  const blur = () => local.blur ?? "none";
  const size = () => local.size ?? "md";
  const isLiquid = () => local.effect === "liquid";
  const [geometry, setGeometry] = createSignal<GlassPanelGeometry>();
  const [pressed, setPressed] = createSignal(false);

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

  const syncGeometry = () => {
    if (!rootRef) return;

    const rect = rootRef.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const style = window.getComputedStyle(rootRef);
    setGeometry({
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      radius: Math.round(getPx(style.borderTopLeftRadius)),
    });
  };

  onMount(() => {
    syncGeometry();

    if (!rootRef || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(syncGeometry);
    observer.observe(rootRef);
    onCleanup(() => observer.disconnect());
  });

  createEffect(() => {
    const element = rootRef;
    if (!element) return;

    if (!isLiquid()) {
      element.style.removeProperty("backdrop-filter");
      element.style.removeProperty("-webkit-backdrop-filter");
      return;
    }

    const nextGeometry = geometry();
    if (!nextGeometry) return;

    const minSide = Math.min(nextGeometry.width, nextGeometry.height);
    const maxDepth = Math.max(1, Math.floor(minSide / 2) - 1);
    const depth = Math.min(
      maxDepth,
      Math.max(10, Math.round(minSide * LIQUID_DEPTH_RATIO)) /
        (pressed() ? 0.7 : 1),
    );
    const filter = getDisplacementFilter({
      ...nextGeometry,
      radius: Math.max(
        nextGeometry.radius,
        Math.round(minSide * LIQUID_RADIUS_RATIO),
      ),
      depth,
      strength: Math.round(minSide * LIQUID_STRENGTH_RATIO),
      chromaticAberration: Math.round(
        minSide * LIQUID_CHROMATIC_ABERRATION_RATIO,
      ),
    });
    const backdropFilter = `blur(${LIQUID_BLUR / 2}px) url('${filter}') blur(${LIQUID_BLUR}px) brightness(var(--glass-panel-liquid-brightness, 1.1)) saturate(var(--glass-panel-liquid-saturation, 1.5))`;

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
      onMouseDown={(event) => {
        callEventHandler(others.onMouseDown, event);
        setPressed(true);
      }}
      onMouseUp={(event) => {
        callEventHandler(others.onMouseUp, event);
        setPressed(false);
      }}
      onMouseLeave={(event) => {
        callEventHandler(others.onMouseLeave, event);
        setPressed(false);
      }}
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

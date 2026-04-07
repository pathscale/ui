import "./FloatingDock.css";
import {
  type JSX,
  type Component,
  For,
  Show,
  createSignal,
  onCleanup,
  onMount,
  splitProps,
} from "solid-js";
import { Portal } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export type FloatingDockItem = {
  title: string;
  icon: JSX.Element;
  href?: string;
  onClick?: (e: MouseEvent) => void;
};

export type FloatingDockDirection = "top" | "bottom" | "left" | "right";

export type FloatingDockProps = {
  items: FloatingDockItem[];
  orientation?: "horizontal" | "vertical";
  tooltipDirection?: FloatingDockDirection;
  mobilePopupDirection?: FloatingDockDirection;
  gap?: number;
  baseSize?: number;
  hoverSize?: number;
  iconSize?: number;
  hoverIconSize?: number;
  magnifyRange?: number;
  magnify?: boolean;
  nudge?: number;
  showDesktop?: boolean;
  showMobile?: boolean;
  showContainer?: boolean;
  desktopClass?: string;
  mobileClass?: string;
  itemClass?: string;
  tooltipClass?: string;
  mobileToggleIcon?: JSX.Element;
  springMass?: number;
  springStiffness?: number;
  springDamping?: number;
} & IComponentBaseProps;

/* ------------------------------------------------------------------ */
/*  Resolved config                                                   */
/* ------------------------------------------------------------------ */

type ResolvedConfig = {
  baseSize: number;
  hoverSize: number;
  iconSize: number;
  hoverIconSize: number;
  magnifyRange: number;
  magnify: boolean;
  nudge: number;
  gap: number;
  tooltipDir: FloatingDockDirection;
  springOpts: { mass: number; stiffness: number; damping: number };
  orientation: "horizontal" | "vertical";
  itemClass?: string;
  tooltipClass?: string;
};

/* ------------------------------------------------------------------ */
/*  Spring                                                            */
/* ------------------------------------------------------------------ */

const prefersReducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function createSpring(
  initial: number,
  opts: { mass?: number; stiffness?: number; damping?: number } = {},
) {
  const mass = opts.mass ?? 1;
  const stiffness = opts.stiffness ?? 150;
  const damping = opts.damping ?? 12;
  let current = initial;
  let velocity = 0;
  let target = initial;
  return {
    set(v: number) { target = v; },
    get() { return current; },
    settled() { return current === target && velocity === 0; },
    step(dt: number) {
      if (prefersReducedMotion) { current = target; velocity = 0; return; }
      const substeps = Math.ceil(dt / 0.004);
      const subDt = dt / substeps;
      for (let i = 0; i < substeps; i++) {
        const force = -stiffness * (current - target);
        const accel = (force - damping * velocity) / mass;
        velocity += accel * subDt;
        current += velocity * subDt;
      }
      if (Math.abs(current - target) < 0.01 && Math.abs(velocity) < 0.01) {
        current = target; velocity = 0;
      }
    },
  };
}

type Spring = ReturnType<typeof createSpring>;

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/* ------------------------------------------------------------------ */
/*  Item springs                                                      */
/* ------------------------------------------------------------------ */

type ItemSprings = {
  sScale: Spring;
  sIconScale: Spring;
  sNudge: Spring;
  wrapRef?: HTMLDivElement;
  iconRef?: HTMLDivElement;
};

/* ------------------------------------------------------------------ */
/*  DockItem                                                          */
/* ------------------------------------------------------------------ */

const TOOLTIP_OFFSET = 8;

function computeTooltipPos(rect: DOMRect, dir: FloatingDockDirection): { top: string; left: string } {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  switch (dir) {
    case "top": return { left: `${cx}px`, top: `${rect.top - TOOLTIP_OFFSET}px` };
    case "bottom": return { left: `${cx}px`, top: `${rect.bottom + TOOLTIP_OFFSET}px` };
    case "left": return { left: `${rect.left - TOOLTIP_OFFSET}px`, top: `${cy}px` };
    case "right": return { left: `${rect.right + TOOLTIP_OFFSET}px`, top: `${cy}px` };
  }
}

const TOOLTIP_TRANSFORM: Record<FloatingDockDirection, string> = {
  top: "translate(-50%, -100%)",
  bottom: "translate(-50%, 0)",
  left: "translate(-100%, -50%)",
  right: "translate(0, -50%)",
};

const DockItem: Component<{
  item: FloatingDockItem;
  cfg: ResolvedConfig;
  registerRefs: (wrap: HTMLDivElement, icon: HTMLDivElement) => void;
}> = (props) => {
  let wrapRef: HTMLDivElement | undefined;
  let iconRef: HTMLDivElement | undefined;

  const [hovered, setHovered] = createSignal(false);
  const [tooltipStyle, setTooltipStyle] = createSignal<{ top: string; left: string }>({ top: "0", left: "0" });
  const cfg = props.cfg;

  onMount(() => {
    if (wrapRef && iconRef) props.registerRefs(wrapRef, iconRef);
  });

  const handleMouseEnter = () => {
    if (wrapRef) {
      setTooltipStyle(computeTooltipPos(wrapRef.getBoundingClientRect(), cfg.tooltipDir));
    }
    setHovered(true);
  };

  const handleClick = (e: MouseEvent) => {
    if (props.item.onClick) { e.preventDefault(); props.item.onClick(e); }
  };

  const inner = (
    <div
      ref={wrapRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      class={twMerge("floating-dock__item", cfg.itemClass)}
      style={{ width: `${cfg.baseSize}px`, height: `${cfg.baseSize}px` }}
    >
      <Show when={hovered()}>
        <Portal>
          <div
            class={twMerge("floating-dock__tooltip", cfg.tooltipClass)}
            style={{
              top: tooltipStyle().top,
              left: tooltipStyle().left,
              transform: TOOLTIP_TRANSFORM[cfg.tooltipDir],
            }}
          >
            {props.item.title}
          </div>
        </Portal>
      </Show>
      <div ref={iconRef} class="floating-dock__icon">
        {props.item.icon}
      </div>
    </div>
  );

  return (
    <Show
      when={props.item.onClick}
      fallback={
        <Show when={props.item.href} fallback={inner}>
          <a href={props.item.href} aria-label={props.item.title}>{inner}</a>
        </Show>
      }
    >
      <button type="button" onClick={handleClick} aria-label={props.item.title} class="appearance-none bg-transparent border-0 p-0 cursor-pointer">
        {inner}
      </button>
    </Show>
  );
};

/* ------------------------------------------------------------------ */
/*  Desktop dock                                                      */
/* ------------------------------------------------------------------ */

const FloatingDockDesktop: Component<{
  items: FloatingDockItem[];
  class?: string;
  cfg: ResolvedConfig;
  showContainer: boolean;
}> = (props) => {
  const [mousePos, setMousePos] = createSignal(Infinity);
  const isH = () => props.cfg.orientation === "horizontal";
  const cfg = props.cfg;

  const itemSprings: ItemSprings[] = [];
  let bgRef: HTMLDivElement | undefined;

  let rafId: number | undefined;
  let prevTime = 0;
  let lastMousePos = Infinity;
  let loopRunning = false;
  let anchorCenters: number[] = [];

  const captureAnchors = () => {
    anchorCenters = [];
    for (let i = 0; i < itemSprings.length; i++) {
      const wrap = itemSprings[i].wrapRef;
      if (wrap) {
        const b = wrap.getBoundingClientRect();
        anchorCenters[i] = isH() ? b.x + b.width / 2 : b.y + b.height / 2;
      }
    }
  };

  const startLoop = () => {
    if (loopRunning || !cfg.magnify) return;
    loopRunning = true;
    prevTime = 0;
    rafId = requestAnimationFrame(tick);
  };

  const stopLoop = () => {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
    rafId = undefined;
    loopRunning = false;
  };

  const tick = (time: number) => {
    const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 1 / 60;
    prevTime = time;

    const mp = mousePos();

    if (mp !== lastMousePos) {
      lastMousePos = mp;

      for (let i = 0; i < itemSprings.length; i++) {
        const s = itemSprings[i];
        if (!s.wrapRef || anchorCenters[i] === undefined) continue;
        const dist = mp - anchorCenters[i];
        const absDist = Math.abs(dist);

        // Scale targets
        const ts = mp === Infinity ? cfg.baseSize : mapRange(absDist, 0, cfg.magnifyRange, cfg.hoverSize, cfg.baseSize);
        const ti = mp === Infinity ? cfg.iconSize : mapRange(absDist, 0, cfg.magnifyRange, cfg.hoverIconSize, cfg.iconSize);
        s.sScale.set(ts);
        s.sIconScale.set(ti);

        // Nudge: items push away from cursor (like macOS dock)
        if (mp === Infinity || absDist > cfg.magnifyRange) {
          s.sNudge.set(0);
        } else {
          const scale = mapRange(absDist, 0, cfg.magnifyRange, cfg.hoverSize / cfg.baseSize, 1);
          const nudgeAmount = (-dist / cfg.magnifyRange) * cfg.nudge * scale;
          s.sNudge.set(nudgeAmount);
        }
      }
    }

    // Step all springs
    let allSettled = true;
    for (let i = 0; i < itemSprings.length; i++) {
      const s = itemSprings[i];
      s.sScale.step(dt); s.sIconScale.step(dt); s.sNudge.step(dt);
      if (allSettled && !(s.sScale.settled() && s.sIconScale.settled() && s.sNudge.settled())) {
        allSettled = false;
      }
    }

    // Write transforms
    const maxScale = cfg.hoverSize / cfg.baseSize;
    const maxIconScale = cfg.hoverIconSize / cfg.iconSize;
    for (let i = 0; i < itemSprings.length; i++) {
      const s = itemSprings[i];
      if (s.wrapRef) {
        const scale = Math.max(0.8, Math.min(s.sScale.get() / cfg.baseSize, maxScale));
        const nudge = s.sNudge.get();
        if (isH()) {
          s.wrapRef.style.transform = `translateX(${nudge}px) scale(${scale})`;
        } else {
          s.wrapRef.style.transform = `translateY(${nudge}px) scale(${scale})`;
        }
      }
      if (s.iconRef) {
        const iconScale = Math.max(0.8, Math.min(s.sIconScale.get() / cfg.iconSize, maxIconScale));
        s.iconRef.style.transform = `scale(${iconScale})`;
      }
    }

    // Expand background to cover magnified items
    if (bgRef && props.showContainer) {
      let minEdge = Infinity;
      let maxEdge = -Infinity;
      for (let i = 0; i < itemSprings.length; i++) {
        const s = itemSprings[i];
        if (!s.wrapRef) continue;
        const scale = s.sScale.get() / cfg.baseSize;
        const nudge = s.sNudge.get();
        const halfScaled = (cfg.baseSize * scale) / 2;
        const center = anchorCenters[i] + nudge;
        minEdge = Math.min(minEdge, center - halfScaled);
        maxEdge = Math.max(maxEdge, center + halfScaled);
      }
      if (isH() && minEdge !== Infinity) {
        const barRect = bgRef.parentElement?.getBoundingClientRect();
        if (barRect) {
          const pad = 16;
          bgRef.style.left = `${minEdge - barRect.left - pad}px`;
          bgRef.style.right = `${barRect.right - maxEdge - pad}px`;
        }
      }
    }

    if (allSettled) { stopLoop(); return; }
    rafId = requestAnimationFrame(tick);
  };

  onCleanup(() => { stopLoop(); });

  return (
    <div
      role="toolbar"
      aria-label="Actions"
      onMouseEnter={captureAnchors}
      onMouseMove={(e) => { setMousePos(isH() ? e.clientX : e.clientY); startLoop(); }}
      onMouseLeave={() => { setMousePos(Infinity); startLoop(); }}
      class={twMerge(
        "floating-dock__bar",
        isH() ? "floating-dock__bar--horizontal" : "floating-dock__bar--vertical",
        props.class,
      )}
      style={{
        gap: `${cfg.gap}px`,
        padding: props.showContainer ? (isH() ? "0.5rem 1rem" : "1rem 0.5rem") : undefined,
        ...(isH() ? { height: `${cfg.baseSize + 16}px` } : { width: `${cfg.baseSize + 16}px` }),
      }}
    >
      <Show when={props.showContainer}>
        <div ref={bgRef} class="floating-dock__bg" />
      </Show>
      <For each={props.items}>
        {(item, idx) => {
          const springs: ItemSprings = {
            sScale: createSpring(cfg.baseSize, cfg.springOpts),
            sIconScale: createSpring(cfg.iconSize, cfg.springOpts),
            sNudge: createSpring(0, cfg.springOpts),
          };
          itemSprings[idx()] = springs;

          return (
            <DockItem
              item={item}
              cfg={cfg}
              registerRefs={(wrap, icon) => {
                springs.wrapRef = wrap;
                springs.iconRef = icon;
              }}
            />
          );
        }}
      </For>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Mobile dock                                                       */
/* ------------------------------------------------------------------ */

const MOBILE_POPUP_CLASS: Record<FloatingDockDirection, string> = {
  top: "floating-dock__mobile-popup--top",
  bottom: "floating-dock__mobile-popup--bottom",
  left: "floating-dock__mobile-popup--left",
  right: "floating-dock__mobile-popup--right",
};

const FloatingDockMobile: Component<{
  items: FloatingDockItem[];
  class?: string;
  toggleIcon?: JSX.Element;
  popupDirection: FloatingDockDirection;
  cfg: ResolvedConfig;
}> = (props) => {
  const [open, setOpen] = createSignal(false);

  const handleItemClick = (item: FloatingDockItem, e: MouseEvent) => {
    if (item.onClick) { e.preventDefault(); item.onClick(e); }
    setOpen(false);
  };

  return (
    <div class={twMerge("floating-dock__mobile", props.class)}>
      <Show when={open()}>
        <div class={twMerge("floating-dock__mobile-popup", MOBILE_POPUP_CLASS[props.popupDirection])}>
          <For each={props.items}>
            {(item, idx) => (
              <div
                class="floating-dock__mobile-item"
                style={{
                  "animation-delay": `${(props.items.length - 1 - idx()) * 0.05}s`,
                }}
              >
                <Show
                  when={item.onClick}
                  fallback={
                    <Show
                      when={item.href}
                      fallback={
                        <div class="floating-dock__item" style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }} title={item.title}>
                          {item.icon}
                        </div>
                      }
                    >
                      <a href={item.href} class="floating-dock__item" style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }} title={item.title}>
                        {item.icon}
                      </a>
                    </Show>
                  }
                >
                  <button type="button" onClick={(e) => handleItemClick(item, e)} class="floating-dock__mobile-toggle" style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }} title={item.title}>
                    {item.icon}
                  </button>
                </Show>
              </div>
            )}
          </For>
        </div>
      </Show>
      <button
        type="button"
        onClick={() => setOpen(!open())}
        class="floating-dock__mobile-toggle"
        style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }}
      >
        {props.toggleIcon ?? (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style={{ color: "color-mix(in oklab, var(--color-base-content) 60%, transparent)" }}>
            <path d="M4 6h16" /><path d="M4 12h16" /><path d="M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main                                                              */
/* ------------------------------------------------------------------ */

const FloatingDock = (rawProps: FloatingDockProps): JSX.Element => {
  const [local, others] = splitProps(rawProps, [
    "items", "orientation", "tooltipDirection", "mobilePopupDirection", "gap",
    "baseSize", "hoverSize", "iconSize", "hoverIconSize", "magnifyRange",
    "magnify", "nudge", "showDesktop", "showMobile", "showContainer",
    "desktopClass", "mobileClass", "itemClass", "tooltipClass", "mobileToggleIcon",
    "springMass", "springStiffness", "springDamping",
    "class", "className", "dataTheme", "style",
  ]);

  const cfg = (): ResolvedConfig => ({
    baseSize: local.baseSize ?? 40,
    hoverSize: local.hoverSize ?? 80,
    iconSize: local.iconSize ?? 20,
    hoverIconSize: local.hoverIconSize ?? 40,
    magnifyRange: local.magnifyRange ?? 110,
    magnify: local.magnify !== false,
    nudge: local.nudge ?? 40,
    gap: local.gap ?? 12,
    tooltipDir: local.tooltipDirection ?? "top",
    orientation: local.orientation ?? "horizontal",
    itemClass: local.itemClass,
    tooltipClass: local.tooltipClass,
    springOpts: {
      mass: local.springMass ?? 0.1,
      stiffness: local.springStiffness ?? 170,
      damping: local.springDamping ?? 12,
    },
  });

  return (
    <div class="floating-dock" data-theme={local.dataTheme} style={local.style} {...others}>
      <Show when={local.showDesktop !== false}>
        <FloatingDockDesktop
          items={local.items}
          class={twMerge(local.class, local.className, local.desktopClass)}
          cfg={cfg()}
          showContainer={local.showContainer !== false}
        />
      </Show>
      <Show when={local.showMobile !== false}>
        <FloatingDockMobile
          items={local.items}
          class={local.mobileClass}
          toggleIcon={local.mobileToggleIcon}
          popupDirection={local.mobilePopupDirection ?? "top"}
          cfg={cfg()}
        />
      </Show>
    </div>
  );
};

export default FloatingDock;

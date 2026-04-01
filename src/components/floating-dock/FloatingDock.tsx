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
  /** Tooltip label. */
  title: string;
  /** Icon element rendered inside the dock button. */
  icon: JSX.Element;
  /** Navigation URL. Ignored when `onClick` is provided. */
  href?: string;
  /** Click handler. When provided, renders a `<button>` instead of `<a>`. */
  onClick?: (e: MouseEvent) => void;
};

export type FloatingDockDirection = "top" | "bottom" | "left" | "right";

export type FloatingDockProps = {
  items: FloatingDockItem[];
  /** Direction the dock is oriented. @default "horizontal" */
  orientation?: "horizontal" | "vertical";
  /** Where the tooltip appears relative to each icon. @default "top" */
  tooltipDirection?: FloatingDockDirection;
  /** Where the mobile popup opens. @default "top" */
  mobilePopupDirection?: FloatingDockDirection;
  /** Gap between items in px. @default 16 */
  gap?: number;
  /** Icon container resting size in px. @default 40 */
  baseSize?: number;
  /** Icon container size when hovered/nearest to cursor in px. @default 80 */
  hoverSize?: number;
  /** Icon resting size in px. @default 20 */
  iconSize?: number;
  /** Icon size when hovered/nearest in px. @default 40 */
  hoverIconSize?: number;
  /** Distance in px within which magnification activates. @default 150 */
  magnifyRange?: number;
  /** Enable the spring magnification effect. @default true */
  magnify?: boolean;
  /** Show desktop dock. @default true */
  showDesktop?: boolean;
  /** Show mobile toggle dock. @default true */
  showMobile?: boolean;
  /** Show the dock container background. @default true */
  showContainer?: boolean;
  /** Classes applied to the desktop dock container. */
  desktopClass?: string;
  /** Classes applied to the mobile dock container. */
  mobileClass?: string;
  /** Classes applied to each item wrapper. */
  itemClass?: string;
  /** Classes applied to the tooltip. */
  tooltipClass?: string;
  /** Icon shown in the mobile toggle button. */
  mobileToggleIcon?: JSX.Element;
  /** Spring mass. @default 0.1 */
  springMass?: number;
  /** Spring stiffness. @default 150 */
  springStiffness?: number;
  /** Spring damping. @default 12 */
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
    snap() { current = target; velocity = 0; },
    step(dt: number) {
      if (prefersReducedMotion) {
        current = target;
        velocity = 0;
        return;
      }
      // Sub-step for numerical stability — explicit Euler diverges
      // with small mass (0.1) at dt > ~0.004.
      const substeps = Math.ceil(dt / 0.004);
      const subDt = dt / substeps;
      for (let i = 0; i < substeps; i++) {
        const force = -stiffness * (current - target);
        const accel = (force - damping * velocity) / mass;
        velocity += accel * subDt;
        current += velocity * subDt;
      }
      if (Math.abs(current - target) < 0.01 && Math.abs(velocity) < 0.01) {
        current = target;
        velocity = 0;
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
/*  Item springs — created per item, animated by parent               */
/* ------------------------------------------------------------------ */

type ItemSprings = {
  sW: Spring;
  sH: Spring;
  sIW: Spring;
  sIH: Spring;
  wrapRef?: HTMLDivElement;
  iconRef?: HTMLDivElement;
};

/* ------------------------------------------------------------------ */
/*  DockItem — rendering only, no rAF                                 */
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
      class={twMerge(
        "relative flex items-center justify-center rounded-full bg-base-200 transition-opacity duration-150 hover:opacity-100 active:opacity-60",
        "opacity-80",
        cfg.itemClass,
      )}
      style={{ width: `${cfg.baseSize}px`, height: `${cfg.baseSize}px` }}
    >
      <Show when={hovered()}>
        <Portal>
          <div
            class={twMerge(
              "fixed w-fit rounded-md border border-base-300 bg-base-100 px-2 py-0.5 text-xs whitespace-pre text-base-content animate-fade-in z-[9999] pointer-events-none",
              cfg.tooltipClass,
            )}
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
      <div ref={iconRef} class="flex items-center justify-center shrink-0">
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
/*  Desktop dock — single rAF loop, batched reads/writes              */
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

  // Per-item spring state — indexed by order
  const itemSprings: ItemSprings[] = [];

  let rafId: number | undefined;
  let prevTime = 0;
  let lastMousePos = Infinity;
  let loopRunning = false;
  let anchorCenters: number[] = [];

  /** Snapshot centres on mouse-enter. With transform-based scaling
   *  layout never changes, so centres are always stable — no snap needed. */
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

    // Recompute targets only when mouse position actually changed
    if (mp !== lastMousePos) {
      lastMousePos = mp;

      // Use anchored centres (captured on mouse-enter) so that
      // mid-animation size changes don't shift distance targets.
      for (let i = 0; i < itemSprings.length; i++) {
        const s = itemSprings[i];
        if (!s.wrapRef || anchorCenters[i] === undefined) continue;
        const dist = Math.abs(mp - anchorCenters[i]);
        const ts = mp === Infinity ? cfg.baseSize : mapRange(dist, 0, cfg.magnifyRange, cfg.hoverSize, cfg.baseSize);
        const ti = mp === Infinity ? cfg.iconSize : mapRange(dist, 0, cfg.magnifyRange, cfg.hoverIconSize, cfg.iconSize);
        s.sW.set(ts); s.sH.set(ts);
        s.sIW.set(ti); s.sIH.set(ti);
      }
    }

    // Step all springs
    let allSettled = true;
    for (let i = 0; i < itemSprings.length; i++) {
      const s = itemSprings[i];
      s.sW.step(dt); s.sH.step(dt); s.sIW.step(dt); s.sIH.step(dt);
      if (allSettled && !(s.sW.settled() && s.sH.settled() && s.sIW.settled() && s.sIH.settled())) {
        allSettled = false;
      }
    }

    // BATCH WRITE: transform-based scaling — no layout changes,
    // container stays stable, items scale in place.
    const maxScale = cfg.hoverSize / cfg.baseSize;
    const maxIconScale = cfg.hoverIconSize / cfg.iconSize;
    for (let i = 0; i < itemSprings.length; i++) {
      const s = itemSprings[i];
      if (s.wrapRef) {
        const scale = Math.max(0.8, Math.min(s.sW.get() / cfg.baseSize, maxScale));
        s.wrapRef.style.transform = `scale(${scale})`;
      }
      if (s.iconRef) {
        const iconScale = Math.max(0.8, Math.min(s.sIW.get() / cfg.iconSize, maxIconScale));
        s.iconRef.style.transform = `scale(${iconScale})`;
      }
    }

    if (allSettled) {
      stopLoop();
      return;
    }

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
        "mx-auto flex overflow-visible",
        "items-center",
        props.showContainer && "rounded-2xl bg-base-100 shadow-[0px_1px_0px_0px_var(--color-base-300)_inset,0px_1px_0px_0px_var(--color-base-100)]",
        isH() && props.showContainer && "px-4 py-2",
        !isH() && props.showContainer && "py-4 px-2",
        props.class,
      )}
      style={{
        "flex-direction": isH() ? "row" : "column",
        gap: `${cfg.gap}px`,
        ...(isH() ? { height: `${cfg.baseSize + 16}px` } : { width: `${cfg.baseSize + 16}px` }),
      }}
    >
      <For each={props.items}>
        {(item, idx) => {
          // Create springs for this item
          const springs: ItemSprings = {
            sW: createSpring(cfg.baseSize, cfg.springOpts),
            sH: createSpring(cfg.baseSize, cfg.springOpts),
            sIW: createSpring(cfg.iconSize, cfg.springOpts),
            sIH: createSpring(cfg.iconSize, cfg.springOpts),
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

const MOBILE_POPUP: Record<FloatingDockDirection, string> = {
  top: "absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2",
  bottom: "absolute inset-x-0 top-full mt-2 flex flex-col gap-2",
  left: "absolute right-full top-0 mr-2 flex flex-col gap-2",
  right: "absolute left-full top-0 ml-2 flex flex-col gap-2",
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
    <div class={twMerge("relative block md:hidden", props.class)}>
      <Show when={open()}>
        <div class={MOBILE_POPUP[props.popupDirection]}>
          <For each={props.items}>
            {(item, idx) => (
              <div
                class="animate-fade-in"
                style={{
                  "animation-delay": `${(props.items.length - 1 - idx()) * 0.05}s`,
                  "animation-fill-mode": "backwards",
                }}
              >
                <Show
                  when={item.onClick}
                  fallback={
                    <Show
                      when={item.href}
                      fallback={
                        <div class="flex items-center justify-center rounded-full bg-base-100" style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }} title={item.title}>
                          {item.icon}
                        </div>
                      }
                    >
                      <a href={item.href} class="flex items-center justify-center rounded-full bg-base-100" style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }} title={item.title}>
                        {item.icon}
                      </a>
                    </Show>
                  }
                >
                  <button type="button" onClick={(e) => handleItemClick(item, e)} class="flex items-center justify-center rounded-full bg-base-100 cursor-pointer border-0 p-0" style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }} title={item.title}>
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
        class="flex items-center justify-center rounded-full bg-base-200 cursor-pointer border-0 p-0"
        style={{ width: `${props.cfg.baseSize}px`, height: `${props.cfg.baseSize}px` }}
      >
        {props.toggleIcon ?? (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-base-content/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
    "magnify", "showDesktop", "showMobile", "showContainer",
    "desktopClass", "mobileClass", "itemClass", "tooltipClass", "mobileToggleIcon",
    "springMass", "springStiffness", "springDamping",
    "class", "className", "dataTheme", "style",
  ]);

  const cfg = (): ResolvedConfig => ({
    baseSize: local.baseSize ?? 40,
    hoverSize: local.hoverSize ?? 80,
    iconSize: local.iconSize ?? 20,
    hoverIconSize: local.hoverIconSize ?? 40,
    magnifyRange: local.magnifyRange ?? 150,
    magnify: local.magnify !== false,
    gap: local.gap ?? 16,
    tooltipDir: local.tooltipDirection ?? "top",
    orientation: local.orientation ?? "horizontal",
    itemClass: local.itemClass,
    tooltipClass: local.tooltipClass,
    springOpts: {
      mass: local.springMass ?? 0.1,
      stiffness: local.springStiffness ?? 150,
      damping: local.springDamping ?? 12,
    },
  });

  return (
    <div data-theme={local.dataTheme} style={local.style} {...others}>
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

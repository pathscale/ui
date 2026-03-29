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
    step(dt: number) {
      const force = -stiffness * (current - target);
      const accel = (force - damping * velocity) / mass;
      velocity += accel * dt;
      current += velocity * dt;
      // Clamp to prevent runaway accumulation
      if (Math.abs(current - target) < 0.01 && Math.abs(velocity) < 0.01) {
        current = target;
        velocity = 0;
      }
    },
  };
}

function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/* ------------------------------------------------------------------ */
/*  Tooltip positions                                                 */
/* ------------------------------------------------------------------ */

const TOOLTIP_POS: Record<FloatingDockDirection, string> = {
  top: "absolute -top-8 left-1/2 -translate-x-1/2",
  bottom: "absolute -bottom-8 left-1/2 -translate-x-1/2",
  left: "absolute top-1/2 -translate-y-1/2 right-full mr-2",
  right: "absolute top-1/2 -translate-y-1/2 left-full ml-2",
};

/* ------------------------------------------------------------------ */
/*  DockItem — width/height spring, targets update only on mousemove  */
/* ------------------------------------------------------------------ */

const DockItem: Component<{
  item: FloatingDockItem;
  mousePos: () => number;
  cfg: ResolvedConfig;
}> = (props) => {
  let wrapRef: HTMLDivElement | undefined;
  let iconRef: HTMLDivElement | undefined;

  const [hovered, setHovered] = createSignal(false);
  const cfg = props.cfg;

  const sW = createSpring(cfg.baseSize, cfg.springOpts);
  const sH = createSpring(cfg.baseSize, cfg.springOpts);
  const sIW = createSpring(cfg.iconSize, cfg.springOpts);
  const sIH = createSpring(cfg.iconSize, cfg.springOpts);

  let rafId: number | undefined;
  let prevTime = 0;
  let lastMousePos = Infinity;

  onMount(() => {
    if (!cfg.magnify) return;

    const tick = (time: number) => {
      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 1 / 60;
      prevTime = time;

      // Only recalculate targets when mouse position actually changed
      // This prevents the feedback loop: animated size → shifted center → new target → oscillation
      const mp = props.mousePos();
      if (mp !== lastMousePos) {
        lastMousePos = mp;
        if (wrapRef) {
          const b = wrapRef.getBoundingClientRect();
          const isH = cfg.orientation === "horizontal";
          const center = isH ? b.x + b.width / 2 : b.y + b.height / 2;
          const dist = Math.abs(mp - center);

          const ts = mp === Infinity ? cfg.baseSize : mapRange(dist, 0, cfg.magnifyRange, cfg.hoverSize, cfg.baseSize);
          const ti = mp === Infinity ? cfg.iconSize : mapRange(dist, 0, cfg.magnifyRange, cfg.hoverIconSize, cfg.iconSize);

          sW.set(ts); sH.set(ts);
          sIW.set(ti); sIH.set(ti);
        }
      }

      sW.step(dt); sH.step(dt); sIW.step(dt); sIH.step(dt);

      if (wrapRef) {
        wrapRef.style.width = `${sW.get()}px`;
        wrapRef.style.height = `${sH.get()}px`;
      }
      if (iconRef) {
        iconRef.style.width = `${sIW.get()}px`;
        iconRef.style.height = `${sIH.get()}px`;
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
  });

  onCleanup(() => { if (rafId !== undefined) cancelAnimationFrame(rafId); });

  const handleClick = (e: MouseEvent) => {
    if (props.item.onClick) { e.preventDefault(); props.item.onClick(e); }
  };

  const inner = (
    <div
      ref={wrapRef}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      class={twMerge(
        "relative flex items-center justify-center rounded-full bg-base-200 transition-[opacity,transform] duration-150 hover:opacity-100 active:scale-90 active:duration-75",
        "opacity-80",
        cfg.itemClass,
      )}
      style={{ width: `${cfg.baseSize}px`, height: `${cfg.baseSize}px` }}
    >
      <Show when={hovered()}>
        <div class={twMerge(
          TOOLTIP_POS[cfg.tooltipDir],
          "w-fit rounded-md border border-base-300 bg-base-100 px-2 py-0.5 text-xs whitespace-pre text-base-content animate-fade-in z-50",
          cfg.tooltipClass,
        )}>
          {props.item.title}
        </div>
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
          <a href={props.item.href}>{inner}</a>
        </Show>
      }
    >
      <button type="button" onClick={handleClick} class="appearance-none bg-transparent border-0 p-0 cursor-pointer">
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

  return (
    <div
      onMouseMove={(e) => setMousePos(isH() ? e.clientX : e.clientY)}
      onMouseLeave={() => setMousePos(Infinity)}
      class={twMerge(
        "mx-auto",
        "items-center",
        props.showContainer && "rounded-2xl bg-base-100 shadow-[0px_1px_0px_0px_var(--color-base-300)_inset,0px_1px_0px_0px_var(--color-base-100)]",
        isH() && props.showContainer && "px-4 py-2",
        !isH() && props.showContainer && "py-4 px-2",
        props.class,
      )}
      style={{
        display: "flex",
        "flex-direction": isH() ? "row" : "column",
        gap: `${props.cfg.gap}px`,
        ...(isH() ? { height: `${props.cfg.baseSize + 16}px` } : { width: `${props.cfg.baseSize + 16}px` }),
        overflow: "visible",
      }}
    >
      <For each={props.items}>
        {(item) => <DockItem item={item} mousePos={mousePos} cfg={props.cfg} />}
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
    <div data-theme={local.dataTheme} {...others}>
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

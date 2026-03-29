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
  title: string;
  icon: JSX.Element;
  href: string;
};

export type FloatingDockProps = {
  items: FloatingDockItem[];
  /** Classes applied to the desktop dock container. */
  desktopClass?: string;
  /** Classes applied to the mobile dock container. */
  mobileClass?: string;
  /** Icon shown in the mobile toggle button (defaults to ☰). */
  mobileToggleIcon?: JSX.Element;
} & IComponentBaseProps;

/* ------------------------------------------------------------------ */
/*  Spring with mass (matches motion/react useSpring)                 */
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
      const dampForce = -damping * velocity;
      const accel = (force + dampForce) / mass;
      velocity += accel * dt;
      current += velocity * dt;
    },
    settled() {
      return Math.abs(current - target) < 0.5 && Math.abs(velocity) < 0.5;
    },
  };
}

/** Map a value from an input range to an output range (clamped). */
function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number,
): number {
  const t = Math.max(0, Math.min(1, (value - inMin) / (inMax - inMin)));
  return outMin + t * (outMax - outMin);
}

/* ------------------------------------------------------------------ */
/*  IconContainer — single dock icon with spring magnification        */
/* ------------------------------------------------------------------ */

const SPRING_OPTS = { mass: 0.1, stiffness: 150, damping: 12 };

const IconContainer: Component<{
  item: FloatingDockItem;
  mouseX: () => number;
}> = (props) => {
  let ref: HTMLDivElement | undefined;
  let iconRef: HTMLDivElement | undefined;

  const [hovered, setHovered] = createSignal(false);

  const sWidth = createSpring(40, SPRING_OPTS);
  const sHeight = createSpring(40, SPRING_OPTS);
  const sIconW = createSpring(20, SPRING_OPTS);
  const sIconH = createSpring(20, SPRING_OPTS);

  let rafId: number | undefined;
  let prevTime = 0;

  onMount(() => {
    const tick = (time: number) => {
      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 1 / 60;
      prevTime = time;

      // Compute distance from mouse to icon center
      const mx = props.mouseX();
      if (ref) {
        const bounds = ref.getBoundingClientRect();
        const center = bounds.x + bounds.width / 2;
        const dist = mx - center;

        // Map distance → target sizes  [-150..0..150] → [40..80..40]
        const targetSize = mx === Infinity ? 40 : mapRange(Math.abs(dist), 0, 150, 80, 40);
        const targetIcon = mx === Infinity ? 20 : mapRange(Math.abs(dist), 0, 150, 40, 20);

        sWidth.set(targetSize);
        sHeight.set(targetSize);
        sIconW.set(targetIcon);
        sIconH.set(targetIcon);
      }

      sWidth.step(dt);
      sHeight.step(dt);
      sIconW.step(dt);
      sIconH.step(dt);

      // Apply sizes directly to DOM
      if (ref) {
        ref.style.width = `${sWidth.get()}px`;
        ref.style.height = `${sHeight.get()}px`;
      }
      if (iconRef) {
        iconRef.style.width = `${sIconW.get()}px`;
        iconRef.style.height = `${sIconH.get()}px`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });

  onCleanup(() => {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
  });

  return (
    <a href={props.item.href}>
      <div
        ref={ref}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        class="relative flex aspect-square items-center justify-center rounded-full bg-base-200"
        style={{ width: "40px", height: "40px" }}
      >
        {/* Tooltip */}
        <Show when={hovered()}>
          <div
            class="absolute -top-8 left-1/2 w-fit -translate-x-1/2 rounded-md border border-base-300 bg-base-100 px-2 py-0.5 text-xs whitespace-pre text-base-content animate-fade-in"
          >
            {props.item.title}
          </div>
        </Show>

        {/* Icon */}
        <div
          ref={iconRef}
          class="flex items-center justify-center"
          style={{ width: "20px", height: "20px" }}
        >
          {props.item.icon}
        </div>
      </div>
    </a>
  );
};

/* ------------------------------------------------------------------ */
/*  Desktop dock                                                      */
/* ------------------------------------------------------------------ */

const FloatingDockDesktop: Component<{
  items: FloatingDockItem[];
  class?: string;
}> = (props) => {
  const [mouseX, setMouseX] = createSignal(Infinity);

  return (
    <div
      onMouseMove={(e) => setMouseX(e.pageX)}
      onMouseLeave={() => setMouseX(Infinity)}
      class={twMerge(
        "mx-auto hidden h-16 items-end gap-4 rounded-2xl bg-base-100 px-4 pb-3 md:flex",
        "shadow-[0px_1px_0px_0px_var(--color-base-300)_inset,0px_1px_0px_0px_var(--color-base-100)]",
        props.class,
      )}
    >
      <For each={props.items}>
        {(item) => <IconContainer item={item} mouseX={mouseX} />}
      </For>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Mobile dock                                                       */
/* ------------------------------------------------------------------ */

const FloatingDockMobile: Component<{
  items: FloatingDockItem[];
  class?: string;
  toggleIcon?: JSX.Element;
}> = (props) => {
  const [open, setOpen] = createSignal(false);

  return (
    <div class={twMerge("relative block md:hidden", props.class)}>
      <Show when={open()}>
        <div class="absolute inset-x-0 bottom-full mb-2 flex flex-col gap-2">
          <For each={props.items}>
            {(item, idx) => (
              <div
                class="animate-fade-in"
                style={{
                  "animation-delay": `${(props.items.length - 1 - idx()) * 0.05}s`,
                  "animation-fill-mode": "backwards",
                }}
              >
                <a
                  href={item.href}
                  class="flex h-10 w-10 items-center justify-center rounded-full bg-base-100"
                >
                  <div class="h-4 w-4">{item.icon}</div>
                </a>
              </div>
            )}
          </For>
        </div>
      </Show>
      <button
        onClick={() => setOpen(!open())}
        class="flex h-10 w-10 items-center justify-center rounded-full bg-base-200"
      >
        {props.toggleIcon ?? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-base-content/60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M4 6h16" />
            <path d="M4 12h16" />
            <path d="M4 18h16" />
          </svg>
        )}
      </button>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main component                                                    */
/* ------------------------------------------------------------------ */

const FloatingDock = (rawProps: FloatingDockProps): JSX.Element => {
  const [local, others] = splitProps(rawProps, [
    "items",
    "desktopClass",
    "mobileClass",
    "mobileToggleIcon",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  return (
    <div data-theme={local.dataTheme} {...others}>
      <FloatingDockDesktop
        items={local.items}
        class={twMerge(local.class, local.className, local.desktopClass)}
      />
      <FloatingDockMobile
        items={local.items}
        class={local.mobileClass}
        toggleIcon={local.mobileToggleIcon}
      />
    </div>
  );
};

export default FloatingDock;

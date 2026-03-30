import { type JSX, onCleanup, onMount, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

export type NoiseBackgroundProps = {
  children?: JSX.Element;
  /** Additional CSS classes for the outer container. */
  containerClass?: string;
  /** Gradient blob colors (provide 2–3). */
  gradientColors?: string[];
  /** Noise texture opacity (0–1). @default 0.2 */
  noiseIntensity?: number;
  /** Animation velocity multiplier. @default 0.1 */
  speed?: number;
  /** Apply a backdrop-blur over the gradient layers. @default false */
  backdropBlur?: boolean;
  /** Enable/disable the wandering animation. @default true */
  animating?: boolean;
  /** CSS border-radius value. @default "var(--radius-box, 1rem)" */
  borderRadius?: string;
  /** Path or URL to the noise texture image. @default "/noise.webp" */
  noiseSrc?: string;
} & IComponentBaseProps;

/* ------------------------------------------------------------------ */
/*  Damped spring (matches motion/react useSpring stiffness/damping)  */
/* ------------------------------------------------------------------ */

function createSpring(initial: number, stiffness = 100, damping = 30) {
  let current = initial;
  let velocity = 0;
  let target = initial;
  return {
    set(v: number) { target = v; },
    get() { return current; },
    step(dt: number) {
      velocity += (-stiffness * (current - target) - damping * velocity) * dt;
      current += velocity * dt;
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

const NoiseBackground = (rawProps: NoiseBackgroundProps): JSX.Element => {
  const [local, others] = splitProps(rawProps, [
    "children",
    "class",
    "className",
    "containerClass",
    "gradientColors",
    "noiseIntensity",
    "speed",
    "backdropBlur",
    "animating",
    "borderRadius",
    "noiseSrc",
    "dataTheme",
    "style",
  ]);

  let containerRef: HTMLDivElement | undefined;
  let layer0: HTMLDivElement | undefined;
  let layer1: HTMLDivElement | undefined;
  let layer2: HTMLDivElement | undefined;
  let stripEl: HTMLDivElement | undefined;

  const colors = () =>
    local.gradientColors ?? [
      "rgb(255, 100, 150)",
      "rgb(100, 150, 255)",
      "rgb(255, 200, 100)",
    ];
  const noiseIntensity = () => local.noiseIntensity ?? 0.2;
  const speed = () => local.speed ?? 0.1;
  const animating = () => local.animating ?? true;
  const borderRadius = () => local.borderRadius ?? "var(--radius-box, 1rem)";

  const springX = createSpring(0);
  const springY = createSpring(0);

  let vx = 0;
  let vy = 0;
  let lastDirectionChange = 0;
  let prevTime = 0;
  let rafId: number | undefined;

  const randomVelocity = () => {
    const angle = Math.random() * Math.PI * 2;
    const mag = speed() * (0.5 + Math.random() * 0.5);
    return { x: Math.cos(angle) * mag, y: Math.sin(angle) * mag };
  };

  onMount(() => {
    if (!containerRef) return;
    const initRect = containerRef.getBoundingClientRect();
    const cx = initRect.width / 2;
    const cy = initRect.height / 2;
    springX.set(cx);
    springY.set(cy);
    for (let i = 0; i < 60; i++) { springX.step(1 / 60); springY.step(1 / 60); }

    const v = randomVelocity();
    vx = v.x;
    vy = v.y;

    let rawX = cx;
    let rawY = cy;
    let w = initRect.width;
    let h = initRect.height;

    const tick = (time: number) => {
      if (!containerRef) { rafId = requestAnimationFrame(tick); return; }

      const dt = prevTime ? Math.min((time - prevTime) / 1000, 0.05) : 1 / 60;
      prevTime = time;

      if (animating()) {
        const rect = containerRef.getBoundingClientRect();
        w = rect.width;
        h = rect.height;
        const padding = 20;

        if (time - lastDirectionChange > 1500 + Math.random() * 1500) {
          const nv = randomVelocity();
          vx = nv.x; vy = nv.y;
          lastDirectionChange = time;
        }

        const frameDt = 16;
        let nx = rawX + vx * frameDt;
        let ny = rawY + vy * frameDt;

        if (nx < padding || nx > w - padding || ny < padding || ny > h - padding) {
          const nv = randomVelocity();
          vx = nv.x; vy = nv.y;
          lastDirectionChange = time;
          nx = Math.max(padding, Math.min(w - padding, nx));
          ny = Math.max(padding, Math.min(h - padding, ny));
        }

        rawX = nx;
        rawY = ny;
        springX.set(rawX);
        springY.set(rawY);
      }

      springX.step(dt);
      springY.step(dt);

      const sx = springX.get();
      const sy = springY.get();
      const c = colors();

      // Radius = 1.5× longest side so the 50% fade-stop always reaches
      // the opposite edge — works for both tiny buttons and large cards.
      const radius = Math.max(w, h) * 1.5;

      // Parallax offsets relative to container center so layers spread
      // evenly in all directions (not biased toward top-left).
      const hw = w / 2;
      const hh = h / 2;
      const lx = (m: number) => hw + (sx - hw) * m;
      const ly = (m: number) => hh + (sy - hh) * m;

      if (layer0) {
        layer0.style.background =
          `radial-gradient(${radius}px circle at ${sx}px ${sy}px, ${c[0]} 0%, transparent 50%)`;
      }
      if (layer1) {
        layer1.style.background =
          `radial-gradient(${radius}px circle at ${lx(0.7)}px ${ly(0.7)}px, ${c[1]} 0%, transparent 50%)`;
      }
      if (layer2) {
        layer2.style.background =
          `radial-gradient(${radius}px circle at ${lx(1.3)}px ${ly(1.3)}px, ${c[2] || c[0]} 0%, transparent 50%)`;
      }
      if (stripEl) {
        stripEl.style.transform = animating()
          ? `translateX(${sx * 0.1 - 50}px)`
          : "none";
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
  });

  onCleanup(() => {
    if (rafId !== undefined) cancelAnimationFrame(rafId);
  });

  const containerClasses = () =>
    twMerge(
      "group relative overflow-hidden bg-base-200 backdrop-blur-sm",
      "shadow-[0px_1px_0px_0px_var(--color-base-300)_inset,0px_1px_0px_0px_var(--color-base-100)]",
      local.containerClass,
    );

  const contentClasses = () =>
    twMerge("relative z-10", local.class, local.className);

  return (
    <div
      ref={containerRef}
      class={containerClasses()}
      style={{
        "--noise-opacity": noiseIntensity(),
        "border-radius": borderRadius(),
        ...(typeof local.style === "object" ? local.style : {}),
      }}
      classList={{
        "after:absolute after:inset-0 after:h-full after:w-full after:backdrop-blur-lg after:content-['']":
          local.backdropBlur ?? false,
      }}
      data-theme={local.dataTheme}
      {...others}
    >
      {/* Moving gradient layers */}
      <div ref={layer0} class="absolute inset-0 opacity-40" />
      <div ref={layer1} class="absolute inset-0 opacity-30" />
      <div ref={layer2} class="absolute inset-0 opacity-25" />

      {/* Top gradient strip */}
      <div
        ref={stripEl}
        class="absolute inset-x-0 top-0 h-1 opacity-80 blur-sm"
        style={{
          background: `linear-gradient(to right, ${colors().join(", ")})`,
          "border-radius": `${borderRadius()} ${borderRadius()} 0 0`,
        }}
      />

      {/* Static noise pattern */}
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={local.noiseSrc ?? "/noise.webp"}
          alt=""
          class="h-full w-full object-cover"
          style={{
            opacity: `var(--noise-opacity, 0.2)`,
            "mix-blend-mode": "overlay",
          }}
        />
      </div>

      {/* Content */}
      <div class={contentClasses()}>{local.children}</div>
    </div>
  );
};

export default NoiseBackground;

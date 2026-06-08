import "./MetalBorder.css";
import { createEffect, createSignal, onCleanup, onMount, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import { prefersReducedMotion } from "../../motion/reduced-motion";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./MetalBorder.classes";
import {
  createInstance,
  destroyInstance,
  injectGlow,
  registerGlowInstance,
  resizeGlow,
  setGlowCallback,
  setInstanceVisible,
  type GlowHandles,
  type MetalFxInstance,
  type PresetName,
  type PresetTheme,
  unregisterGlowInstance,
  updateGlow,
  updateInstance,
} from "./engine";

export type MetalBorderPreset = PresetName;
export type MetalBorderKind = "pill" | "circle";
export type MetalBorderTheme = PresetTheme | "auto";
export type MetalBorderResolvedTheme = PresetTheme;

export type MetalBorderProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children?: JSX.Element;
    preset?: MetalBorderPreset;
    strength?: number;
    kind?: MetalBorderKind;
    glow?: boolean;
    paused?: boolean;
    theme?: MetalBorderTheme;
    cornerRadius?: number | string;
    contentClass?: string;
  };

const DEFAULT_PRESET: MetalBorderPreset = "silver";
const DEFAULT_STRENGTH = 90;
const DEFAULT_KIND: MetalBorderKind = "pill";
const DEFAULT_THEME: MetalBorderTheme = "auto";

const clampStrength = (value?: number) => {
  if (typeof value !== "number" || Number.isNaN(value)) return DEFAULT_STRENGTH / 100;
  return Math.min(100, Math.max(0, value)) / 100;
};

const toRadiusCssValue = (value?: number | string) => {
  if (typeof value === "number") return `${value}px`;
  return value;
};

const readRadiusPx = (element: HTMLElement | undefined) => {
  if (!element || typeof window === "undefined") return 0;

  const computed = window.getComputedStyle(element);
  const candidates = [
    computed.borderTopLeftRadius,
    computed.borderTopRightRadius,
    computed.borderBottomRightRadius,
    computed.borderBottomLeftRadius,
    computed.borderRadius,
  ];

  for (const candidate of candidates) {
    const parsed = Number.parseFloat(candidate);
    if (Number.isFinite(parsed)) return parsed;
  }

  return 0;
};

const resolveThemeValue = (
  explicitTheme: MetalBorderTheme,
  dataTheme: string | undefined,
  host: HTMLDivElement | undefined,
) => {
  if (explicitTheme === "dark" || explicitTheme === "light") return explicitTheme;
  if (dataTheme === "dark" || dataTheme === "light") return dataTheme;

  const themeRoot =
    host?.closest("[data-theme]") ??
    document.documentElement;
  const themeAttr = themeRoot?.getAttribute("data-theme")?.toLowerCase();
  if (themeAttr?.includes("light")) return "light";
  if (themeAttr?.includes("dark")) return "dark";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
};

const getGlowOptions = (
  host: HTMLDivElement | undefined,
  kind: MetalBorderKind,
  cornerRadius: number,
) => {
  const rect = host?.getBoundingClientRect();
  return {
    width: Math.max(1, Math.round(rect?.width ?? 1)),
    height: Math.max(1, Math.round(rect?.height ?? 1)),
    cornerRadius,
    kind,
  };
};

const glowMap = new Map<MetalFxInstance, { handles: GlowHandles; theme: PresetTheme }>();
let glowCallbackSet = false;

const ensureGlowCallback = () => {
  if (glowCallbackSet) return;
  glowCallbackSet = true;
  setGlowCallback((instance, nowMs) => {
    const entry = glowMap.get(instance);
    if (entry) updateGlow(entry.handles, instance, nowMs, instance.opacityMul, entry.theme);
  });
};

export default function MetalBorder(props: MetalBorderProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "contentClass",
    "dataTheme",
    "style",
    "preset",
    "strength",
    "kind",
    "glow",
    "paused",
    "theme",
    "cornerRadius",
    "ref",
  ]);

  let hostRef: HTMLDivElement | undefined;
  let contentRef: HTMLDivElement | undefined;
  let canvasRef: HTMLCanvasElement | undefined;
  let glowRef: HTMLDivElement | undefined;
  let instance: MetalFxInstance | null = null;
  let glowHandles: GlowHandles | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let intersectionObserver: IntersectionObserver | null = null;
  let mutationObserver: MutationObserver | null = null;
  let mediaQueryList: MediaQueryList | null = null;
  let resizeRaf = 0;

  const [resolvedTheme, setResolvedTheme] =
    createSignal<MetalBorderResolvedTheme>("dark");
  const [prefersReduced, setPrefersReduced] = createSignal(false);
  const [isWebGlUnavailable, setIsWebGlUnavailable] = createSignal(false);

  const preset = () => local.preset ?? DEFAULT_PRESET;
  const kind = () => local.kind ?? DEFAULT_KIND;
  const theme = () => local.theme ?? DEFAULT_THEME;
  const strength = () => clampStrength(local.strength);
  const glow = () => local.glow ?? false;
  const effectivePaused = () => (local.paused ?? false) || prefersReduced();
  const radiusCssValue = () => toRadiusCssValue(local.cornerRadius);
  const effectEnabled = () => !isWebGlUnavailable();

  const syncResolvedTheme = () => {
    if (typeof window === "undefined") return;
    setResolvedTheme(resolveThemeValue(theme(), local.dataTheme, hostRef));
  };

  const readCornerRadius = () => {
    if (typeof local.cornerRadius === "number") return local.cornerRadius;
    if (typeof local.cornerRadius === "string") return readRadiusPx(hostRef);

    const firstChild = contentRef?.firstElementChild;
    return readRadiusPx(
      firstChild instanceof HTMLElement ? firstChild : hostRef,
    );
  };

  const syncInstanceGeometry = () => {
    if (!instance || !hostRef) return;
    updateInstance(instance, {
      cssWidth: Math.max(1, Math.round(hostRef.getBoundingClientRect().width)),
      cssHeight: Math.max(1, Math.round(hostRef.getBoundingClientRect().height)),
      cornerRadius: readCornerRadius(),
    });

    if (glowHandles && glowRef) {
      glowHandles = resizeGlow(glowHandles, glowRef, {
        ...getGlowOptions(hostRef, kind(), readCornerRadius()),
        scale: 1,
      });
      glowMap.set(instance, { handles: glowHandles, theme: resolvedTheme() });
    }
  };

  const attachGlow = () => {
    if (!instance || !glowRef || glowHandles || !glow()) return;
    ensureGlowCallback();
    glowHandles = injectGlow(glowRef, {
      ...getGlowOptions(hostRef, kind(), readCornerRadius()),
      scale: 1,
    });
    glowMap.set(instance, { handles: glowHandles, theme: resolvedTheme() });
    registerGlowInstance(instance);
  };

  const detachGlow = () => {
    if (!instance) return;
    unregisterGlowInstance(instance);
    glowMap.delete(instance);
    glowHandles = null;
    if (glowRef) glowRef.innerHTML = "";
  };

  onMount(() => {
    if (typeof window === "undefined") return;

    setPrefersReduced(prefersReducedMotion());
    syncResolvedTheme();

    mediaQueryList = window.matchMedia?.("(prefers-reduced-motion: reduce)") ?? null;
    const handleMotionChange = () => {
      setPrefersReduced(prefersReducedMotion());
    };
    mediaQueryList?.addEventListener?.("change", handleMotionChange);

    if (hostRef) {
      const themeRoot = hostRef.closest("[data-theme]") ?? document.documentElement;
      mutationObserver = new MutationObserver(() => {
        syncResolvedTheme();
      });
      mutationObserver.observe(themeRoot, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });
    }

    onCleanup(() => {
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      mutationObserver?.disconnect();
      mediaQueryList?.removeEventListener?.("change", handleMotionChange);
      if (resizeRaf !== 0) cancelAnimationFrame(resizeRaf);
      detachGlow();
      if (instance) destroyInstance(instance);
      instance = null;
    });

    if (!canvasRef || !hostRef) return;

    try {
      instance = createInstance({
        hostCanvas: canvasRef,
        cssWidth: Math.max(1, Math.round(hostRef.getBoundingClientRect().width)),
        cssHeight: Math.max(1, Math.round(hostRef.getBoundingClientRect().height)),
        cornerRadius: readCornerRadius(),
        kind: kind(),
        opacityMul: strength(),
        paused: effectivePaused(),
        presetName: preset(),
        presetTheme: resolvedTheme(),
      });
      setIsWebGlUnavailable(false);
    } catch {
      setIsWebGlUnavailable(true);
      return;
    }

    if (glow()) attachGlow();

    resizeObserver = new ResizeObserver(() => {
      if (resizeRaf !== 0) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = 0;
        syncResolvedTheme();
        syncInstanceGeometry();
      });
    });
    resizeObserver.observe(hostRef);

    if (typeof IntersectionObserver !== "undefined") {
      intersectionObserver = new IntersectionObserver(
        (entries) => {
          if (!instance) return;
          for (const entry of entries) {
            setInstanceVisible(instance, entry.isIntersecting);
          }
        },
        { rootMargin: "64px" },
      );
      intersectionObserver.observe(hostRef);
    }
  });

  createEffect(() => {
    syncResolvedTheme();
    if (!instance) return;
    updateInstance(instance, {
      presetName: preset(),
      presetTheme: resolvedTheme(),
    });
    if (glowHandles) glowMap.set(instance, { handles: glowHandles, theme: resolvedTheme() });
  });

  createEffect(() => {
    if (!instance) return;
    updateInstance(instance, { opacityMul: strength() });
  });

  createEffect(() => {
    if (!instance) return;
    updateInstance(instance, {
      kind: kind(),
      cornerRadius: readCornerRadius(),
    });
    if (glowHandles && glowRef) {
      glowHandles = resizeGlow(glowHandles, glowRef, {
        ...getGlowOptions(hostRef, kind(), readCornerRadius()),
        scale: 1,
      });
      glowMap.set(instance, { handles: glowHandles, theme: resolvedTheme() });
    }
  });

  createEffect(() => {
    if (!instance) return;
    updateInstance(instance, { paused: effectivePaused() });
  });

  createEffect(() => {
    if (!instance) return;
    if (glow()) attachGlow();
    else if (glowHandles) detachGlow();
  });

  return (
    <div
      {...others}
      ref={(element) => {
        hostRef = element;
        if (typeof local.ref === "function") local.ref(element);
      }}
      class={twMerge(
        CLASSES.Root.base,
        CLASSES.Root.kind[kind()],
        effectEnabled() && CLASSES.Root.flag.enabled,
        isWebGlUnavailable() && CLASSES.Root.flag.unavailable,
        effectivePaused() && CLASSES.Root.flag.paused,
        local.class,
        local.className,
      )}
      data-kind={kind()}
      data-preset={preset()}
      data-theme={local.dataTheme}
      style={{
        ...(local.style ?? {}),
        "--metal-border-radius": radiusCssValue(),
      }}
    >
      {effectEnabled() && (
        <div
          aria-hidden="true"
          class={CLASSES.Effect.base}
        >
          <canvas
            ref={canvasRef}
            class={CLASSES.Canvas.base}
          />
          <div
            ref={glowRef}
            class={CLASSES.Glow.base}
          />
        </div>
      )}
      <div
        ref={contentRef}
        class={twMerge(CLASSES.Content.base, local.contentClass)}
      >
        {local.children}
      </div>
    </div>
  );
}

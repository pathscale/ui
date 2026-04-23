import {
  createEffect,
  createSignal,
  onCleanup,
  type Accessor,
  type JSX,
} from "solid-js";

export type OverlayPlacement = "top" | "bottom" | "left" | "right";
export type OverlayAlign = "start" | "center" | "end";

type Rect = {
  top: number;
  left: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
};

export interface CreateOverlayPositionOptions {
  open: Accessor<boolean>;
  triggerRef: Accessor<HTMLElement | undefined>;
  overlayRef: Accessor<HTMLElement | undefined>;
  placement: Accessor<OverlayPlacement>;
  offset: Accessor<number>;
  autoFlip?: Accessor<boolean>;
  align?: Accessor<OverlayAlign>;
  matchTriggerWidth?: Accessor<boolean>;
  minWidth?: Accessor<number | undefined>;
  viewportPadding?: Accessor<number>;
}

const oppositePlacement: Record<OverlayPlacement, OverlayPlacement> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};

const clamp = (value: number, min: number, max: number) => {
  if (max < min) return min;
  return Math.min(Math.max(value, min), max);
};

const getMainAxisSize = (placement: OverlayPlacement, rect: Rect) =>
  placement === "top" || placement === "bottom" ? rect.height : rect.width;

const getAvailableSpace = (
  rect: Rect,
  viewportWidth: number,
  viewportHeight: number,
  padding: number,
) => ({
  top: rect.top - padding,
  bottom: viewportHeight - rect.bottom - padding,
  left: rect.left - padding,
  right: viewportWidth - rect.right - padding,
});

const resolvePlacement = (
  preferred: OverlayPlacement,
  triggerRect: Rect,
  overlayRect: Rect,
  viewportWidth: number,
  viewportHeight: number,
  padding: number,
  offset: number,
  autoFlip: boolean,
) => {
  if (!autoFlip) return preferred;

  const available = getAvailableSpace(
    triggerRect,
    viewportWidth,
    viewportHeight,
    padding,
  );
  const needed = getMainAxisSize(preferred, overlayRect) + offset;

  if (available[preferred] >= needed) return preferred;

  const opposite = oppositePlacement[preferred];
  return available[opposite] > available[preferred] ? opposite : preferred;
};

const getCrossAxisCoordinate = (
  align: OverlayAlign,
  triggerStart: number,
  triggerSize: number,
  overlaySize: number,
) => {
  if (align === "start") return triggerStart;
  if (align === "end") return triggerStart + triggerSize - overlaySize;
  return triggerStart + (triggerSize - overlaySize) / 2;
};

const round = (value: number) => Math.round(value * 100) / 100;

export const createOverlayPosition = (options: CreateOverlayPositionOptions) => {
  const [style, setStyle] = createSignal<JSX.CSSProperties>({
    visibility: "hidden",
  });
  const [resolvedPlacement, setResolvedPlacement] =
    createSignal<OverlayPlacement>(options.placement());

  createEffect(() => {
    if (!options.open()) {
      setResolvedPlacement(options.placement());
      setStyle({ visibility: "hidden" });
      return;
    }

    const trigger = options.triggerRef();
    const overlay = options.overlayRef();
    if (!trigger || !overlay) return;

    const viewportPadding = options.viewportPadding?.() ?? 8;
    const align = options.align?.() ?? "center";
    const autoFlip = options.autoFlip?.() ?? true;

    let frame = 0;

    const update = () => {
      const triggerRect = trigger.getBoundingClientRect();
      const overlayRect = overlay.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const offset = options.offset();

      const placement = resolvePlacement(
        options.placement(),
        triggerRect,
        overlayRect,
        viewportWidth,
        viewportHeight,
        viewportPadding,
        offset,
        autoFlip,
      );

      let top = 0;
      let left = 0;

      switch (placement) {
        case "top":
          top = triggerRect.top - overlayRect.height - offset;
          left = getCrossAxisCoordinate(
            align,
            triggerRect.left,
            triggerRect.width,
            overlayRect.width,
          );
          break;
        case "bottom":
          top = triggerRect.bottom + offset;
          left = getCrossAxisCoordinate(
            align,
            triggerRect.left,
            triggerRect.width,
            overlayRect.width,
          );
          break;
        case "left":
          top = getCrossAxisCoordinate(
            align,
            triggerRect.top,
            triggerRect.height,
            overlayRect.height,
          );
          left = triggerRect.left - overlayRect.width - offset;
          break;
        case "right":
          top = getCrossAxisCoordinate(
            align,
            triggerRect.top,
            triggerRect.height,
            overlayRect.height,
          );
          left = triggerRect.right + offset;
          break;
      }

      const maxTop = viewportHeight - overlayRect.height - viewportPadding;
      const maxLeft = viewportWidth - overlayRect.width - viewportPadding;

      setResolvedPlacement(placement);
      setStyle({
        position: "fixed",
        top: `${round(clamp(top, viewportPadding, maxTop))}px`,
        left: `${round(clamp(left, viewportPadding, maxLeft))}px`,
        "max-width": `${round(Math.max(0, viewportWidth - viewportPadding * 2))}px`,
        ...(options.matchTriggerWidth?.()
          ? {
              "min-width": `${round(
                Math.max(triggerRect.width, options.minWidth?.() ?? 0),
              )}px`,
            }
          : {}),
      });
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };

    schedule();

    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);

    const resizeObserver =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : undefined;

    resizeObserver?.observe(trigger);
    resizeObserver?.observe(overlay);

    onCleanup(() => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      resizeObserver?.disconnect();
    });
  });

  return {
    style,
    placement: resolvedPlacement,
  };
};

import {
  createEffect,
  createSignal,
  onCleanup,
  type Accessor,
  type JSX,
} from "solid-js";

export interface UseAnchoredOverlayPositionOptions {
  isOpen: Accessor<boolean>;
  getAnchor: Accessor<HTMLElement | undefined>;
  getOverlay: Accessor<HTMLElement | undefined>;
  offset?: number;
  viewportPadding?: number;
  align?: "start" | "end";
  width?: number | Accessor<number | undefined>;
  minWidth?: number | Accessor<number | undefined>;
  zIndex?: number;
}

const resolveNumber = (
  value: number | Accessor<number | undefined> | undefined,
): number | undefined => {
  if (typeof value === "function") {
    return (value as Accessor<number | undefined>)();
  }
  return value;
};

export const useAnchoredOverlayPosition = (
  options: UseAnchoredOverlayPositionOptions,
) => {
  const [style, setStyle] = createSignal<JSX.CSSProperties>({
    position: "fixed",
    top: "0px",
    left: "0px",
    "z-index": options.zIndex?.toString() ?? "1300",
  });

  const updatePosition = () => {
    const anchor = options.getAnchor();
    if (!anchor || typeof window === "undefined") return;

    const overlay = options.getOverlay();
    const offset = options.offset ?? 6;
    const viewportPadding = options.viewportPadding ?? 8;
    const rect = anchor.getBoundingClientRect();
    const desiredWidth = resolveNumber(options.width);
    const desiredMinWidth = resolveNumber(options.minWidth);
    const overlayRect = overlay?.getBoundingClientRect();
    const measuredWidth = desiredWidth ?? overlayRect?.width ?? 0;
    const measuredHeight = overlayRect?.height ?? 0;
    const widthForBounds = desiredWidth ?? desiredMinWidth ?? measuredWidth;

    let left =
      options.align === "start"
        ? rect.left
        : rect.right - widthForBounds;
    left = Math.max(
      viewportPadding,
      Math.min(left, window.innerWidth - widthForBounds - viewportPadding),
    );

    let top = rect.bottom + offset;
    if (measuredHeight > 0 && top + measuredHeight > window.innerHeight - viewportPadding) {
      const above = rect.top - measuredHeight - offset;
      if (above >= viewportPadding) {
        top = above;
      } else {
        top = Math.max(
          viewportPadding,
          window.innerHeight - measuredHeight - viewportPadding,
        );
      }
    }

    setStyle({
      position: "fixed",
      top: `${top}px`,
      left: `${left}px`,
      width: desiredWidth ? `${desiredWidth}px` : undefined,
      "min-width": desiredMinWidth ? `${desiredMinWidth}px` : undefined,
      "z-index": options.zIndex?.toString() ?? "1300",
    });
  };

  createEffect(() => {
    if (!options.isOpen()) return;

    requestAnimationFrame(() => {
      updatePosition();
      requestAnimationFrame(updatePosition);
    });

    const onViewportChange = () => updatePosition();
    window.addEventListener("resize", onViewportChange);
    window.addEventListener("scroll", onViewportChange, true);

    onCleanup(() => {
      window.removeEventListener("resize", onViewportChange);
      window.removeEventListener("scroll", onViewportChange, true);
    });
  });

  return {
    style,
    updatePosition,
  };
};

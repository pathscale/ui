import "./Skeleton.css";
import type { JSX } from "@solidjs/web";
import {Index, Show} from "solid-js";
import type { Radius, Size, UIBaseProps, Width } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { skeleton } from "./Skeleton.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type SkeletonShape = "line" | "circle" | "rect";
export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export type SkeletonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    shape?: SkeletonShape;
    /** Token, or a raw number of pixels for the cases a scale cannot cover. */
    width?: Width | number;
    height?: Size | number;
    size?: Size;
    radius?: Radius;
    animation?: SkeletonAnimation;
    /** Renders a stack of lines for a multi-line text placeholder. */
    lines?: number;
  };

/* -------------------------------------------------------------------------------------------------
 * Skeleton
 *
 * `lines` exists because a paragraph placeholder was the common case being
 * hand-built out of several bare skeletons and a wrapper. The last line is
 * short, which is what makes it read as text rather than as a block.
 * -----------------------------------------------------------------------------------------------*/
const px = (v: unknown) => (typeof v === "number" ? `${v}px` : undefined);

export const SkeletonLayout: Layout<typeof skeleton, SkeletonProps> = () => (
  <div
    {...slot.root}
    style={{
      ...(typeof local.style === "object" ? local.style : {}),
      width: px(local.width),
      height: px(local.height),
    }}
    aria-hidden="true"
  >
    <Show when={local.lines && local.lines > 1}>
      <Index each={Array.from({ length: local.lines ?? 0 })}>
        {(_, index) => (
          <span
            {...slot.line}
            data-last={index === (local.lines ?? 0) - 1 ? "true" : "false"}
          />
        )}
      </Index>
    </Show>
  </div>
);

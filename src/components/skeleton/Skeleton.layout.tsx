import "./Skeleton.css";
import type { JSX } from "solid-js";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { skeleton } from "./Skeleton.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export type SkeletonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    animationType?: SkeletonAnimation;
  };

/* -------------------------------------------------------------------------------------------------
 * Animation class map
 * -----------------------------------------------------------------------------------------------*/
/* -------------------------------------------------------------------------------------------------
 * Skeleton
 * -----------------------------------------------------------------------------------------------*/
export const SkeletonLayout: Layout<typeof skeleton, SkeletonProps> = () => (
  <div {...slot.root} style={style} />
);

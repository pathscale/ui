import "./Skeleton.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

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
const ANIMATION_CLASS_MAP: Record<SkeletonAnimation, string> = {
  shimmer: "skeleton--shimmer",
  pulse: "skeleton--pulse",
  none: "skeleton--none",
};

/* -------------------------------------------------------------------------------------------------
 * Skeleton
 * -----------------------------------------------------------------------------------------------*/
const Skeleton: Component<SkeletonProps> = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "animationType",
    "dataTheme",
    "style",
  ]);

  const animation = () => local.animationType ?? "shimmer";

  return (
    <div
      {...others}
      class={twMerge("skeleton", ANIMATION_CLASS_MAP[animation()], local.class, local.className)}
      data-slot="skeleton"
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

export default Skeleton;

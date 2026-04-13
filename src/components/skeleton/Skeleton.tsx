import "./Skeleton.css";
import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./Skeleton.classes";

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
      {...{ class: twMerge(CLASSES.base, CLASSES.animation[animation()], local.class, local.className) }}
      data-slot="skeleton"
      data-theme={local.dataTheme}
      style={local.style}
    />
  );
};

export default Skeleton;

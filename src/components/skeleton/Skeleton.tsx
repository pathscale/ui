import "./Skeleton.css";
import { type JSX, mergeProps } from "solid-js";
import { defineComponent } from "solid-layouts";
import type { IComponentBaseProps } from "../types";
import defaults from "./Skeleton.defaults";
import { skeleton } from "./Skeleton.recipe";

export type SkeletonAnimation = "shimmer" | "pulse" | "none";

export type SkeletonProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  IComponentBaseProps & {
    /**
     * The public prop is `animationType`; the recipe's axis is `animation`.
     * Kept as it was rather than renamed, because renaming is a breaking
     * change to every caller for a saving of four characters.
     */
    animationType?: SkeletonAnimation;
  };

/**
 * Built once, at module scope. Calling `defineComponent` inside the body would
 * build a new component on every render and throw away its state with it.
 */
const Base = defineComponent({
  recipe: skeleton,
  name: "Skeleton",
  defaults: defaults.Skeleton,
});

const Skeleton = ((props: SkeletonProps) =>
  // `mergeProps` rather than a spread: props are getters, and spreading reads
  // every one of them once at call time, so the component would never see a
  // later change.
  Base(
    mergeProps(props, {
      get animation() {
        return props.animationType;
      },
    }) as Record<string, unknown>,
  )) as (props: SkeletonProps) => JSX.Element;

export default Skeleton;
export { Skeleton };

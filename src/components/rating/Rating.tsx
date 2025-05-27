import {
  type Component,
  splitProps,
  type JSX,
  children as resolveChildren,
  For,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { ComponentSize, IComponentBaseProps } from "../types";
import RatingItem from "./RatingItem";

export type RatingProps = IComponentBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & {
    size?: ComponentSize;
    half?: boolean;
    hidden?: boolean;
    value: number;
    onChange?: (newRating: number) => void;
  };

const Rating: Component<RatingProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "class",
    "size",
    "half",
    "hidden",
    "dataTheme",
    "value",
    "onChange",
    "children",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const baseClass = twMerge(
    "rating",
    clsx(local.class, {
      "rating-xs": local.size === "xs",
      "rating-sm": local.size === "sm",
      "rating-md": local.size === "md",
      "rating-lg": local.size === "lg",
      "rating-half": local.half,
      "rating-hidden": local.hidden || local.value === 0,
    })
  );

  return (
    <div
      {...rest}
      aria-label="Rating"
      role="radiogroup"
      data-theme={local.dataTheme}
      class={baseClass}
    >
      {local.value === 0 && (
        <input type="checkbox" checked readOnly class="hidden" />
      )}

      <For each={resolvedChildren.toArray()}>
        {(child, index) => {
          const isChecked = local.value === index() + 1;
          const isReadOnly = local.onChange == null;

          return (
            <input
              type="checkbox"
              checked={isChecked}
              readOnly={isReadOnly}
              onChange={() => local.onChange?.(index() + 1)}
              class={(child as any)?.props?.class}
            />
          );
        }}
      </For>
    </div>
  );
};

export default Object.assign(Rating, { Item: RatingItem });

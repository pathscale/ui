import {
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

const Rating = (props: RatingProps) => {
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
      <For each={resolvedChildren.toArray()}>
        {(child, index) =>
          typeof child === "object" && child !== null && "props" in child
            ? {
                ...child,
                props: {
                  ...(typeof child.props === "object" && child.props !== null
                    ? child.props
                    : {}),
                  index: index(),
                  selected: local.value === index() + 1,
                  onSelect: () => local.onChange?.(index() + 1),
                },
              }
            : child
        }
      </For>
    </div>
  );
};

export default Object.assign(Rating, { Item: RatingItem });

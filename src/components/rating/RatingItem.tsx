import clsx from "clsx";
import { Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useRatingContext } from "./Rating";

export type RatingItemProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "value" | "type"
> & {
  value: number;
  mask?: "star" | "star-2" | "heart" | "circle" | "diamond" | "square";
  halfPosition?: 1 | 2;
  color?: string;
};

const RatingItem = (props: RatingItemProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "value",
    "mask",
    "halfPosition",
    "color",
    "aria-label",
  ]);

  const context = useRatingContext();

  const classes = twMerge(
    "mask",
    local.class,
    clsx({
      [`mask-${local.mask || "star"}`]: true,
      [`mask-half-${local.halfPosition}`]: context.half && local.halfPosition,
    }),
    local.color,
  );

  return (
    <Show
      when={!context.readonly}
      fallback={
        <div
          class={classes}
          aria-label={local["aria-label"]}
          style={{
            opacity:
              context.value !== undefined && local.value <= context.value
                ? 1
                : 0.2,
          }}
        />
      }
    >
      <input
        {...rest}
        type="radio"
        name={context.name}
        class={classes}
        checked={context.value === local.value}
        onChange={() => context.onChange?.(local.value)}
        aria-label={local["aria-label"]}
      />
    </Show>
  );
};

export default RatingItem;

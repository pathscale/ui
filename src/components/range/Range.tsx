import { splitProps, createMemo, JSX, Show, For } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";

export type ComponentColor =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning"
  | "error";

export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

export type RangeProps = Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "size"
> &
  IComponentBaseProps & {
    color?: ComponentColor;
    size?: ComponentSize;
    displayTicks?: boolean;
    ticksStep?: number;
  };

const Range = (props: RangeProps): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "class",
    "className",
    "color",
    "size",
    "step",
    "displayTicks",
    "ticksStep",
    "min",
    "max",
    "dataTheme",
  ]);

  const classes = createMemo(() =>
    twMerge(
      "range",
      local.class,
      local.className,
      clsx({
        "range-xs": local.size === "xs",
        "range-sm": local.size === "sm",
        "range-md": local.size === "md",
        "range-lg": local.size === "lg",
        "range-xl": local.size === "xl",
        "range-primary": local.color === "primary",
        "range-secondary": local.color === "secondary",
        "range-accent": local.color === "accent",
        "range-info": local.color === "info",
        "range-success": local.color === "success",
        "range-warning": local.color === "warning",
        "range-error": local.color === "error",
      })
    )
  );

  const ticks = createMemo(() => {
    const showTicks =
      local.displayTicks ?? (local.step !== undefined && local.step !== null);
    if (!showTicks) return [];

    const min = Number(local.min ?? 0);
    const max = Number(local.max ?? 100);
    const step = Number(local.ticksStep ?? local.step ?? 1);
    const count = Math.max(Math.ceil((max - min) / step), 1) + 1;

    return Array.from({ length: count });
  });

  return (
    <>
      <input
        {...rest}
        type="range"
        step={local.step}
        class={classes()}
        data-theme={local.dataTheme}
      />
      <Show when={ticks().length > 0}>
        <div class="relative mt-2 h-4 w-full max-w-xs">
          <div class="absolute inset-0 flex items-center justify-between px-2">
            <For each={ticks()}>
              {(_, i) => (
                <span
                  class="absolute text-xs"
                  style={{
                    left: `${(i() / (ticks().length - 1)) * 100}%`,
                    transform: "translateX(-50%)",
                  }}
                >
                  |
                </span>
              )}
            </For>
          </div>
        </div>
      </Show>
    </>
  );
};

export default Range;

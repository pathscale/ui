import { clsx } from "clsx";
import { Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Chip.css";
import { CLASSES } from "./Chip.classes";

type ChipVariant = "solid" | "flat" | "bordered";
type ChipColor = "default" | "primary" | "accent" | "success" | "warning" | "danger";
type ChipSize = "sm" | "md" | "lg";

interface ChipRootProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color" | "onRemove"> {
  class?: string;
  className?: string;
  children?: JSX.Element;
  variant?: ChipVariant;
  color?: ChipColor;
  size?: ChipSize;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  onRemove?: () => void;
  removeButtonLabel?: string;
  isDisabled?: boolean;
}

const ChipRoot = (props: ChipRootProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "variant",
    "color",
    "size",
    "startIcon",
    "endIcon",
    "onRemove",
    "removeButtonLabel",
    "isDisabled",
  ]);

  const classes = () => {
    const variant = local.variant ?? "solid";
    const color = local.color ?? "default";
    const size = local.size ?? "md";

    return twMerge(
      clsx(
        CLASSES.base,
        CLASSES.variant[variant],
        CLASSES.color[color],
        CLASSES.size[size],
        local.class,
        local.className,
      ),
    );
  };

  const chipChildren = () => {
    const c = local.children;
    if (typeof c === "string" || typeof c === "number") {
      return <ChipLabel>{c}</ChipLabel>;
    }
    return c;
  };

  const handleRemove = (event: MouseEvent) => {
    event.stopPropagation();
    local.onRemove?.();
  };

  return (
    <span
      {...others}
      class={classes()}
      data-slot="chip"
      data-disabled={local.isDisabled ? "true" : "false"}
      data-removable={local.onRemove ? "true" : "false"}
    >
      <Show when={local.startIcon}>
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart)} data-slot="chip-start-icon">
          {local.startIcon}
        </span>
      </Show>
      {chipChildren()}
      <Show when={local.onRemove && local.endIcon}>
        <button
          type="button"
          class={CLASSES.slot.remove}
          data-slot="chip-remove"
          aria-label={local.removeButtonLabel ?? "Remove"}
          onClick={handleRemove}
          disabled={Boolean(local.isDisabled)}
        >
          <Show when={local.endIcon}>
            <span class={CLASSES.slot.removeIcon} data-slot="chip-remove-icon">
              {local.endIcon}
            </span>
          </Show>
        </button>
      </Show>
      <Show when={!local.onRemove && local.endIcon}>
        <span class={twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd)} data-slot="chip-end-icon">
          {local.endIcon}
        </span>
      </Show>
    </span>
  );
};

interface ChipLabelProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  class?: string;
}

const ChipLabel = (props: ChipLabelProps): JSX.Element => {
  const [local, others] = splitProps(props, ["children", "class"]);

  return (
    <span class={twMerge(CLASSES.slot.label, local.class)} data-slot="chip-label" {...others}>
      {local.children}
    </span>
  );
};

export { ChipRoot, ChipLabel };
export type { ChipRootProps, ChipLabelProps, ChipVariant, ChipColor, ChipSize };

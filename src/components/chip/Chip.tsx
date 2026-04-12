import { clsx } from "clsx";
import { Show, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Chip.css";

type ChipVariant = "solid" | "flat" | "bordered";
type ChipColor = "default" | "primary" | "accent" | "success" | "warning" | "danger";
type ChipSize = "sm" | "md" | "lg";

const CHIP_VARIANT_CLASS: Record<ChipVariant, string> = {
  solid: "chip--solid",
  flat: "chip--flat",
  bordered: "chip--bordered",
};

const CHIP_COLOR_CLASS: Record<ChipColor, string> = {
  default: "chip--default",
  primary: "chip--primary",
  accent: "chip--accent",
  success: "chip--success",
  warning: "chip--warning",
  danger: "chip--danger",
};

const CHIP_SIZE_CLASS: Record<ChipSize, string> = {
  sm: "chip--sm",
  md: "chip--md",
  lg: "chip--lg",
};

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
        "chip",
        CHIP_VARIANT_CLASS[variant],
        CHIP_COLOR_CLASS[color],
        CHIP_SIZE_CLASS[size],
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
        <span class="chip__icon chip__icon--start" data-slot="chip-start-icon">
          {local.startIcon}
        </span>
      </Show>
      {chipChildren()}
      <Show when={local.onRemove && local.endIcon}>
        <button
          type="button"
          class="chip__remove"
          data-slot="chip-remove"
          aria-label={local.removeButtonLabel ?? "Remove"}
          onClick={handleRemove}
          disabled={Boolean(local.isDisabled)}
        >
          <Show when={local.endIcon}>
            <span class="chip__remove-icon" data-slot="chip-remove-icon">
              {local.endIcon}
            </span>
          </Show>
        </button>
      </Show>
      <Show when={!local.onRemove && local.endIcon}>
        <span class="chip__icon chip__icon--end" data-slot="chip-end-icon">
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
    <span class={twMerge("chip__label", local.class)} data-slot="chip-label" {...others}>
      {local.children}
    </span>
  );
};

export { ChipRoot, ChipLabel };
export type { ChipRootProps, ChipLabelProps, ChipVariant, ChipColor, ChipSize };

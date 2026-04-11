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
  startContent?: JSX.Element;
  endContent?: JSX.Element;
  onRemove?: () => void;
  removeButtonLabel?: string;
  isDisabled?: boolean;
}

const ChipRemoveIcon = () => (
  <svg
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    stroke-width="1.75"
    stroke-linecap="round"
    aria-hidden="true"
  >
    <path d="M6 6l8 8M14 6l-8 8" />
  </svg>
);

const ChipRoot = (props: ChipRootProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "variant",
    "color",
    "size",
    "startContent",
    "endContent",
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
      <Show when={local.startContent}>
        <span class="chip__start" data-slot="chip-start">
          {local.startContent}
        </span>
      </Show>
      {chipChildren()}
      <Show when={local.endContent}>
        <span class="chip__end" data-slot="chip-end">
          {local.endContent}
        </span>
      </Show>
      <Show when={local.onRemove}>
        <button
          type="button"
          class="chip__remove"
          data-slot="chip-remove"
          aria-label={local.removeButtonLabel ?? "Remove"}
          onClick={handleRemove}
          disabled={Boolean(local.isDisabled)}
        >
          <ChipRemoveIcon />
        </button>
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

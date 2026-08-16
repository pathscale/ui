import { clsx } from "clsx";
import type { JSX } from "@solidjs/web";
import {Show, omit} from "solid-js";
import { twMerge } from "tailwind-merge";

import "./Chip.css";
import { CLASSES } from "./Chip.recipe";
import type { Layout } from "../../lib/layouts";
import type { Flavor, State } from "../vocabulary";
import { componentRecipe } from "./Chip.recipe";

type ChipVariant = "solid" | "flat" | "bordered";
type ChipColor = "default" | "primary" | "accent" | "success" | "warning" | "danger";
type ChipSize = "sm" | "md" | "lg";

interface ChipRootProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color" | "onRemove"> {
  class?: string;
  children?: JSX.Element;
  variant?: ChipVariant;
  flavor?: Flavor;
  size?: ChipSize;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  onRemove?: () => void;
  removeButtonLabel?: string;
  state?: State;
}

const ChipRoot: Layout<typeof componentRecipe, ChipRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "variant",
    "flavor",
    "size",
    "startIcon",
    "endIcon",
    "onRemove",
    "removeButtonLabel",
    "state",
  );

  const classes = () => {
    const variant = props.variant ?? "solid";
    const color = props.flavor ?? "default";
    const size = props.size ?? "md";

    return twMerge(
      clsx(
        CLASSES.base,
        CLASSES.variant[variant],
        (CLASSES.flavor[color as keyof typeof CLASSES.flavor] ?? `chip--flavor-${color}`),
        CLASSES.size[size],
        props.class,
      ),
    );
  };

  const chipChildren = () => {
    const c = props.children;
    if (typeof c === "string" || typeof c === "number") {
      return <ChipLabel>{c}</ChipLabel>;
    }
    return c;
  };

  const handleRemove = (event: MouseEvent) => {
    event.stopPropagation();
    props.onRemove?.();
  };

  return (
    <span
      {...others}
      {...{ class: classes() }}
      data-slot="chip"
      data-disabled={(props.state === "disabled") ? "true" : "false"}
      data-removable={props.onRemove ? "true" : "false"}
    >
      <Show when={props.startIcon}>
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconStart) }} data-slot="chip-start-icon">
          {props.startIcon}
        </span>
      </Show>
      {chipChildren()}
      <Show when={props.onRemove && props.endIcon}>
        <button
          type="button"
          {...{ class: CLASSES.slot.remove }}
          data-slot="chip-remove"
          aria-label={props.removeButtonLabel ?? "Remove"}
          onClick={handleRemove}
          disabled={Boolean((props.state === "disabled"))}
        >
          <Show when={props.endIcon}>
            <span {...{ class: CLASSES.slot.removeIcon }} data-slot="chip-remove-icon">
              {props.endIcon}
            </span>
          </Show>
        </button>
      </Show>
      <Show when={!props.onRemove && props.endIcon}>
        <span {...{ class: twMerge(CLASSES.slot.icon, CLASSES.slot.iconEnd) }} data-slot="chip-end-icon">
          {props.endIcon}
        </span>
      </Show>
    </span>
  );
};

interface ChipLabelProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  class?: string;
}

const ChipLabel: Layout<typeof componentRecipe, ChipLabelProps> = () => {
  const others = omit(props, "children", "class");

  return (
    <span {...{ class: twMerge(CLASSES.slot.label, props.class) }} data-slot="chip-label" {...others}>
      {props.children}
    </span>
  );
};

export { ChipRoot, ChipLabel };
export type { ChipRootProps, ChipLabelProps, ChipVariant, ChipColor, ChipSize };

import "../_shared/material.css";
import type { JSX } from "@solidjs/web";
import "./Card.css";
import {Show} from "solid-js";
import type { Flavor, Material, Radius, Space, UIBaseProps, Variant } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { card, cardBody, cardFooter, cardHeader } from "./Card.recipe";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
/**
 * @deprecated Use `Material` from the shared vocabulary. Kept as an alias
 * because it is exported publicly and removing it would break call sites; it
 * has always had exactly these two members.
 */
export type CardMaterial = Material;
export type CardElevation = "none" | "sm" | "md" | "lg";

/**
 * The states this card actually renders.
 *
 * Not the shared `State`, which is what the prop was typed as. That union is
 * `default | loading | error | invalid | disabled | hidden` and this recipe
 * implements `info | success | warning | danger`: the two have **no member in
 * common**. So every value the type permitted resolved to no class, and every
 * value the recipe implements was a type error.
 *
 * A prop that accepts only values it ignores is worse than one that does not
 * exist, because it reads as configured. Narrowed to what is implemented;
 * `state="disabled"` and friends stop type-checking, and they never did
 * anything, so nothing that worked stops working.
 *
 * A card is not a form control, which is why the shared vocabulary does not
 * fit: it has no validity and nothing to disable. Behaviour lives on
 * `isInteractive`.
 */
export type CardState = "info" | "success" | "warning" | "danger";

export type CardProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    variant?: Variant;
    material?: Material;
    elevation?: CardElevation;
    flavor?: Flavor;
    state?: CardState;
    padding?: Space;
    radius?: Radius;
    /** Replaces isHoverable and isPressable, which had one call site each across 330. */
    isInteractive?: boolean;
    header?: JSX.Element;
    footer?: JSX.Element;
    children: JSX.Element;
  };

export type CardSectionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & { children: JSX.Element };

export const CardHeaderLayout: Layout<typeof cardHeader, CardSectionProps> = () => (
  <div {...slot.root}>{children}</div>
);

export const CardBodyLayout: Layout<typeof cardBody, CardSectionProps> = () => (
  <div {...slot.root}>{children}</div>
);

export const CardFooterLayout: Layout<typeof cardFooter, CardSectionProps> = () => (
  <div {...slot.root}>{children}</div>
);

/* -------------------------------------------------------------------------------------------------
 * Card
 *
 * `header` and `footer` cover the common case; Card.Header, Card.Body and
 * Card.Footer remain for anything that needs to interleave.
 *
 * An interactive card gets a button role and keyboard activation, because a
 * div that responds to click and nothing else is unreachable by keyboard.
 * -----------------------------------------------------------------------------------------------*/
export const CardLayout: Layout<typeof card, CardProps> = () => {
  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    if (!local.isInteractive) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.currentTarget.click();
  };

  return (
    <div
      {...slot.root}
      role={local.role ?? (local.isInteractive ? "button" : undefined)}
      tabindex={local.tabindex ?? (local.isInteractive ? 0 : undefined)}
      onKeyDown={handleKeyDown}
      data-flavor={local.flavor ?? "neutral"}
      data-material={local.material ?? "solid"}
      data-material-explicit={local.material ? "" : undefined}
    >
      <Show when={local.header}>
        <CardHeaderLayout>{local.header}</CardHeaderLayout>
      </Show>

      <CardBodyLayout>{children}</CardBodyLayout>

      <Show when={local.footer}>
        <CardFooterLayout>{local.footer}</CardFooterLayout>
      </Show>
    </div>
  );
};


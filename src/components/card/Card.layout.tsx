import "../_shared/material.css";
import type { JSX } from "@solidjs/web";
import "./Card.css";
import {Show} from "solid-js";
import type { Flavor, Material, Radius, Space, UIBaseProps, Variant } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { buttonHref, buttonRel } from "../button/Button.interactions";
import { cardSemantics } from "./Card.interactions";
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
    /**
     * Renders the card as an anchor, and navigates.
     *
     * A whole card that navigates is the common shape, and the way it was
     * written was `<a href><Card isInteractive /></a>`, which put a `button`
     * inside a `link` with the same name and the same box. That is invalid
     * HTML, it announces the card twice, and a press by coordinate lands on
     * whichever of the two happens to be on top.
     *
     * A card that navigates should be the anchor rather than sit inside one,
     * which is what `Button` already does. Middle-click, right-click,
     * open-in-new-tab and "copy link address" all work, which a `div` with a
     * click handler takes away.
     */
    href?: string;
    target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"];
    rel?: string;
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
 * div that responds to click and nothing else is unreachable by keyboard --
 * unless it is already something activatable, which is what `href` and an
 * explicit `role` are for. `cardSemantics` decides between the three, and it
 * is a pure function so the decision is asserted rather than read out of JSX.
 * -----------------------------------------------------------------------------------------------*/
export const CardLayout: Layout<typeof card, CardProps> = () => {
  const semantics = () =>
    cardSemantics({
      href: local.href,
      isInteractive: local.isInteractive,
      // A handler is what makes a card pressable; `isInteractive` only makes it
      // look it. A card inside a link has the second and not the first.
      hasActivation: local.onClick != null,
      role: local.role,
      tabindex: local.tabindex,
    });

  const handleKeyDown: JSX.EventHandlerUnion<HTMLDivElement, KeyboardEvent> = (event) => {
    if (!semantics().handlesKeyboardActivation) return;
    if (event.key !== "Enter" && event.key !== " ") return;
    if (event.target !== event.currentTarget) return;
    event.preventDefault();
    event.currentTarget.click();
  };

  const body = () => (
    <>
      <Show when={local.header}>
        <CardHeaderLayout>{local.header}</CardHeaderLayout>
      </Show>

      <CardBodyLayout>{children}</CardBodyLayout>

      <Show when={local.footer}>
        <CardFooterLayout>{local.footer}</CardFooterLayout>
      </Show>
    </>
  );

  /*
   * Both forms are literal elements rather than one `Dynamic`. `Button` learnt
   * this the expensive way: a Dynamic string element painted correctly under
   * Blitz and dropped a nested consumer's event binding, which on a card full
   * of buttons is the whole point of the card.
   */
  return (
    <Show
      when={semantics().element === "a"}
      fallback={
        <div
          {...slot.root}
          role={semantics().role}
          tabindex={semantics().tabindex}
          onKeyDown={handleKeyDown}
          data-flavor={local.flavor ?? "neutral"}
          data-material={local.material ?? "solid"}
          data-material-explicit={local.material ? "" : undefined}
        >
          {body()}
        </div>
      }
    >
      <a
        {...slot.root}
        href={buttonHref(local.href, false)}
        target={local.target}
        rel={buttonRel(local.rel, local.target)}
        role={semantics().role}
        tabindex={semantics().tabindex}
        data-flavor={local.flavor ?? "neutral"}
        data-material={local.material ?? "solid"}
        data-material-explicit={local.material ? "" : undefined}
      >
        {body()}
      </a>
    </Show>
  );
};


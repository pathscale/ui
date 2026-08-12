import { type JSX, Show } from "solid-js";
import type { Layout } from "solid-layouts";

import type { badge } from "./Badge.recipe";

/**
 * Badge's markup, and nothing else.
 *
 * Every class string arrives on `slot`, already resolved from the recipe, so
 * there is no `twMerge`, no `clsx` and no conditional class expression here.
 * What is left reads the way a `<template>` block reads.
 */

/**
 * A bare string or number is wrapped in a label; anything else is trusted to
 * be markup already. This is the one decision the markup makes, and it stays
 * here because it is about how children are presented rather than about what
 * they mean.
 */
export const BadgeRootLayout: Layout<typeof badge> = ({ slot, children }) => (
  <span {...slot.root}>
    <Show
      when={typeof children === "string" || typeof children === "number"}
      fallback={children}
    >
      <span {...slot.label}>{children}</span>
    </Show>
  </span>
);

export const BadgeAnchorLayout: Layout<typeof badge> = ({ slot, children }) => (
  <span {...slot.anchor}>{children}</span>
);

export const BadgeLabelLayout: Layout<typeof badge> = ({ slot, children }) => (
  <span {...slot.label}>{children}</span>
);

export type BadgeChildren = JSX.Element;

import type { Layout } from "solid-layouts";

import type { fieldset } from "./Fieldset.recipe";

/**
 * Fieldset's markup, and nothing else. Four elements, four slots, no state and
 * no presentation axes — the whole component is its structure.
 */

export const FieldsetRootLayout: Layout<typeof fieldset> = ({
  slot,
  children,
}) => <fieldset {...slot.root}>{children}</fieldset>;

export const FieldsetLegendLayout: Layout<typeof fieldset> = ({
  slot,
  children,
}) => <legend {...slot.legend}>{children}</legend>;

export const FieldsetGroupLayout: Layout<typeof fieldset> = ({
  slot,
  children,
}) => <div {...slot.group}>{children}</div>;

export const FieldsetActionsLayout: Layout<typeof fieldset> = ({
  slot,
  children,
}) => <div {...slot.actions}>{children}</div>;

import type { JSX } from "solid-js";
import type { Layout } from "solid-layouts";

import { pressableKeyDown } from "./Card.logic";
import type { card } from "./Card.recipe";

/**
 * Card's markup, and nothing else.
 *
 * The root's `role` and `tabIndex` fall back to what a pressable card needs, so
 * that a caller who sets neither still gets something focusable and announced
 * as a button. Both are the caller's when the caller supplies them.
 *
 * The three `data-*` attributes are written here because the recipe mirrors
 * only state to attributes, and all three are presentation props. Kept exactly
 * as they were, `"false"` included: nothing selects on them today, but a bare
 * `[data-pressable]` rule would match both values if it did.
 */

export const CardRootLayout: Layout<typeof card> = (
  { slot, children },
  props,
) => (
  <div
    {...slot.root}
    data-variant={props.variant as string}
    data-hoverable={props.isHoverable ? "true" : "false"}
    data-pressable={props.isPressable ? "true" : "false"}
    role={
      (props.role as JSX.AriaAttributes["role"]) ??
      (props.isPressable ? "button" : undefined)
    }
    tabIndex={(props.tabIndex as number) ?? (props.isPressable ? 0 : undefined)}
    onKeyDown={pressableKeyDown(props.onKeyDown, () =>
      Boolean(props.isPressable),
    )}
  >
    {children}
  </div>
);

export const CardHeaderLayout: Layout<typeof card> = ({ slot, children }) => (
  <div {...slot.header}>{children}</div>
);

export const CardBodyLayout: Layout<typeof card> = ({ slot, children }) => (
  <div {...slot.body}>{children}</div>
);

export const CardFooterLayout: Layout<typeof card> = ({ slot, children }) => (
  <div {...slot.footer}>{children}</div>
);

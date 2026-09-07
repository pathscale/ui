export type DrawerPlacement = "top" | "bottom" | "left" | "right";
export type DrawerSize = "sm" | "md" | "lg" | "full";
export type DrawerBackdropVariant = "opaque" | "blur" | "transparent";
export type DrawerScrollBehavior = "inside" | "outside";
export type DrawerAnimState = "entering" | "open" | "exiting" | "closed";
export type DrawerCloseReason = "escape" | "backdrop" | "trigger" | "api";

export const isSidePlacement = (placement: DrawerPlacement) =>
  placement === "left" || placement === "right";

export const isVisibleState = (state: DrawerAnimState) =>
  state === "entering" || state === "open";

/*
 * Focus lives in `src/lib/focus.ts` now.
 *
 * Dialog had its own copy of the same helpers and the overlay manager needs
 * them too, so keeping the only implementation under a component meant either
 * a third copy or a `lib` importing from `components`. Re-exported here so
 * every existing import keeps working.
 */
export { focusFirst, getFocusable, trapFocus } from "../../lib/focus";

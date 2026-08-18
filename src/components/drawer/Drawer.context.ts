import { createContext, useContext } from "solid-js";
import type {
  DrawerAnimState,
  DrawerBackdropVariant,
  DrawerCloseReason,
  DrawerPlacement,
  DrawerScrollBehavior,
  DrawerSize,
} from "./Drawer.a11y";

export type DrawerContextValue = {
  isOpen: () => boolean;
  setIsOpen: (next: boolean) => void;
  requestClose: (reason: DrawerCloseReason) => void;
  animState: () => DrawerAnimState;
  placement: () => DrawerPlacement;
  size: () => DrawerSize;
  backdrop: () => DrawerBackdropVariant;
  scrollBehavior: () => DrawerScrollBehavior;
  isDismissable: () => boolean;
  shouldCloseOnEsc: () => boolean;
  shouldCloseOnBackdropClick: () => boolean;
  trapFocus: () => boolean;
  restoreFocus: () => boolean;
  dialogRef: () => HTMLDivElement | undefined;
  setDialogRef: (node: HTMLDivElement | undefined) => void;
  labelledBy: () => string | undefined;
  setLabelledBy: (id: string | undefined) => void;
  describedBy: () => string | undefined;
  setDescribedBy: (id: string | undefined) => void;
  setPlacementOverride: (value: DrawerPlacement | undefined) => void;
  setBackdropDismissableOverride: (value: boolean | undefined) => void;
  setBackdropCloseOnClickOverride: (value: boolean | undefined) => void;
};

/*
 * Defaulted to `null`: this context is optional by construction.
 *
 * Consumers either optional-chain it or guard on it, so the component works
 * standalone without its root, which is a supported shape. Solid 2 made that
 * throw: `getContext` raises `ContextNotFoundError` when the resolved value is
 * `undefined`, and it throws before the optional chain can run. `null` is a
 * value, so the lookup succeeds and the existing reads behave as they always
 * have.
 *
 * A truthy default such as `{}` would silence the throw and be worse: the
 * optional chain would then call methods that do not exist.
 */
export const DrawerContext = createContext<DrawerContextValue | null>(null);

export const useDrawerContext = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("Drawer compound components must be used within <Drawer.Root>.");
  }

  return ctx;
};

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

export const DrawerContext = createContext<DrawerContextValue>();

export const useDrawerContext = () => {
  const ctx = useContext(DrawerContext);
  if (!ctx) {
    throw new Error("Drawer compound components must be used within <Drawer.Root>.");
  }

  return ctx;
};

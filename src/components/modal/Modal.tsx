import {
  type JSX,
  splitProps,
  createEffect,
  onCleanup,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

import type { IComponentBaseProps, ComponentSize } from "../types";
import ModalActions from "./ModalActions";
import ModalBody from "./ModalBody";
import ModalHeader from "./ModalHeader";
import ModalLegacy from "./ModalLegacy";

export type ModalProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDialogElement> & {
    open?: boolean;
    position?: "start" | "end" | "top" | "middle" | "bottom";
    responsive?: boolean;
    backdrop?: boolean;
    ariaHidden?: boolean;
    onClose?: () => void;
    closeOnEsc?: boolean;
    closeOnOutsideClick?: boolean;
    size?: ComponentSize | 'full';
  };

export type DialogProps = Omit<ModalProps, "ref">;

export function Modal(props: ModalProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "children",
    "open",
    "position",
    "responsive",
    "backdrop",
    "ariaHidden",
    "dataTheme",
    "class",
    "className",
    "onClose",
    "tabindex",
    "tabIndex",
    "closeOnEsc",
    "closeOnOutsideClick",
    "size",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  let dialogRef: HTMLDialogElement | undefined;

  createEffect(() => {
    if (!dialogRef) return;

    if (local.open && !dialogRef.open) {
      dialogRef.showModal();
    } else if (!local.open && dialogRef.open) {
      dialogRef.close();
    }
  });

  createEffect(() => {
    if (!dialogRef) return;

    const handleClose = () => {
      local.onClose?.();
    };

    const handleCancel = (event: Event) => {
      if (local.closeOnEsc === false) {
        event.preventDefault();
      } else {
        local.onClose?.();
      }
    };

    const handleClick = (event: MouseEvent) => {
      if (local.closeOnOutsideClick === false) return;

      const target = event.target as HTMLElement;

      if (!dialogRef) return;

      if (target === dialogRef || target.closest(".modal-backdrop")) {
        local.onClose?.();
      }
    };

    dialogRef.addEventListener("close", handleClose);
    dialogRef.addEventListener("cancel", handleCancel);
    dialogRef.addEventListener("click", handleClick);

    onCleanup(() => {
      dialogRef?.removeEventListener("close", handleClose);
      dialogRef?.removeEventListener("cancel", handleCancel);
      dialogRef?.removeEventListener("click", handleClick);
    });
  });

  const containerClasses = createMemo(() =>
    twMerge(
      "modal",
      clsx({
        "modal-open": local.open,
        "modal-end": local.position === "end",
        "modal-start": local.position === "start",
        "modal-top": local.position === "top",
        "modal-middle": local.position === "middle",
        "modal-bottom": local.position === "bottom",
        "modal-bottom sm:modal-middle": local.responsive,
      })
    )
  );

  const bodyClasses = createMemo(() =>
    twMerge(
      "modal-box",
      local.class,
      local.className,
      clsx({
        "max-w-none w-11/12 max-w-7xl": local.size === "xl",
        "max-w-none w-11/12 max-w-4xl": local.size === "lg",
        "max-w-none w-11/12 max-w-2xl": local.size === "md",
        "max-w-none w-80": local.size === "sm",
        "max-w-none w-64": local.size === "xs",
        "max-w-none w-full h-full": local.size === "full",
      })
    )
  );

  return (
    <dialog
      {...others}
      aria-label="Modal"
      aria-hidden={local.ariaHidden ?? !local.open}
      aria-modal={local.open}
      data-theme={local.dataTheme}
      class={containerClasses()}
      tabIndex={local.tabIndex ?? local.tabindex}
      ref={(el: HTMLDialogElement) => {
        dialogRef = el;
        if (typeof others.ref === "function") {
          others.ref(el);
        }
      }}
    >
      <div data-theme={local.dataTheme} class={bodyClasses()}>
        {resolvedChildren()}
      </div>
      {local.backdrop && (
        <form method="dialog" class="modal-backdrop">
          <button type="submit" class="sr-only">
            Close
          </button>
        </form>
      )}
    </dialog>
  );
}

export default Object.assign(Modal, {
  Header: ModalHeader,
  Body: ModalBody,
  Actions: ModalActions,
  Legacy: ModalLegacy,
});

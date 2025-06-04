import clsx from "clsx";
import {
  createEffect,
  createMemo,
  type JSX,
  onCleanup,
  children as resolveChildren,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
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
      event.preventDefault();
      local.onClose?.();
    };

    dialogRef.addEventListener("close", handleClose);
    dialogRef.addEventListener("cancel", handleCancel);

    onCleanup(() => {
      dialogRef?.removeEventListener("close", handleClose);
      dialogRef?.removeEventListener("cancel", handleCancel);
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
    twMerge("modal-box", local.class, local.className)
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
        <form
          method="dialog"
          class="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              local.onClose?.();
            }
          }}
        >
          <button type="submit">close</button>
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

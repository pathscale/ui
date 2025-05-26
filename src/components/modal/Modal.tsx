import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import clsx from "clsx";

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
  };

export type DialogProps = Omit<ModalProps, "ref">;

export default function Modal(props: ModalProps): JSX.Element {
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
  ]);

  const containerClasses = twMerge(
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
  );

  const bodyClasses = twMerge("modal-box", local.class, local.className);

  const { tabindex, tabIndex, ...rest } = others;
  const normalizedProps = {
    ...rest,
    tabIndex: tabIndex ?? tabindex,
  };

  return (
    <dialog
      {...normalizedProps}
      aria-label="Modal"
      aria-hidden={local.ariaHidden ?? !local.open}
      aria-modal={local.open}
      open={local.open}
      data-theme={local.dataTheme}
      class={containerClasses}
    >
      <div data-theme={local.dataTheme} class={bodyClasses}>
        {local.children}
      </div>
      {local.backdrop && (
        <form method="dialog" class="modal-backdrop">
          <button>close</button>
        </form>
      )}
    </dialog>
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Actions = ModalActions;
Modal.Legacy = ModalLegacy;

import type { JSX, ParentProps } from "solid-js";
import { createUniqueId, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import Modal from "../modal/Modal";
import Button from "../button/Button";
import type { ButtonVariant } from "../button";
import type { IComponentBaseProps } from "../types";

export type ConfirmDialogProps = ParentProps<
  IComponentBaseProps &
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
      open: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message?: JSX.Element;
      confirmText?: string;
      cancelText?: string;
      confirmVariant?: ButtonVariant;
      loading?: boolean;
    }
>;

export default function ConfirmDialog(props: ConfirmDialogProps): JSX.Element {
  const [local, others] = splitProps(props, [
    "open",
    "onClose",
    "onConfirm",
    "title",
    "message",
    "children",
    "confirmText",
    "cancelText",
    "confirmVariant",
    "loading",
    "dataTheme",
    "class",
    "className",
  ]);

  const titleId = createUniqueId();
  const messageId = createUniqueId();

  const hasBody = () => local.children != null || local.message != null;

  return (
    <Modal
      isOpen={local.open}
      onOpenChange={(isOpen) => {
        if (!isOpen) local.onClose();
      }}
      dataTheme={local.dataTheme}
      {...others}
    >
      <Modal.Content
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={hasBody() ? messageId : undefined}
        class={twMerge(local.class, local.className)}
      >
        <Modal.Header>
          <Modal.Heading id={titleId}>{local.title}</Modal.Heading>
        </Modal.Header>
        <Modal.Body>
          <div id={messageId}>{local.children ?? local.message}</div>
        </Modal.Body>
        <Modal.Footer class="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={local.onClose}
            isDisabled={local.loading}
          >
            {local.cancelText ?? "Cancel"}
          </Button>
          <Button
            variant={local.confirmVariant ?? "danger"}
            onClick={local.onConfirm}
            isPending={local.loading}
            isDisabled={local.loading}
          >
            {local.confirmText ?? "Confirm"}
          </Button>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
}

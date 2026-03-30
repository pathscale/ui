import type { JSX, ParentProps } from "solid-js";
import { createUniqueId, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import Modal from "../modal/Modal";
import Button from "../button/Button";
import type { ComponentColor, IComponentBaseProps } from "../types";

export type ConfirmDialogProps = ParentProps<
  IComponentBaseProps &
    Omit<JSX.HTMLAttributes<HTMLDialogElement>, "children"> & {
      open: boolean;
      onClose: () => void;
      onConfirm: () => void;
      title: string;
      message?: JSX.Element;
      confirmText?: string;
      cancelText?: string;
      confirmColor?: ComponentColor;
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
    "confirmColor",
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
      open={local.open}
      onClose={local.onClose}
      responsive
      role="alertdialog"
      aria-labelledby={titleId}
      aria-describedby={hasBody() ? messageId : undefined}
      dataTheme={local.dataTheme}
      class={twMerge(local.class, local.className)}
      {...others}
    >
      <Modal.Header id={titleId}>{local.title}</Modal.Header>
      <Modal.Body>
        <div id={messageId}>{local.children ?? local.message}</div>
      </Modal.Body>
      <Modal.Actions class="flex justify-end gap-2">
        <Button
          color="ghost"
          onClick={local.onClose}
          disabled={local.loading}
        >
          {local.cancelText ?? "Cancel"}
        </Button>
        <Button
          color={local.confirmColor ?? "error"}
          onClick={local.onConfirm}
          loading={local.loading}
          disabled={local.loading}
        >
          {local.confirmText ?? "Confirm"}
        </Button>
      </Modal.Actions>
    </Modal>
  );
}

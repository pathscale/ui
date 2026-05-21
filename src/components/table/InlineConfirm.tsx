import { type Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import type { IComponentBaseProps } from "../types";

export type InlineConfirmVariant = "primary" | "danger" | "warning";

export type InlineConfirmProps = IComponentBaseProps & {
  prompt: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  disabled?: boolean;
  confirmVariant?: InlineConfirmVariant;
};

const toButtonVariant = (variant: InlineConfirmVariant) => {
  if (variant === "danger") return "danger";
  if (variant === "warning") return "secondary";
  return "primary";
};

const InlineConfirm: Component<InlineConfirmProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "prompt",
    "confirmLabel",
    "cancelLabel",
    "onConfirm",
    "onCancel",
    "loading",
    "disabled",
    "confirmVariant",
    "class",
    "className",
    "dataTheme",
  ]);

  const isBusy = () => Boolean(local.loading);
  const isDisabled = () => Boolean(local.disabled) || isBusy();
  const confirmVariant = () => toButtonVariant(local.confirmVariant ?? "primary");

  return (
    <div
      {...rest}
      {...{ class: twMerge("inline-flex flex-wrap items-center gap-2", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-inline-confirm"
    >
      <span class="text-sm text-base-content/70" data-slot="table-inline-confirm-prompt">
        {local.prompt}
      </span>
      <div class="inline-flex items-center gap-2" data-slot="table-inline-confirm-actions">
        <Button
          size="sm"
          variant={confirmVariant()}
          isPending={isBusy()}
          isDisabled={isDisabled()}
          onClick={local.onConfirm}
          aria-label={local.confirmLabel}
        >
          {local.confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          isDisabled={isDisabled()}
          onClick={local.onCancel}
          aria-label={local.cancelLabel}
        >
          {local.cancelLabel}
        </Button>
      </div>
    </div>
  );
};

export default InlineConfirm;

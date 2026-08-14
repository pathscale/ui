import { type Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Table.recipe";

export type InlineConfirmVariant = "primary" | "danger" | "warning";

export type InlineConfirmProps = UIBaseProps & {
  prompt: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
  disabled?: boolean;
  confirmFlavor?: InlineConfirmVariant;
};

const toButtonFlavor = (variant: InlineConfirmVariant) => {
  if (variant === "danger") return "destructive" as const;
  if (variant === "warning") return "warning" as const;
  return undefined;
};

const InlineConfirm: Layout<typeof componentRecipe, InlineConfirmProps> = () => {
  const [local, rest] = splitProps(props, [
    "prompt",
    "confirmLabel",
    "cancelLabel",
    "onConfirm",
    "onCancel",
    "loading",
    "disabled",
    "confirmFlavor",
    "class",
    "dataTheme",
  ]);

  const isBusy = () => Boolean(local.loading);
  const isDisabled = () => Boolean(local.disabled) || isBusy();
  const confirmFlavor = () => toButtonFlavor(local.confirmFlavor ?? "primary");

  return (
    <div
      {...rest}
      {...{ class: twMerge("inline-flex flex-wrap items-center gap-2", local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-inline-confirm"
    >
      <span class="text-sm text-base-content/70" data-slot="table-inline-confirm-prompt">
        {local.prompt}
      </span>
      <div class="inline-flex items-center gap-2" data-slot="table-inline-confirm-actions">
        <Button
          size="sm"
          flavor={confirmFlavor()}
          state={isBusy() ? "loading" : isDisabled() ? "disabled" : "default"}
          onClick={local.onConfirm}
          aria-label={local.confirmLabel}
        >
          {local.confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          state={isDisabled() ? "disabled" : "default"}
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

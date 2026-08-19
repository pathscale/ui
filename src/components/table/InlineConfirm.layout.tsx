import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import Button from "../button";
import type { UIBaseProps } from "../vocabulary";
import type { tableInlineConfirmRecipe } from "./Table.recipe";

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

const InlineConfirm: Layout<
  typeof tableInlineConfirmRecipe,
  InlineConfirmProps
> = () => {
  const rest = omit(
    props,
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
  );

  const isBusy = () => Boolean(props.loading);
  const isDisabled = () => Boolean(props.disabled) || isBusy();
  const confirmFlavor = () => toButtonFlavor(props.confirmFlavor ?? "primary");

  return (
    <div
      {...rest}
      {...{
        class: twMerge("inline-flex flex-wrap items-center gap-2", props.class),
      }}
      data-theme={props.dataTheme}
      data-slot="table-inline-confirm"
    >
      <span
        class="text-sm text-base-content/70"
        data-slot="table-inline-confirm-prompt"
      >
        {props.prompt}
      </span>
      <div
        class="inline-flex items-center gap-2"
        data-slot="table-inline-confirm-actions"
      >
        <Button
          size="sm"
          flavor={confirmFlavor()}
          state={isBusy() ? "loading" : isDisabled() ? "disabled" : "default"}
          onClick={props.onConfirm}
          aria-label={props.confirmLabel}
        >
          {props.confirmLabel}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          state={isDisabled() ? "disabled" : "default"}
          onClick={props.onCancel}
          aria-label={props.cancelLabel}
        >
          {props.cancelLabel}
        </Button>
      </div>
    </div>
  );
};

export default InlineConfirm;

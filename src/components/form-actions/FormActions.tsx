import { type JSX, Match, Show, splitProps, Switch } from "solid-js";
import { twMerge } from "tailwind-merge";

import Button from "../button/Button";
import type { IComponentBaseProps } from "../types";

export type FormActionsLayout = "single" | "split" | "center";

export type FormActionsProps = IComponentBaseProps & {
  submitText?: string;
  cancelText?: string;
  isLoading?: boolean;
  isValid?: boolean;
  onCancel?: () => void;
  layout?: FormActionsLayout;
  children?: JSX.Element;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">;

const FormActions = (props: FormActionsProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "submitText",
    "cancelText",
    "isLoading",
    "isValid",
    "onCancel",
    "layout",
    "children",
    "dataTheme",
    "class",
    "className",
    "style",
  ]);

  const submitText = () => local.submitText ?? "Submit";
  const cancelText = () => local.cancelText ?? "Cancel";
  const layout = () => local.layout ?? "single";
  const isValid = () => local.isValid ?? true;

  const submitButton = (fullWidth?: boolean) => (
    <Button
      type="submit"
      variant="primary"
      fullWidth={fullWidth}
      isPending={local.isLoading}
      isDisabled={!isValid() || local.isLoading}
      aria-busy={local.isLoading}
    >
      {submitText()}
    </Button>
  );

  return (
    <Show when={!local.children} fallback={local.children}>
      <Switch>
        <Match when={layout() === "single"}>
          <div
            {...others}
            role="group"
            aria-label="Form actions"
            data-theme={local.dataTheme}
            class={twMerge("mt-4 flex w-full", local.class, local.className)}
            style={local.style}
          >
            {submitButton(true)}
          </div>
        </Match>
        <Match when={layout() === "split"}>
          <div
            {...others}
            role="group"
            aria-label="Form actions"
            data-theme={local.dataTheme}
            class={twMerge(
              "mt-4 flex w-full gap-2",
              local.class,
              local.className,
            )}
            style={local.style}
          >
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={local.onCancel}
              isDisabled={local.isLoading}
            >
              {cancelText()}
            </Button>
            {submitButton(true)}
          </div>
        </Match>
        <Match when={layout() === "center"}>
          <div
            {...others}
            role="group"
            aria-label="Form actions"
            data-theme={local.dataTheme}
            class={twMerge(
              "mt-4 flex w-full justify-center",
              local.class,
              local.className,
            )}
            style={local.style}
          >
            <div class="w-full max-w-md">{submitButton(true)}</div>
          </div>
        </Match>
      </Switch>
    </Show>
  );
};

export default FormActions;

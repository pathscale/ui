import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import Icon from "../icon";
import Input from "../input";
import type { IComponentBaseProps } from "../types";

export type PasswordFieldProps = IComponentBaseProps & {
  name?: string;
  label?: JSX.Element;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  autocomplete?: "current-password" | "new-password" | "off";
  startIcon?: JSX.Element;
  showLabel: string;
  hideLabel: string;
  value?: string;
  onInput?: (value: string) => void;
  onBlur?: () => void;
  class?: string;
  inputClass?: string;
};

const PasswordField: Component<PasswordFieldProps> = (props) => {
  const [local] = splitProps(props, [
    "name",
    "label",
    "placeholder",
    "disabled",
    "invalid",
    "autocomplete",
    "startIcon",
    "showLabel",
    "hideLabel",
    "value",
    "onInput",
    "onBlur",
    "inputClass",
    "class",
    "className",
    "dataTheme",
  ]);

  const [isVisible, setIsVisible] = createSignal(false);
  const toggleLabel = () => (isVisible() ? local.hideLabel : local.showLabel);

  return (
    <div
      {...{ class: twMerge("w-full", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="password-field"
      data-visible={isVisible() ? "true" : "false"}
    >
      <Input
        name={local.name}
        label={local.label}
        type={isVisible() ? "text" : "password"}
        placeholder={local.placeholder}
        autocomplete={local.autocomplete}
        value={local.value}
        isDisabled={Boolean(local.disabled)}
        isInvalid={Boolean(local.invalid)}
        startIcon={local.startIcon}
        onInput={(event: InputEvent & { currentTarget: HTMLInputElement }) => {
          local.onInput?.(event.currentTarget.value);
        }}
        onBlur={() => local.onBlur?.()}
        {...{ class: twMerge("w-full", local.inputClass) }}
        endIcon={
          <Button
            type="button"
            variant="ghost"
            size="sm"
            isIconOnly
            class="h-7 min-h-7 w-7 min-w-7"
            onClick={() => setIsVisible((value) => !value)}
            aria-label={toggleLabel()}
            aria-pressed={isVisible()}
            title={toggleLabel()}
          >
            <Icon
              width={16}
              height={16}
              name={isVisible() ? "icon-[lucide--eye-off]" : "icon-[lucide--eye]"}
              class="h-4 w-4"
            />
          </Button>
        }
      />
    </div>
  );
};

export default PasswordField;

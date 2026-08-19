import "./PasswordField.css";
import type { JSX } from "@solidjs/web";
import {createSignal} from "solid-js";
import Button from "../button";
import Icon from "../icon";
import Input from "../input";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { passwordField } from "./PasswordField.recipe";
import {
  capturePasswordToggleSnapshot,
  createPasswordFieldInputContract,
  preventPasswordTogglePointerDown,
  schedulePasswordFieldRestore,
  selectPasswordToggleIcon,
} from "./PasswordField.interactions";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type PasswordFieldProps = UIBaseProps & {
  id?: string;
  name?: string;
  label?: JSX.Element;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  autofocus?: boolean;
  autocomplete?: "current-password" | "new-password" | "off";
  "aria-describedby"?: string;
  startIcon?: JSX.Element;
  showLabel: string;
  hideLabel: string;
  value?: string;
  inputRef?: (el: HTMLInputElement) => void;
  onInput?: (value: string) => void;
  onBlur?: () => void;
  visibleIcon?: JSX.Element;
  hiddenIcon?: JSX.Element;
  onVisibilityChange?: (visible: boolean) => void;
  class?: string;
  inputClass?: string;
};

/* -------------------------------------------------------------------------------------------------
 * PasswordField
 *
 * Visibility lives here rather than in the recipe because it changes the
 * input's `type`, which is behaviour, not presentation. The snapshot around
 * the toggle restores focus, selection and value: swapping `type` makes some
 * browsers and password managers treat the field as replaced.
 * -----------------------------------------------------------------------------------------------*/
export const PasswordFieldLayout: Layout<typeof passwordField, PasswordFieldProps> = () => {
  const [isVisible, setIsVisible] = createSignal(false);
  let fieldRef: HTMLInputElement | undefined;

  const toggleLabel = () => (isVisible() ? local.hideLabel : local.showLabel);
  const toggleIcon = () =>
    selectPasswordToggleIcon(
      isVisible(),
      local.visibleIcon,
      local.hiddenIcon,
      <Icon
        width={16}
        height={16}
        src={isVisible() ? "icon-[lucide--eye-off]" : "icon-[lucide--eye]"}
      />,
    );

  const setFieldRef = (el: HTMLInputElement) => {
    fieldRef = el;
    local.inputRef?.(el);
  };

  const toggleVisibility = () => {
    const snapshot = capturePasswordToggleSnapshot(
      fieldRef,
      typeof document !== "undefined" ? document.activeElement : null,
    );
    const nextVisible = !isVisible();

    setIsVisible(nextVisible);
    local.onVisibilityChange?.(nextVisible);

    schedulePasswordFieldRestore(fieldRef, snapshot);
  };

  return (
    <div {...slot.root} data-visible={isVisible() ? "true" : "false"}>
      <Input
        {...createPasswordFieldInputContract({
          id: local.id,
          name: local.name,
          label: local.label,
          isVisible: isVisible(),
          placeholder: local.placeholder,
          required: local.required,
          autofocus: local.autofocus,
          autocomplete: local.autocomplete,
          "aria-describedby": local["aria-describedby"],
          value: local.value,
          disabled: local.disabled,
          invalid: local.invalid,
          startIcon: local.startIcon,
          inputClass: local.inputClass,
        })}
        ref={setFieldRef}
        onInput={(event: InputEvent & { currentTarget: HTMLInputElement }) => {
          local.onInput?.(event.currentTarget.value);
        }}
        onBlur={() => local.onBlur?.()}
        endIcon={
          <Button
            {...slot.toggle}
            type="button"
            variant="ghost"
            size="sm"
            width="square"
            state={local.disabled ? "disabled" : "default"}
            onPointerDown={preventPasswordTogglePointerDown}
            onClick={toggleVisibility}
            aria-label={toggleLabel()}
            aria-pressed={isVisible() ? "true" : "false"}
            title={toggleLabel()}
          >
            {toggleIcon()}
          </Button>
        }
      />
    </div>
  );
};

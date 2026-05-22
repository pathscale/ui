import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Button from "../button";
import Icon from "../icon";
import Input from "../input";
import type { IComponentBaseProps } from "../types";

export type PasswordFieldProps = IComponentBaseProps & {
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

export type PasswordToggleSnapshot = {
  hadFocus: boolean;
  selectionStart: number | null;
  selectionEnd: number | null;
  selectionDirection: "forward" | "backward" | "none" | null;
  valueBeforeToggle: string | null;
};

type PasswordFieldInputContractParams = Pick<
  PasswordFieldProps,
  | "id"
  | "name"
  | "label"
  | "placeholder"
  | "required"
  | "autofocus"
  | "autocomplete"
  | "aria-describedby"
  | "value"
  | "disabled"
  | "invalid"
  | "startIcon"
  | "inputClass"
> & {
  isVisible: boolean;
};

export const createPasswordFieldInputContract = (
  params: PasswordFieldInputContractParams,
) => ({
  id: params.id,
  name: params.name,
  label: params.label,
  type: getPasswordInputType(params.isVisible),
  placeholder: params.placeholder,
  required: params.required,
  autofocus: params.autofocus,
  autocomplete: params.autocomplete,
  "aria-describedby": params["aria-describedby"],
  value: params.value,
  isDisabled: Boolean(params.disabled),
  isInvalid: Boolean(params.invalid),
  startIcon: params.startIcon,
  class: twMerge("w-full", params.inputClass),
});

type PasswordFieldLike = {
  value: string;
  selectionStart: number | null;
  selectionEnd: number | null;
  selectionDirection: "forward" | "backward" | "none" | null;
  focus: (options?: { preventScroll?: boolean }) => void;
  setSelectionRange: (
    selectionStart: number,
    selectionEnd: number,
    selectionDirection?: "forward" | "backward" | "none",
  ) => void;
  dispatchEvent: (event: Event) => boolean;
};

export const getPasswordInputType = (isVisible: boolean) =>
  isVisible ? "text" : "password";

export const selectPasswordToggleIcon = (
  isVisible: boolean,
  visibleIcon: JSX.Element | undefined,
  hiddenIcon: JSX.Element | undefined,
  fallback: JSX.Element,
) => (isVisible ? visibleIcon : hiddenIcon) ?? fallback;

export const capturePasswordToggleSnapshot = (
  field: PasswordFieldLike | undefined,
  activeElement: EventTarget | null,
): PasswordToggleSnapshot => ({
  // activeElement is EventTarget | null while field may be an HTMLInputElement-like object.
  // Use a type-safe comparison by casting field to EventTarget for the runtime equality check.
  hadFocus: activeElement === (field as unknown as EventTarget),
  selectionStart: field?.selectionStart ?? null,
  selectionEnd: field?.selectionEnd ?? null,
  selectionDirection: field?.selectionDirection ?? null,
  valueBeforeToggle: field?.value ?? null,
});

export const restorePasswordFieldAfterToggle = (
  field: PasswordFieldLike | undefined,
  snapshot: PasswordToggleSnapshot,
) => {
  if (!field) return;

  if (
    snapshot.valueBeforeToggle !== null &&
    field.value !== snapshot.valueBeforeToggle
  ) {
    field.value = snapshot.valueBeforeToggle;
    field.dispatchEvent(new Event("input", { bubbles: true }));
  }

  if (!snapshot.hadFocus) return;

  field.focus({ preventScroll: true });
  if (snapshot.selectionStart === null || snapshot.selectionEnd === null)
    return;

  try {
    field.setSelectionRange(
      snapshot.selectionStart,
      snapshot.selectionEnd,
      snapshot.selectionDirection ?? undefined,
    );
  } catch {
    // Some browser/password input transitions can temporarily reject selection restoration.
  }
};

export const preventPasswordTogglePointerDown = (
  event: Pick<PointerEvent, "preventDefault">,
) => event.preventDefault();

const PasswordField: Component<PasswordFieldProps> = (props) => {
  const [local] = splitProps(props, [
    "id",
    "name",
    "label",
    "placeholder",
    "disabled",
    "invalid",
    "required",
    "autofocus",
    "autocomplete",
    "aria-describedby",
    "startIcon",
    "showLabel",
    "hideLabel",
    "value",
    "inputRef",
    "onInput",
    "onBlur",
    "visibleIcon",
    "hiddenIcon",
    "onVisibilityChange",
    "inputClass",
    "class",
    "className",
    "dataTheme",
  ]);

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
        name={isVisible() ? "icon-[lucide--eye-off]" : "icon-[lucide--eye]"}
        class="h-4 w-4"
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

    queueMicrotask(() => {
      restorePasswordFieldAfterToggle(fieldRef, snapshot);
    });
  };

  return (
    <div
      {...{ class: twMerge("w-full", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="password-field"
      data-visible={isVisible() ? "true" : "false"}
    >
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
            type="button"
            variant="ghost"
            size="sm"
            isIconOnly
            class="h-7 min-h-7 w-7 min-w-7"
            isDisabled={Boolean(local.disabled)}
            onPointerDown={preventPasswordTogglePointerDown}
            onClick={toggleVisibility}
            aria-label={toggleLabel()}
            aria-pressed={isVisible()}
            title={toggleLabel()}
          >
            {toggleIcon()}
          </Button>
        }
      />
    </div>
  );
};

export default PasswordField;

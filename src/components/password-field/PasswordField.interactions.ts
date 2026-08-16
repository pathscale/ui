import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

/**
 * Pure helpers behind PasswordField's visibility toggle.
 *
 * They live apart from the Layout because they are the part worth testing
 * directly: swapping an input's `type` is the one operation browsers and
 * password managers treat as replacing the field, which loses focus, the
 * selection, and occasionally the value itself.
 */

export type PasswordToggleSnapshot = {
  hadFocus: boolean;
  selectionStart: number | null;
  selectionEnd: number | null;
  selectionDirection: "forward" | "backward" | "none" | null;
  valueBeforeToggle: string | null;
};

export type PasswordFieldLike = {
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

export type PasswordFieldInputContractParams = {
  id?: string;
  name?: string;
  label?: JSX.Element;
  placeholder?: string;
  required?: boolean;
  autofocus?: boolean;
  autocomplete?: "current-password" | "new-password" | "off";
  "aria-describedby"?: string;
  value?: string;
  disabled?: boolean;
  invalid?: boolean;
  startIcon?: JSX.Element;
  inputClass?: string;
  isVisible: boolean;
};

export const getPasswordInputType = (isVisible: boolean) =>
  isVisible ? "text" : "password";

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

/**
 * Restore the field after the browser has processed the `type` swap.
 *
 * The deferral lives here rather than in the Layout because a `.layout.tsx`
 * template resolves free identifiers against props: a bare `queueMicrotask`
 * in that file compiles to `props.queueMicrotask`.
 */
export const schedulePasswordFieldRestore = (
  field: PasswordFieldLike | undefined,
  snapshot: PasswordToggleSnapshot,
) => {
  queueMicrotask(() => restorePasswordFieldAfterToggle(field, snapshot));
};

export const preventPasswordTogglePointerDown = (
  event: Pick<PointerEvent, "preventDefault">,
) => event.preventDefault();

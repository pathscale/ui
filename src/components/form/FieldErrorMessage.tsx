import { Show, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

export type FieldErrorMessageProps = JSX.HTMLAttributes<HTMLParagraphElement> & {
  /** Pre-normalized error string. Renders nothing when undefined or empty. */
  message?: string;
  className?: string;
};

/**
 * Displays a single field error string.
 *
 * Pure presentation — has no form or field awareness. Pass an already-normalized
 * `message` string from `getFirstFieldError()` or `useField().error()`.
 *
 * Hidden (returns null) when `message` is undefined or empty.
 */
const FieldErrorMessage: Component<FieldErrorMessageProps> = (props) => {
  return (
    <Show when={props.message}>
      <p
        {...props}
        {...{
          class: twMerge(
            "text-xs text-error mt-0.5",
            props.class,
            props.className,
          ),
        }}
        data-slot="field-error-message"
        role="alert"
        aria-live="polite"
      >
        {props.message}
      </p>
    </Show>
  );
};

export default FieldErrorMessage;
export { FieldErrorMessage };

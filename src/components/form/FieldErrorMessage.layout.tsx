import {Show, type Component} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Form.recipe";

export type FieldErrorMessageProps = JSX.HTMLAttributes<HTMLParagraphElement> & {
  /** Pre-normalized error string. Renders nothing when undefined or empty. */
  message?: string;
};

/**
 * Displays a single field error string.
 *
 * Pure presentation — has no form or field awareness. Pass an already-normalized
 * `message` string from `getFirstFieldError()` or `useField().error()`.
 *
 * Hidden (returns null) when `message` is undefined or empty.
 */
const FieldErrorMessage: Layout<typeof componentRecipe, FieldErrorMessageProps> = () => {
  return (
    <Show when={props.message}>
      <p
        {...props}
        {...{
          class: twMerge(
            "text-xs text-error mt-0.5",
            props.class,
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

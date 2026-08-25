import "./InlineEdit.css";
import type { JSX } from "@solidjs/web";
import { omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, componentRecipe } from "./InlineEdit.recipe";

/**
 * A value that is read in place until someone chooses to change it.
 *
 * Enter commits, Escape abandons, and moving focus away commits, so the mode
 * has an exit for a reader who never touches the keyboard.
 */
export type InlineEditProps = Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "onChange" | "children"
> &
  UIBaseProps & {
    /** The current value, shown while not editing and used as the draft. */
    value: string;
    /** Called with the trimmed draft when it differs from `value`. */
    onCommit?: (value: string) => void | Promise<unknown>;
    /** Accessible name for the trigger and the field. Both need one. */
    label?: string;
    /** Rendered inside the trigger. An icon, usually. */
    trigger?: JSX.Element;
    /** Rendered in place of the plain value, for a value that is also a link. */
    children?: JSX.Element;
    fullWidth?: boolean;
    disabled?: boolean;
    fieldClass?: string;
  };

const InlineEdit: Layout<typeof componentRecipe, InlineEditProps> = () => {
  const others = omit(
    props,
    "class",
    "value",
    "onCommit",
    "label",
    "trigger",
    "children",
    "fullWidth",
    "disabled",
    "fieldClass",
  );

  let readRow: HTMLSpanElement | undefined;
  let editRow: HTMLSpanElement | undefined;
  let field: HTMLInputElement | undefined;
  let open = false;
  let focused = false;
  let draft = "";

  // Written to the elements rather than held in a signal: a setter called from
  // a click handler does not land within that handler in this Solid version.
  const apply = (next: boolean): void => {
    open = next;
    if (readRow) readRow.style.display = next ? "none" : "inline-flex";
    if (editRow) editRow.style.display = next ? "inline-flex" : "none";
  };

  const start = (): void => {
    if (props.disabled) return;
    draft = props.value;
    if (field) field.value = draft;
    apply(true);
    // After the swap: a hidden input cannot take focus.
    queueMicrotask(() => {
      field?.focus();
      field?.select();
    });
  };

  const cancel = (): void => {
    draft = props.value;
    if (field) field.value = draft;
    focused = false;
    apply(false);
  };

  const commit = (): void => {
    const next = draft.trim();
    focused = false;
    apply(false);
    if (!next || next === props.value) return;
    void props.onCommit?.(next);
  };

  const rootClasses = (): string =>
    twMerge(
      CLASSES.base,
      props.fullWidth && CLASSES.flag.fullWidth,
      props.disabled && CLASSES.flag.disabled,
      props.class,
    );

  return (
    <span {...others} class={rootClasses()} data-slot="root">
      <span
        ref={(element: HTMLSpanElement) => {
          readRow = element;
        }}
        class={CLASSES.slot.read}
        data-slot="inline-edit-read"
      >
        <span class={CLASSES.slot.value} data-slot="inline-edit-value">
          {props.children ?? props.value}
        </span>
        <button
          type="button"
          onClick={start}
          disabled={props.disabled}
          aria-label={props.label}
          class={CLASSES.slot.trigger}
          data-slot="inline-edit-trigger"
        >
          {props.trigger}
        </button>
      </span>
      <span
        ref={(element: HTMLSpanElement) => {
          editRow = element;
        }}
        class={CLASSES.slot.edit}
        data-slot="inline-edit-edit"
      >
        <input
          ref={(element: HTMLInputElement) => {
            field = element;
          }}
          type="text"
          value={props.value}
          aria-label={props.label}
          onInput={(event) => {
            draft = event.currentTarget.value;
          }}
          onFocus={() => {
            focused = true;
          }}
          onBlur={() => {
            // Opening moves focus, and that blur arrives before the field's own
            // focus does. Committing on it closes the editor inside the click
            // that opened it.
            if (!focused) return;
            if (open) commit();
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit();
            } else if (event.key === "Escape") {
              event.preventDefault();
              cancel();
            }
          }}
          class={twMerge(CLASSES.slot.field, props.fieldClass)}
          data-slot="inline-edit-field"
        />
      </span>
    </span>
  );
};

export default InlineEdit;

import "./InlineEdit.css";
import type { JSX } from "@solidjs/web";
import { createTrackedEffect, onSettled, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import {
  bindInlineEditWindowDismissal,
  createInlineEditInteractions,
} from "./InlineEdit.interactions";
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
    "ref",
  );

  let root: HTMLSpanElement | undefined;
  let field: HTMLInputElement | undefined;
  const interactions = createInlineEditInteractions({
    value: () => props.value,
    disabled: () => Boolean(props.disabled),
    root: () => root,
    field: () => field,
    editingClass: CLASSES.flag.editing,
    onCommit: (value) => props.onCommit?.(value),
  });

  const rootClasses = (): string =>
    twMerge(
      CLASSES.base,
      interactions.isOpen() && CLASSES.flag.editing,
      props.fullWidth && CLASSES.flag.fullWidth,
      props.disabled && CLASSES.flag.disabled,
      props.class,
    );

  // Track the controlled value with Solid 2's single-callback lifecycle. A
  // reused InlineEdit must close as soon as its owner supplies a new value.
  createTrackedEffect(() => {
    interactions.syncValue(props.value);
  });

  onSettled(() => {
    return bindInlineEditWindowDismissal(window, interactions.windowBlur);
  });

  return (
    <span
      {...others}
      ref={(element: HTMLSpanElement) => {
        root = element;
        if (typeof props.ref === "function") props.ref(element);
      }}
      class={rootClasses()}
      data-slot="root"
    >
      <span
        aria-hidden="true"
        onPointerDown={interactions.commit}
        onClick={interactions.commit}
        class={CLASSES.slot.dismiss}
        data-slot="inline-edit-dismiss"
      />
      <span class={CLASSES.slot.read} data-slot="inline-edit-read">
        <span class={CLASSES.slot.value} data-slot="inline-edit-value">
          {props.children ?? props.value}
        </span>
        <button
          type="button"
          onClick={interactions.start}
          disabled={props.disabled}
          aria-label={props.label}
          class={CLASSES.slot.trigger}
          data-slot="inline-edit-trigger"
        >
          {props.trigger}
        </button>
      </span>
      <span class={CLASSES.slot.edit} data-slot="inline-edit-edit">
        <input
          ref={(element: HTMLInputElement) => {
            field = element;
          }}
          type="text"
          value={props.value}
          aria-label={props.label}
          onInput={(event) => {
            interactions.input(event.currentTarget.value);
          }}
          onFocus={interactions.focus}
          onBlur={interactions.blur}
          onKeyDown={(event) => {
            interactions.keyDown(event.key, () => event.preventDefault());
          }}
          class={twMerge(CLASSES.slot.field, props.fieldClass)}
          data-slot="inline-edit-field"
        />
      </span>
    </span>
  );
};

export default InlineEdit;

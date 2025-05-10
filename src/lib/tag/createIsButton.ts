import { type Accessor, createMemo } from "solid-js";
import { createTagName } from "./createTagName";

export const BUTTON_INPUT_TYPES = [
  "button",
  "color",
  "file",
  "image",
  "reset",
  "submit",
];

/**
 * Checks if the given tag name or input type represent a button.
 *
 * @param tagName The name of the tag to check.
 * @param type The type attribute of the input element.
 * @returns `true` if the tag is a button or an input of a button type; otherwise, `false`.
 */
export function isButton(tagName: string, type?: string): boolean {
  if (tagName === "button") {
    return true;
  }
  if (tagName === "input" && type !== undefined) {
    return BUTTON_INPUT_TYPES.indexOf(type) !== -1;
  }
  return false;
}

/**
 * Creates a memoized signal that checks if the element is a button.
 *
 * @param props.element The element to check.
 * @param props.type An optional button input type to consider.
 * @returns A memoized signal indicating if the element is a button.
 */
export function createIsButton(props: {
  element: Accessor<HTMLElement | null>;
  type?: string | undefined;
}): Accessor<boolean> {
  const tagName = createTagName({
    element: props.element,
    fallback: "button",
  });

  return createMemo(() => isButton(tagName(), props.type));
}

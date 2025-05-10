import { type Accessor, createMemo } from "solid-js";

/**
 * Creates a memoized signal with the lowercase tag name of the element.
 *
 * @param props.element The element to get the tag name of.
 * @param props.fallback The fallback tag name to use if the element is `null`.
 * @returns A memoized signal with the lowercase tag name of the element.
 */
export function createTagName(props: {
  element: Accessor<HTMLElement | null>;
  fallback: string;
}): Accessor<string> {
  return createMemo(
    () => props.element()?.tagName.toLowerCase() ?? props.fallback,
  );
}

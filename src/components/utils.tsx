import { type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";

function isJSXElement(node: unknown): node is JSX.Element {
  return typeof node === "object" && node !== null;
}

export function wrapWithElementIfInvalid({
  node,
  wrapper = "div",
  className = "",
}: {
  node: JSX.Element | string | number | null | undefined;
  wrapper?: keyof JSX.IntrinsicElements;
  className?: string;
}): JSX.Element {
  if (
    node === null ||
    node === undefined ||
    typeof node === "string" ||
    typeof node === "number" ||
    !isJSXElement(node)
  ) {
    return (
      <Dynamic component={wrapper} class={className}>
        {node}
      </Dynamic>
    );
  }

  return (
    <Dynamic component={wrapper} class={className}>
      {node}
    </Dynamic>
  );
}

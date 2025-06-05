import { createSignal, onCleanup, onMount, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { breakpoints } from "./types";
import { ResponsiveProp } from "./types";

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

export function mapResponsiveProp<T extends string | boolean>(
  prop: ResponsiveProp<T> | undefined,
  classMap: Record<string, string>
) {
  if (prop === undefined) return [];
  if (typeof prop === "string" || typeof prop === "boolean") {
    return [classMap[String(prop)]];
  }
  return breakpoints.flatMap((bp) => {
    const value = prop[bp];
    if (value === undefined) return [];
    const className = classMap[String(value)];
    return bp === "base" ? [className] : [`${bp}:${className}`];
  });
}

export function useDesktop(breakpoint = 1024) {
  const [isDesktop, setIsDesktop] = createSignal(false);

  const checkIfDesktop = () => {
    const width = window.innerWidth;
    setIsDesktop(width >= breakpoint);
  };

  onMount(() => {
    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
  });

  onCleanup(() => {
    window.removeEventListener("resize", checkIfDesktop);
  });

  return isDesktop;
} 
import type { JSX } from "solid-js";

/**
 * Icon's behaviour.
 *
 * Three props that are neither presentation nor plain HTML. `name` is an
 * iconify class, and a recipe axis enumerates its values — the set of icon
 * names is the whole of iconify, so it cannot. `width` and `height` are free
 * numbers for the same reason. They are declared here because nothing else
 * can know they exist.
 */
export const behaviour = ["name", "width", "height"] as const;

export type Props = {
  /** An iconify class, e.g. `icon-[mdi--home]`. */
  name?: string;
  width?: number;
  height?: number;
};

export function createIcon(props: Record<string, unknown>) {
  return {
    iconClass: () => (props.name as string) ?? "",
    /** Sized in pixels, because the value is a number rather than a scale. */
    box: (): JSX.CSSProperties => ({
      width: `${(props.width as number) ?? 24}px`,
      height: `${(props.height as number) ?? 24}px`,
    }),
  };
}

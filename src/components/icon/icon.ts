import type { ComponentColor } from "../types";

/**
 * `name` is an iconify class and the sizes are free numbers, so neither can be
 * a recipe axis — an axis enumerates its values. Declared here so the runtime
 * routes them to the markup instead of to the element as attributes.
 */
export const behaviour = ["name", "width", "height", "color"] as const;

export type Props = {
  width?: number;
  height?: number;
  color?: ComponentColor;
  name?: string;
};

export function createIcon(props: Record<string, unknown>) {
  return {
    get name() {
      return props.name as string | undefined;
    },
    get width() {
      return props.width as number | undefined;
    },
    get height() {
      return props.height as number | undefined;
    },
  };
}

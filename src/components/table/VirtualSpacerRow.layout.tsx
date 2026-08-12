import { type Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Table.recipe";

export type VirtualSpacerRowProps = IComponentBaseProps & {
  height: number;
  colSpan: number;
};

const VirtualSpacerRow: Layout<typeof componentRecipe, VirtualSpacerRowProps> = () => {
  const [local, rest] = splitProps(props, [
    "height",
    "colSpan",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <tr
      data-theme={local.dataTheme}
      data-slot="table-virtual-spacer-row"
      aria-hidden="true"
    >
      <td
        {...rest}
        colSpan={local.colSpan}
        {...{ class: twMerge("border-0 bg-transparent p-0", local.class, local.className) }}
        style={{ height: `${Math.max(0, local.height)}px` }}
      />
    </tr>
  );
};

export default VirtualSpacerRow;

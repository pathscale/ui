import { type Component, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { tableVirtualSpacerRowRecipe } from "./Table.recipe";

export type VirtualSpacerRowProps = UIBaseProps & {
  height: number;
  colSpan: number;
};

const VirtualSpacerRow: Layout<typeof tableVirtualSpacerRowRecipe, VirtualSpacerRowProps> = () => {
  const [local, rest] = splitProps(props, [
    "height",
    "colSpan",
    "class",
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
        {...{ class: twMerge("border-0 bg-transparent p-0", local.class) }}
        style={{ height: `${Math.max(0, local.height)}px` }}
      />
    </tr>
  );
};

export default VirtualSpacerRow;

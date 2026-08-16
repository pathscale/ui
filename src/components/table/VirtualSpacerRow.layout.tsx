import { type Component, omit } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { tableVirtualSpacerRowRecipe } from "./Table.recipe";

export type VirtualSpacerRowProps = UIBaseProps & {
  height: number;
  colSpan: number;
};

const VirtualSpacerRow: Layout<typeof tableVirtualSpacerRowRecipe, VirtualSpacerRowProps> = () => {
  const rest = omit(props, "height", "colSpan", "class", "dataTheme");

  return (
    <tr
      data-theme={props.dataTheme}
      data-slot="table-virtual-spacer-row"
      aria-hidden="true"
    >
      <td
        {...rest}
        colSpan={props.colSpan}
        {...{ class: twMerge("border-0 bg-transparent p-0", props.class) }}
        style={{ height: `${Math.max(0, props.height)}px` }}
      />
    </tr>
  );
};

export default VirtualSpacerRow;

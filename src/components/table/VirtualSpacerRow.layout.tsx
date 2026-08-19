import { type Component, omit } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import type { tableVirtualSpacerRowRecipe } from "./Table.recipe";

export type VirtualSpacerRowProps = UIBaseProps & {
  height: number;
  colspan: number;
};

const VirtualSpacerRow: Layout<
  typeof tableVirtualSpacerRowRecipe,
  VirtualSpacerRowProps
> = () => {
  const rest = omit(props, "height", "colspan", "class", "dataTheme");

  return (
    <tr
      data-theme={props.dataTheme}
      data-slot="table-virtual-spacer-row"
      aria-hidden="true"
    >
      <td
        {...rest}
        colspan={props.colspan}
        {...{ class: twMerge("border-0 bg-transparent p-0", props.class) }}
        style={{ height: `${Math.max(0, props.height)}px` }}
      />
    </tr>
  );
};

export default VirtualSpacerRow;

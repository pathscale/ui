import {type Component, Show, omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
import Icon from "../icon";
import type { UIBaseProps } from "../vocabulary";
import type { Layout } from "../../lib/layouts";
import { tableSortIconRecipe } from "./Table.recipe";

export type SortIconState = "asc" | "desc" | "none";

export type SortIconProps = UIBaseProps & {
  state: SortIconState;
  size?: number;
  ascIcon?: JSX.Element;
  descIcon?: JSX.Element;
  neutralIcon?: JSX.Element;
};

const SortIcon: Layout<typeof tableSortIconRecipe, SortIconProps> = () => {
  const rest = omit(
    props,
    "state",
    "size",
    "ascIcon",
    "descIcon",
    "neutralIcon",
    "class",
    "dataTheme",
  );

  const iconSize = () => props.size ?? 16;
  const iconName = () => {
    if (props.state === "asc") return "icon-[lucide--arrow-up]";
    if (props.state === "desc") return "icon-[lucide--arrow-down]";
    return "icon-[lucide--arrow-up-down]";
  };
  const customIcon = () => {
    if (props.state === "asc") return props.ascIcon;
    if (props.state === "desc") return props.descIcon;
    return props.neutralIcon;
  };

  return (
    <span
      {...rest}
      {...{ class: twMerge("inline-flex shrink-0 items-center justify-center", props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-sort-icon"
      data-state={props.state}
      aria-hidden="true"
    >
      <Show when={customIcon()} fallback={<Icon src={iconName()} width={iconSize()} height={iconSize()} />}>
        {customIcon()}
      </Show>
    </span>
  );
};

export default SortIcon;

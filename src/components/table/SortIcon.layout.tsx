import { type Component, type JSX, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
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
  const [local, rest] = splitProps(props, [
    "state",
    "size",
    "ascIcon",
    "descIcon",
    "neutralIcon",
    "class",
    "dataTheme",
  ]);

  const iconSize = () => local.size ?? 16;
  const iconName = () => {
    if (local.state === "asc") return "icon-[lucide--arrow-up]";
    if (local.state === "desc") return "icon-[lucide--arrow-down]";
    return "icon-[lucide--arrow-up-down]";
  };
  const customIcon = () => {
    if (local.state === "asc") return local.ascIcon;
    if (local.state === "desc") return local.descIcon;
    return local.neutralIcon;
  };

  return (
    <span
      {...rest}
      {...{ class: twMerge("inline-flex shrink-0 items-center justify-center", local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-sort-icon"
      data-state={local.state}
      aria-hidden="true"
    >
      <Show when={customIcon()} fallback={<Icon src={iconName()} width={iconSize()} height={iconSize()} />}>
        {customIcon()}
      </Show>
    </span>
  );
};

export default SortIcon;

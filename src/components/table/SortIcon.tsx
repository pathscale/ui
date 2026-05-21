import { type Component, type JSX, Show, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import Icon from "../icon";
import type { IComponentBaseProps } from "../types";

export type SortIconState = "asc" | "desc" | "none";

export type SortIconProps = IComponentBaseProps & {
  state: SortIconState;
  size?: number;
  ascIcon?: JSX.Element;
  descIcon?: JSX.Element;
  neutralIcon?: JSX.Element;
};

const SortIcon: Component<SortIconProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "state",
    "size",
    "ascIcon",
    "descIcon",
    "neutralIcon",
    "class",
    "className",
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
      {...{ class: twMerge("inline-flex shrink-0 items-center justify-center", local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="table-sort-icon"
      data-state={local.state}
      aria-hidden="true"
    >
      <Show when={customIcon()} fallback={<Icon name={iconName()} width={iconSize()} height={iconSize()} />}>
        {customIcon()}
      </Show>
    </span>
  );
};

export default SortIcon;

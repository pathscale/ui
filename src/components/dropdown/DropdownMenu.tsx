import { type JSX, splitProps, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import clsx from "clsx";

export type DropdownMenuProps = JSX.HTMLAttributes<HTMLUListElement> &
  IComponentBaseProps & {
    id?: string;
    hideOverflow?: boolean;
    "aria-labelledby"?: string;
  };

const DropdownMenu = (props: DropdownMenuProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "style",
    "id",
    "hideOverflow",
    "aria-labelledby",
  ]);

  const hideOverflowMemo = createMemo(() => {
    return local.hideOverflow ?? true;
  });

  const classes = createMemo(() =>
    twMerge(
      "dropdown-content menu p-2 shadow bg-base-100 overflow-y-auto flex-nowrap w-full rounded-box",
      clsx({
        "max-h-50": hideOverflowMemo(),
      }),
      local.class,
      local.className,
    ),
  );

  return (
    <ul
      {...others}
      id={local.id}
      aria-labelledby={local["aria-labelledby"]}
      tabindex={0}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
      role="menu"
    />
  );
};

export default DropdownMenu;

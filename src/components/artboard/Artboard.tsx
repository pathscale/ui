import {
  type ParentComponent,
  splitProps,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type ArtboardProps = IComponentBaseProps & {
  demo?: boolean;
  size?: 1 | 2 | 3 | 4 | 5 | 6;
  horizontal?: boolean;
};

const Artboard: ParentComponent<ArtboardProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "demo",
    "size",
    "horizontal",
    "dataTheme",
    "class",
    "className",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      "artboard",
      local.class,
      local.className,
      clsx({
        "artboard-demo": local.demo ?? true,
        "phone-1": local.size === 1,
        "phone-2": local.size === 2,
        "phone-3": local.size === 3,
        "phone-4": local.size === 4,
        "phone-5": local.size === 5,
        "phone-6": local.size === 6,
        horizontal: local.horizontal,
      }),
    ),
  );

  return (
    <div
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {resolvedChildren()}
    </div>
  );
};

export default Artboard;

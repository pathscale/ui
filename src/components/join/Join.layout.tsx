import {
  splitProps,
  type JSX,
  createMemo,
  children as resolveChildren,
} from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./Join.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./Join.recipe";

export type JoinProps = UIBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean;
    vertical?: boolean;
    horizontal?: boolean;
  };

const Join: Layout<typeof componentRecipe, JoinProps> = () => {
  const [local, others] = splitProps(props, [
    "responsive",
    "vertical",
    "horizontal",
    "class",
    "dataTheme",
    "style",
    "children",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      clsx({
        [CLASSES.flag.vertical]: !local.responsive && local.vertical,
        [CLASSES.flag.horizontal]: !local.responsive && local.horizontal,
        [CLASSES.flag.responsive]: local.responsive,
      }),
      local.class,
    ),
  );

  return (
    <div
      {...others}
      {...{ class: classes() }}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {resolvedChildren()}
    </div>
  );
};

export default Join;

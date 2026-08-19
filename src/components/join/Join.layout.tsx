import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";
import { createMemo, omit, children as resolveChildren } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Join.recipe";

export type JoinProps = UIBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean;
    vertical?: boolean;
    horizontal?: boolean;
  };

const Join: Layout<typeof componentRecipe, JoinProps> = () => {
  const others = omit(
    props,
    "responsive",
    "vertical",
    "horizontal",
    "class",
    "dataTheme",
    "style",
    "children",
  );

  const resolvedChildren = resolveChildren(() => props.children);

  const classes = createMemo(() =>
    twMerge(
      CLASSES.base,
      clsx({
        [CLASSES.flag.vertical]: !props.responsive && props.vertical,
        [CLASSES.flag.horizontal]: !props.responsive && props.horizontal,
        [CLASSES.flag.responsive]: props.responsive,
      }),
      props.class,
    ),
  );

  return (
    <div
      {...others}
      {...{ class: classes() }}
      data-theme={props.dataTheme}
      style={props.style}
    >
      {resolvedChildren()}
    </div>
  );
};

export default Join;

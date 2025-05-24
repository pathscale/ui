import { splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type JoinProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement> & {
    responsive?: boolean;
    vertical?: boolean;
    horizontal?: boolean;
  };

const Join = (props: JoinProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "responsive",
    "vertical",
    "horizontal",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const classes = () =>
    twMerge(
      "join",
      clsx({
        "join-vertical": !local.responsive && local.vertical,
        "join-horizontal": !local.responsive && local.horizontal,
        "join-vertical lg:join-horizontal": local.responsive,
      }),
      local.class,
      local.className
    );

  return (
    <div
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {props.children}
    </div>
  );
};

export default Join;

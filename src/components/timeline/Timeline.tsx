import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";
import clsx from "clsx";

type TimelineProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLUListElement> & {
    vertical?: boolean;
    horizontal?: boolean;
    responsive?: boolean;
    snap?: boolean;
    compact?: boolean;
  };

const Timeline = (props: TimelineProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "vertical",
    "horizontal",
    "responsive",
    "snap",
    "compact",
    "class",
    "className",
    "style",
    "dataTheme",
  ]);

  const classes = twMerge(
    "timeline",
    clsx({
      "timeline-vertical": local.vertical,
      "timeline-horizontal": local.horizontal,
      "timeline-vertical lg:timeline-horizontal": local.responsive,
      "timeline-snap-icon": local.snap,
      "timeline-compact": local.compact,
    }),
    local.class,
    local.className
  );

  return (
    <ul
      {...others}
      class={classes}
      data-theme={local.dataTheme}
      style={local.style}
    >
      {props.children}
    </ul>
  );
};

export default Timeline;

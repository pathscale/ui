import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type TimelineEndProps = JSX.HTMLAttributes<HTMLDivElement> & {
  box?: boolean;
};

const TimelineEnd = (props: TimelineEndProps): JSX.Element => {
  const [local, others] = splitProps(props, ["box", "class", "style"]);

  const classes = twMerge(
    "timeline-end",
    clsx({ "timeline-box": local.box ?? true }),
    local.class,
  );

  return (
    <div
      {...others}
      class={classes}
      style={local.style}
    >
      {props.children}
    </div>
  );
};

export default TimelineEnd;

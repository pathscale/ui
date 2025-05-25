import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type TimelineStartProps = JSX.HTMLAttributes<HTMLDivElement> & {
  box?: boolean;
};

const TimelineStart = (props: TimelineStartProps): JSX.Element => {
  const [local, others] = splitProps(props, ["box", "class", "style"]);

  const classes = twMerge(
    "timeline-start",
    clsx({ "timeline-box": local.box }),
    local.class
  );

  return (
    <div {...others} class={classes} style={local.style}>
      {props.children}
    </div>
  );
};

export default TimelineStart;

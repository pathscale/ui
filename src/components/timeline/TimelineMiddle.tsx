import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

export type TimelineMiddleProps = JSX.HTMLAttributes<HTMLDivElement>;

const TimelineMiddle = (props: TimelineMiddleProps): JSX.Element => {
  const [local, others] = splitProps(props, ["class", "style", "children"]);

  const classes = twMerge("timeline-middle", local.class);

  return (
    <div {...others} class={classes} style={local.style}>
      {local.children ?? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          class="w-5 h-5"
        >
          <path
            fill-rule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
            clip-rule="evenodd"
          />
        </svg>
      )}
    </div>
  );
};

export default TimelineMiddle;

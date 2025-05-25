import { type JSX, splitProps, Show } from "solid-js";

export type TimelineItemProps = JSX.HTMLAttributes<HTMLLIElement> & {
  connect?: "both" | "start" | "end";
  startClassName?: string;
  endClassName?: string;
};

const TimelineItem = (props: TimelineItemProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "connect",
    "startClassName",
    "endClassName",
    "class",
    "style",
  ]);

  return (
    <li {...others} class={local.class} style={local.style}>
      <Show when={local.connect === "both" || local.connect === "start"}>
        <hr class={local.startClassName} />
      </Show>

      {props.children}

      <Show when={local.connect === "both" || local.connect === "end"}>
        <hr class={local.endClassName} />
      </Show>
    </li>
  );
};

export default TimelineItem;

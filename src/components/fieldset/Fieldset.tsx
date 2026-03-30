import { type JSX, splitProps, Show, createUniqueId } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps, ComponentSize } from "../types";

export type FieldsetGap = ComponentSize | "none";

export type FieldsetProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLFieldSetElement> & {
    legend?: JSX.Element | string;
    description?: string;
    disabled?: boolean;
    gap?: FieldsetGap;
  };

const GAP_MAP: Record<FieldsetGap, string> = {
  none: "gap-0",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-4",
  lg: "gap-6",
  xl: "gap-8",
};

const Fieldset = (props: FieldsetProps): JSX.Element => {
  const descriptionId = createUniqueId();

  const [local, others] = splitProps(props, [
    "legend",
    "description",
    "disabled",
    "gap",
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
  ]);

  const gap = () => local.gap ?? "md";

  const classes = () =>
    twMerge("flex flex-col", GAP_MAP[gap()], local.class, local.className);

  return (
    <fieldset
      {...others}
      class={classes()}
      data-theme={local.dataTheme}
      style={local.style}
      disabled={local.disabled}
      aria-describedby={local.description ? descriptionId : undefined}
    >
      <Show when={local.legend}>
        <legend class="text-lg font-semibold">{local.legend}</legend>
      </Show>
      <Show when={local.description}>
        <p id={descriptionId} class="text-sm text-base-content/60 mt-1">
          {local.description}
        </p>
      </Show>
      {local.children}
    </fieldset>
  );
};

export default Fieldset;

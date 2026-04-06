import "./countdown.css";
import { createMemo, splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CountdownProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLSpanElement> & {
    value: number;
  };
const Countdown = (props: CountdownProps): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "class",
    "className",
    "dataTheme",
    "value",
  ]);

  const displayedValue = createMemo(() =>
    Math.min(99, Math.max(0, local.value)),
  );

  return (
    <span
      role="timer"
      {...rest}
      data-theme={local.dataTheme}
      class={twMerge("countdown", local.class, local.className)}
    >
      <span
        style={`--value: ${displayedValue()}`}
        data-content={displayedValue()}
      />
    </span>
  );
};

export default Countdown;

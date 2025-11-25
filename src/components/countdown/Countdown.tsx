import { createEffect, createMemo, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CountdownProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLSpanElement> & {
    value: number;
  };
const Countdown = (props: CountdownProps): JSX.Element => {
  const {
    class: className,
    className: classNameAlt,
    dataTheme,
    ...rest
  } = props;

  const displayedValue = createMemo(() =>
    Math.min(99, Math.max(0, props.value)),
  );

  return (
    <span
      role="timer"
      {...rest}
      data-theme={dataTheme}
      class={twMerge("countdown", className, classNameAlt)}
    >
      <span
        style={`--value: ${displayedValue()}`}
        data-content={displayedValue()}
      />
    </span>
  );
};

export default Countdown;

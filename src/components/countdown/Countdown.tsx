import type { JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type CountdownProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLSpanElement> & {
    value: number;
  };
const Countdown = (props: CountdownProps): JSX.Element => {
  const {
    value,
    class: className,
    className: classNameAlt,
    dataTheme,
    ...rest
  } = props;

  const displayedValue = Math.min(99, Math.max(0, value));
  const countdownStyle: JSX.CSSProperties = {
    "--value": displayedValue,
  };

  return (
    <span
      role="timer"
      {...rest}
      data-theme={dataTheme}
      class={twMerge("countdown", className, classNameAlt)}
    >
      <span style={countdownStyle} />
    </span>
  );
};

export default Countdown;

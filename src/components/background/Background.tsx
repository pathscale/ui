import type { JSX } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type BackgroundProps = IComponentBaseProps &
  JSX.HTMLAttributes<HTMLDivElement>;

const Background = (props: BackgroundProps) => {
  const { class: className, className: classNameAlt, ...rest } = props;
  return (
    <div
      class={twMerge("bg-base-200 min-h-screen", clsx(className, classNameAlt))}
      {...rest}
    />
  );
};

export default Background;

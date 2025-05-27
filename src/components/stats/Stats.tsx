import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import Stat from "./Stat";

export type StatsProps = {
  direction?: "horizontal" | "vertical";
  children?: JSX.Element;
} & JSX.HTMLAttributes<HTMLDivElement>;

const Stats = (props: StatsProps) => {
  const [local, rest] = splitProps(props, ["class", "direction"]);

  return (
    <div
      {...rest}
      class={twMerge(
        "stats",
        clsx({
          "stats-horizontal": local.direction === "horizontal",
          "stats-vertical": local.direction === "vertical",
        }),
        local.class
      )}
    >
      {props.children}
    </div>
  );
};

export default Object.assign(Stats, { Stat });

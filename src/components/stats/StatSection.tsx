import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

export type StatSectionProps = JSX.HTMLAttributes<HTMLDivElement> & {
  section: "title" | "value" | "desc" | "figure" | "actions";
};

const StatSection = (props: StatSectionProps) => {
  const [local, rest] = splitProps(props, ["class", "section"]);

  return (
    <div
      {...rest}
      class={twMerge(
        clsx({
          "stat-title": local.section === "title",
          "stat-value": local.section === "value",
          "stat-desc": local.section === "desc",
          "stat-figure": local.section === "figure",
          "stat-actions": local.section === "actions",
        }),
        local.class
      )}
    >
      {props.children}
    </div>
  );
};

export default StatSection;

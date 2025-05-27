import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import StatSection, { type StatSectionProps } from "./StatSection";

export type StatProps = JSX.HTMLAttributes<HTMLDivElement> & {
  "data-theme"?: string;
};

const Stat = (props: StatProps) => {
  const [local, rest] = splitProps(props, ["class", "data-theme"]);

  return (
    <div
      {...rest}
      class={twMerge("stat", clsx(local.class))}
      data-theme={local["data-theme"]}
    >
      {props.children}
    </div>
  );
};

const StatTitle = (props: Omit<StatSectionProps, "section">) => (
  <StatSection section="title" {...props} />
);

const StatValue = (props: Omit<StatSectionProps, "section">) => (
  <StatSection section="value" {...props} />
);

const StatDesc = (props: Omit<StatSectionProps, "section">) => (
  <StatSection section="desc" {...props} />
);

const StatFigure = (props: Omit<StatSectionProps, "section">) => (
  <StatSection section="figure" {...props} />
);

const StatActions = (props: Omit<StatSectionProps, "section">) => (
  <StatSection section="actions" {...props} />
);

export default Object.assign(Stat, {
  Title: StatTitle,
  Value: StatValue,
  Desc: StatDesc,
  Figure: StatFigure,
  Actions: StatActions,
});

import { splitProps, type JSX, createMemo } from "solid-js";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";
import StatSection, { type StatSectionProps } from "./StatSection";
import type { IComponentBaseProps } from "../types";

export type StatProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps;

const Stat = (props: StatProps): JSX.Element => {
  const [local, rest] = splitProps(props, ["class", "className", "dataTheme"]);

  const classes = createMemo(() =>
    twMerge("stat", clsx(local.class, local.className)),
  );

  return (
    <div
      {...rest}
      class={classes()}
      data-theme={local.dataTheme}
    >
      {props.children}
    </div>
  );
};

const StatTitle = (props: Omit<StatSectionProps, "section">) => (
  <StatSection
    section="title"
    {...props}
  />
);

const StatValue = (props: Omit<StatSectionProps, "section">) => (
  <StatSection
    section="value"
    {...props}
  />
);

const StatDesc = (props: Omit<StatSectionProps, "section">) => (
  <StatSection
    section="desc"
    {...props}
  />
);

const StatFigure = (props: Omit<StatSectionProps, "section">) => (
  <StatSection
    section="figure"
    {...props}
  />
);

const StatActions = (props: Omit<StatSectionProps, "section">) => (
  <StatSection
    section="actions"
    {...props}
  />
);

export default Object.assign(Stat, {
  Title: StatTitle,
  Value: StatValue,
  Desc: StatDesc,
  Figure: StatFigure,
  Actions: StatActions,
});

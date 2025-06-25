import {
  children as resolveChildren,
  JSX,
  splitProps,
  createMemo,
  ParentProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";

type CodeMockupProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;

const CodeMockup = (props: ParentProps<CodeMockupProps>): JSX.Element => {
  const [local, rest] = splitProps(props, [
    "class",
    "className",
    "children",
    "dataTheme",
    "aria-label",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = createMemo(() =>
    twMerge("mockup-code w-full", local.class, local.className)
  );

  return (
    <div
      class={classes()}
      data-theme={local.dataTheme}
      aria-label={local["aria-label"] || "Code mockup"}
      {...rest}
    >
      {resolvedChildren()}
    </div>
  );
};

export default CodeMockup;

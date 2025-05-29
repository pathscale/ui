import {
  children as getChildren,
  JSX,
  mergeProps,
  ParentProps,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";

type AppTheme = "light" | "dark";
type CodeMockupProps = JSX.HTMLAttributes<HTMLDivElement> & {
  dataTheme?: AppTheme;
};

const CodeMockup = (props: ParentProps<CodeMockupProps>): JSX.Element => {
  const merged = mergeProps({ class: "", "aria-label": "Code mockup" }, props);
  const [local, rest] = splitProps(merged, ["class", "children", "dataTheme"]);

  const resolvedChildren = getChildren(() => local.children);

  return (
    <div
      class={twMerge("mockup-code w-full", local.class)}
      data-theme={local.dataTheme}
      {...rest}
    >
      {resolvedChildren()}
    </div>
  );
};

export default CodeMockup;
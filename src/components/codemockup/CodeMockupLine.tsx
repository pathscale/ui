import clsx from "clsx";
import { JSX, mergeProps, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

type ComponentStatus = "info" | "success" | "warning" | "error";
type AppTheme = "light" | "dark";

type CodeMockupLineProps = JSX.HTMLAttributes<HTMLPreElement> & {
  dataPrefix?: string | boolean;
  status?: ComponentStatus;
  innerProps?: JSX.HTMLAttributes<HTMLElement>;
  innerRef?: HTMLElement | ((el: HTMLElement) => void);
  dataTheme?: AppTheme;
};

const CodeMockupLine = (props: CodeMockupLineProps): JSX.Element => {
  const merged = mergeProps(
    {
      dataPrefix: ">",
      status: null,
      class: "",
    },
    props
  );

  const [local, rest] = splitProps(merged, [
    "dataPrefix",
    "status",
    "innerProps",
    "innerRef",
    "class",
    "children",
    "dataTheme",
  ]);

  const statusClass = () =>
    twMerge(
      clsx({
        "bg-info": local.status === "info",
        "bg-success": local.status === "success",
        "bg-warning": local.status === "warning",
        "bg-error": local.status === "error",

        "text-info-content": local.status === "info",
        "text-success-content": local.status === "success",
        "text-warning-content": local.status === "warning",
        "text-error-content": local.status === "error",
      }),
      local.class
    );

  const prefix = () =>
    local.dataPrefix !== false ? local.dataPrefix || ">" : undefined;

  return (
    <pre
      class={statusClass()}
      data-prefix={prefix()}
      data-theme={local.dataTheme}
      {...rest}
    >
      <code {...local.innerProps} ref={local.innerRef}>
        {local.children}
      </code>
    </pre>
  );
};

export default CodeMockupLine;

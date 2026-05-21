import { splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps } from "../types";

export type AuthFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children: JSX.Element;
    gap?: "sm" | "md" | "lg";
  };

const GAP_CLASS: Record<NonNullable<AuthFieldGroupProps["gap"]>, string> = {
  sm: "gap-3",
  md: "gap-4",
  lg: "gap-6",
};

const AuthFieldGroup: Component<AuthFieldGroupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "gap",
    "class",
    "className",
    "dataTheme",
  ]);

  return (
    <div
      {...others}
      {...{ class: twMerge("flex w-full flex-col", GAP_CLASS[local.gap ?? "md"], local.class, local.className) }}
      data-theme={local.dataTheme}
      data-slot="auth-field-group"
    >
      {local.children}
    </div>
  );
};

export default AuthFieldGroup;

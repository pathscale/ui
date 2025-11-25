import { type ParentComponent, splitProps, type JSX } from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import type { IComponentBaseProps, ComponentColor } from "../types";

export type PhoneMockupProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    color?: Exclude<ComponentColor, "ghost">;
    innerProps?: JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;
  };

const PhoneMockup: ParentComponent<PhoneMockupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "color",
    "innerProps",
  ]);

  const classes = () =>
    twMerge(
      "mockup-phone",
      local.class,
      local.className,
      clsx({
        "border-primary": local.color === "primary",
        "border-secondary": local.color === "secondary",
        "border-info": local.color === "info",
        "border-success": local.color === "success",
        "border-warning": local.color === "warning",
        "border-error": local.color === "error",
      }),
    );

  const innerClasses = () =>
    twMerge(
      "artboard artboard-demo phone-1",
      local.innerProps?.class,
      local.innerProps?.className,
    );

  return (
    <div
      aria-label="Phone mockup"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      <div class="mockup-phone-camera" />
      <div class="mockup-phone-display">
        <div
          {...local.innerProps}
          class={innerClasses()}
        >
          {local.children}
        </div>
      </div>
    </div>
  );
};

export default PhoneMockup;

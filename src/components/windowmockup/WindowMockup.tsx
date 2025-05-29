import {
  ParentComponent,
  splitProps,
  JSX,
  children as resolveChildren,
  createMemo,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps, ComponentColor } from "../types";

export type WindowMockupColors = Exclude<ComponentColor, "ghost">;

export type WindowMockupProps = JSX.HTMLAttributes<HTMLDivElement> &
  IComponentBaseProps & {
    frameColor?: WindowMockupColors;
    backgroundColor?: WindowMockupColors;
    border?: boolean;
    borderColor?: WindowMockupColors;
  };

const WindowMockup: ParentComponent<WindowMockupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "border",
    "borderColor",
    "backgroundColor",
    "frameColor",
  ]);

  const borderColorValue = () =>
    local.borderColor || local.frameColor || "neutral";

  const classes = () =>
    twMerge(
      "mockup-window",
      local.class,
      local.className,
      local.border && `border border-${borderColorValue()}`,
      clsx({
        "border-neutral": borderColorValue() === "neutral",
        "border-primary": borderColorValue() === "primary",
        "border-secondary": borderColorValue() === "secondary",
        "border-accent": borderColorValue() === "accent",
        "border-info": borderColorValue() === "info",
        "border-success": borderColorValue() === "success",
        "border-warning": borderColorValue() === "warning",
        "border-error": borderColorValue() === "error",
        "bg-neutral": local.frameColor === "neutral",
        "bg-primary": local.frameColor === "primary",
        "bg-secondary": local.frameColor === "secondary",
        "bg-accent": local.frameColor === "accent",
        "bg-info": local.frameColor === "info",
        "bg-success": local.frameColor === "success",
        "bg-warning": local.frameColor === "warning",
        "bg-error": local.frameColor === "error",
      })
    );

  const innerClasses = () =>
    twMerge(
      "p-4",
      local.backgroundColor && `bg-${local.backgroundColor}`,
      local.border && `border-t border-${borderColorValue()}`,
      clsx({
        "bg-neutral": local.backgroundColor === "neutral",
        "bg-primary": local.backgroundColor === "primary",
        "bg-secondary": local.backgroundColor === "secondary",
        "bg-accent": local.backgroundColor === "accent",
        "bg-info": local.backgroundColor === "info",
        "bg-success": local.backgroundColor === "success",
        "bg-warning": local.backgroundColor === "warning",
        "bg-error": local.backgroundColor === "error",
      })
    );

  const resolvedChildren = resolveChildren(() => local.children);

  const innerElement = createMemo(() => {
    const childrenArray = Array.isArray(resolvedChildren())
      ? (resolvedChildren() as any[])
      : [resolvedChildren()];

    const firstChild = childrenArray[0];

    if (
      childrenArray.length === 1 &&
      typeof firstChild === "object" &&
      firstChild != null &&
      "type" in firstChild
    ) {
      const existingClass =
        firstChild.props?.class || firstChild.props?.className || "";
      const mergedClass = twMerge(innerClasses(), existingClass);

      return {
        ...firstChild,
        props: {
          ...firstChild.props,
          class: mergedClass,
        },
      };
    }

    return <div class={innerClasses()}>{resolvedChildren()}</div>;
  });

  return (
    <div
      aria-label="Window mockup"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {innerElement()}
    </div>
  );
};

export default WindowMockup;

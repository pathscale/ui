import {
  type JSX,
  type ParentComponent,
  splitProps,
  children as resolveChildren,
} from "solid-js";
import clsx from "clsx";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";
import { createMemo } from "solid-js";

export type BrowserMockupProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "ref"
> &
  IComponentBaseProps & {
    url: string;
    variant?: "border" | "background";
    inputClassName?: string;
    innerClassName?: string;
  };

const BrowserMockup: ParentComponent<BrowserMockupProps> = (props) => {
  const [local, others] = splitProps(props, [
    "dataTheme",
    "class",
    "className",
    "inputClassName",
    "innerClassName",
    "children",
    "url",
    "variant",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);
  const variant = () => local.variant ?? "border";

  const classes = createMemo(() =>
    twMerge(
      "mockup-browser border",
      clsx({
        "border-base-300": variant() === "border",
        "bg-base-300": variant() === "background",
      }),
      local.class,
      local.className
    )
  );

  const inputClasses = createMemo(() =>
    twMerge(
      "input",
      clsx({
        "border-base-300": variant() === "border",
      }),
      local.inputClassName
    )
  );

  const innerClasses = createMemo(() =>
    twMerge(
      "flex justify-center px-4 py-16",
      clsx({
        "border-t border-base-300": variant() === "border",
        "bg-base-200": variant() === "background",
      }),
      local.innerClassName
    )
  );

  return (
    <div {...others} data-theme={local.dataTheme} class={classes()}>
      <div class="mockup-browser-toolbar">
        <div class="input">
          <input
            type="text"
            value={local.url}
            readonly
            class={inputClasses()}
          />
        </div>
      </div>
      <div class={innerClasses()}>{resolvedChildren()}</div>
    </div>
  );
};

export default BrowserMockup;

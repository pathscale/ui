import { type JSX, splitProps, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type {
  IComponentBaseProps,
} from "../types";
import {
  fieldWrapper,
  labelStyles,
  messageStyles,
} from "./Field.styles";

type ElementType = keyof JSX.IntrinsicElements;

type FieldBaseProps = {
  /** Label text */
  label?: string;
  /** Helper or error message */
  message?: string;
  /** Visual intent */
  type?: "default" | "danger";
  /** Layout direction */
  horizontal?: boolean;
  /** Font/control size */
  size?: "sm" | "md" | "lg";
  /** Grouped inputs */
  grouped?: boolean;
  /** Multiline grouping */
  groupMultiline?: boolean;
  /** Root element */
  as?: ElementType;
  children: JSX.Element;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type FieldProps<E extends ElementType = "div"> = Omit<
  PropsOf<E>,
  keyof FieldBaseProps
> &
  FieldBaseProps &
  IComponentBaseProps;

const VoidElementList: ElementType[] = [
  "area","base","br","col","embed","hr","img","input","link","keygen",
  "meta","param","source","track","wbr",
];

const Field = <E extends ElementType = "div">(props: FieldProps<E>): JSX.Element => {
  const [local, others] = splitProps(
    props as FieldBaseProps & Record<string, unknown>,
    [
      "label",
      "message",
      "type",
      "horizontal",
      "size",
      "grouped",
      "groupMultiline",
      "as",
      "children",
      "class",
      "className",
      "style",
    ]
  );

  const Tag = local.as || "div";

  const wrapperClass = () =>
    twMerge(
      fieldWrapper({
        type: local.type,
        horizontal: local.horizontal,
        size: local.size,
        grouped: local.grouped,
        groupMultiline: local.groupMultiline,
      }),
      local.class,
      local.className
    );

  return VoidElementList.includes(Tag)
    ? (
      <Dynamic
        component={Tag}
        {...others}
        class={wrapperClass()}
        style={local.style}
      />
    )
    : (
      <Dynamic component={Tag} {...others} class={wrapperClass()} style={local.style}>
        <Show when={local.label}>
          <label class={labelStyles({
            type: local.type,
            size: local.size,
          })}>
            {local.label}
          </label>
        </Show>

        <div class={clsx(local.horizontal && "flex items-center gap-2")}>
          {local.children}
        </div>

        <Show when={local.message}>
          <span class={messageStyles({ type: local.type })}>
            {local.message}
          </span>
        </Show>
      </Dynamic>
    );
};

export default Field;

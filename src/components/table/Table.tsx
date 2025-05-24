import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";
import { clsx } from "clsx";

import type { IComponentBaseProps, ComponentSize } from "../types";
import TableHead from "./TableHead";
import TableBody from "./TableBody";
import TableRow from "./TableRow";
import TableFooter from "./TableFooter";

type ElementType = keyof JSX.IntrinsicElements;

type TableBaseProps = {
  size?: ComponentSize;
  zebra?: boolean;
  pinRows?: boolean;
  pinCols?: boolean;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  dataTheme?: string;
  children?: JSX.Element;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type TableProps<E extends ElementType = "table"> = Omit<
  PropsOf<E>,
  keyof TableBaseProps
> &
  TableBaseProps &
  IComponentBaseProps;

// Void elements (though tables rarely use these)
const VoidElementList: ElementType[] = [
  "area","base","br","col","embed","hr","img","input","link","keygen",
  "meta","param","source","track","wbr",
];

const TableComponent = <E extends ElementType = "table">(
  props: TableProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as TableBaseProps & Record<string, unknown>,
    [
      "children",
      "size",
      "zebra",
      "pinRows",
      "pinCols",
      "as",
      "class",
      "className",
      "style",
      "dataTheme",
    ]
  );

  const Tag = local.as || ("table" as ElementType);

  const classes = () =>
    twMerge(
      "table",
      local.class,
      local.className,
      clsx({
        "table-zebra": local.zebra,
        "table-xl": local.size === "xl",
        "table-lg": local.size === "lg",
        "table-md": local.size === "md",
        "table-sm": local.size === "sm",
        "table-xs": local.size === "xs",
        "table-pin-rows": local.pinRows,
        "table-pin-cols": local.pinCols,
      })
    );

  if (VoidElementList.includes(Tag)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        data-theme={local.dataTheme}
        class={classes()}
        style={local.style}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
      style={local.style}
    >
      {local.children}
    </Dynamic>
  );
};

// Assign subcomponents and type them
const Table = Object.assign(TableComponent, {
  Head: TableHead,
  Body: TableBody,
  Row: TableRow,
  Footer: TableFooter,
});

export default Table;
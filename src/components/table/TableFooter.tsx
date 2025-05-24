import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import type { IComponentBaseProps } from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type TableFooterBaseProps = {
  /** don't wrap children in th/td */
  noCell?: boolean;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  /** expect an array of cells or raw content */
  children?: JSX.Element[];
  "data-theme"?: string;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type TableFooterProps<E extends ElementType = "tfoot"> = Omit<
  PropsOf<E>,
  keyof TableFooterBaseProps
> &
  TableFooterBaseProps &
  IComponentBaseProps;

const VoidElementList: ElementType[] = [
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "keygen", "meta", "param", "source", "track", "wbr",
];

const TableFooter = <E extends ElementType = "tfoot">(
  props: TableFooterProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as TableFooterBaseProps & Record<string, unknown>,
    ["children", "noCell", "as", "class", "className", "style", "data-theme"]
  );

  const Tag = local.as || ("tfoot" as E);

  const cells = local.noCell
    ? local.children
    : local.children?.map((child, i) =>
        i === 0
          ? <th key={i}>{child}</th>
          : <td key={i}>{child}</td>
      );

  const classAttr = local.class ?? local.className;

  if (VoidElementList.includes(Tag)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        class={classAttr}
        style={local.style}
        data-theme={local["data-theme"]}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...others}
      class={classAttr}
      style={local.style}
      data-theme={local["data-theme"]}
    >
      <tr>{cells}</tr>
    </Dynamic>
  );
};

export default TableFooter;

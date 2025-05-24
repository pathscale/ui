import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

type ElementType = keyof JSX.IntrinsicElements;

type TableHeadBaseProps = {
  /** don't wrap children in th/td */
  noCell?: boolean;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element[];
  "data-theme"?: string;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type TableHeadProps<E extends ElementType = "thead"> = Omit<
  PropsOf<E>,
  keyof TableHeadBaseProps
> &
  TableHeadBaseProps;

const VoidElementList: ElementType[] = [
  "area","base","br","col","embed","hr","img","input","link","keygen",
  "meta","param","source","track","wbr",
];

const TableHead = <E extends ElementType = "thead">(
  props: TableHeadProps<E>
): JSX.Element => {
  const [local, others] = splitProps(
    props as TableHeadBaseProps & Record<string, unknown>,
    ["children", "noCell", "as", "class", "className", "style", "data-theme"]
  );

  const Tag = local.as || ("thead" as E);

  const cells = local.noCell
    ? local.children
    : local.children?.map((child, i) =>
        i === 0
          ? <th>{child}</th>
          : <td>{child}</td>
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

export default TableHead;

import { type JSX, splitProps, children as resolveChildren } from "solid-js";
import { Dynamic } from "solid-js/web";
import type { ValidComponent } from "solid-js";

type ElementType = keyof JSX.IntrinsicElements;

type TableRowBaseProps = {
  noCell?: boolean;
  as?: ElementType;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
  "data-theme"?: string;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type TableRowProps<E extends ElementType = "tr"> = Omit<
  PropsOf<E>,
  keyof TableRowBaseProps
> &
  TableRowBaseProps;

const VoidElementList: ElementType[] = [
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "keygen",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
];

const TableRow = <E extends ElementType = "tr">(
  props: TableRowProps<E>
): JSX.Element => {
  const [local, others] = splitProps(props, [
    "children",
    "noCell",
    "as",
    "class",
    "className",
    "style",
    "data-theme",
  ]);

  const Tag = (local.as || "tr") as ValidComponent;
  const resolved = resolveChildren(() => local.children);
  const childrenArray = resolved.toArray();

  const cells = local.noCell
    ? childrenArray
    : childrenArray.map((child) => <td>{child}</td>);

  const classAttr = local.class ?? local.className;

  if (VoidElementList.includes(Tag as ElementType)) {
    return (
      <Dynamic
        component={Tag}
        {...(others as Record<string, any>)}
        class={classAttr}
        style={local.style}
        data-theme={local["data-theme"]}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...(others as Record<string, any>)}
      class={classAttr}
      style={local.style}
      data-theme={local["data-theme"]}
    >
      {cells}
    </Dynamic>
  );
};

export default TableRow;

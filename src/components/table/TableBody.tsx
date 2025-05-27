import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

export type TableBodyProps<E extends keyof JSX.IntrinsicElements = "tbody"> = Omit<
  JSX.IntrinsicElements[E],
  "class" | "className"
> & {
  as?: E;
  class?: string;
  className?: string;
  style?: JSX.CSSProperties;
  children?: JSX.Element;
  "data-theme"?: string;
};

const VoidElementList: (keyof JSX.IntrinsicElements)[] = [
  "area","base","br","col","embed","hr","img","input","link","keygen",
  "meta","param","source","track","wbr",
];

const TableBody = <E extends keyof JSX.IntrinsicElements = "tbody">(
  props: TableBodyProps<E>
): JSX.Element => {
  const [local, others] = splitProps(props as TableBodyProps, [
    "as",
    "class",
    "className",
    "style",
    "children",
    "data-theme",
  ]);

  const Tag = local.as || ("tbody" as E);

  if (VoidElementList.includes(Tag)) {
    return (
      <Dynamic
        component={Tag}
        {...others}
        class={local.class ?? local.className}
        style={local.style}
        data-theme={local["data-theme"]}
      />
    );
  }

  return (
    <Dynamic
      component={Tag}
      {...others}
      class={local.class ?? local.className}
      style={local.style}
      data-theme={local["data-theme"]}
    >
      {local.children}
    </Dynamic>
  );
};

export default TableBody;

import {
  type Component,
  type JSX,
  splitProps,
  children,
  createMemo,
  untrack,
} from "solid-js";
import { breadcrumbContainerVariants } from "./Breadcrumb.styles";
import type { VariantProps } from "@src/lib/style";

type SeparatorType = "arrow" | "dot" | "bullet" | "succeeds";

const separatorMap: Record<SeparatorType, string> = {
  arrow: "→",
  dot: "·",
  bullet: "•",
  succeeds: "»",
};

type BreadcrumbProps = {
  children?: JSX.Element;
} & VariantProps<typeof breadcrumbContainerVariants> &
  JSX.HTMLAttributes<HTMLElement>;

const Breadcrumb: Component<BreadcrumbProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    ["children"],
    ["alignment", "size", "separator"]
  );

  const resolvedChildren = children(() => local.children);
  const items = createMemo(() => resolvedChildren.toArray());

  const separator = createMemo(() =>
    untrack(() => {
      const sep = variantProps.separator as SeparatorType;
      return sep && separatorMap[sep] ? separatorMap[sep] : "/";
    })
  );

  const containerClasses = createMemo(() =>
    breadcrumbContainerVariants(variantProps)
  );

  const renderItems = createMemo(() => {
    return items().reduce<JSX.Element[]>((acc, item, idx) => {
      if (idx > 0) {
        acc.push(
          <li class="text-gray-400 select-none" aria-hidden="true">
            {separator()}
          </li>
        );
      }
      acc.push(
        <li>
          <span aria-current={idx === items().length - 1 ? "page" : undefined}>
            {item}
          </span>
        </li>
      );
      return acc;
    }, []);
  });

  return (
    <nav class={containerClasses()} aria-label="Breadcrumb" {...otherProps}>
      <ol class="flex items-center flex-wrap gap-1">{renderItems()}</ol>
    </nav>
  );
};

export default Breadcrumb;

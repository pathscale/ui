import { type Component, type JSX, splitProps, children } from "solid-js";
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
  const items = resolvedChildren.toArray();

  const separator =
    variantProps.separator && separatorMap[variantProps.separator]
      ? separatorMap[variantProps.separator]
      : "/";

  return (
    <nav
      class={breadcrumbContainerVariants(variantProps)}
      aria-label="Breadcrumb"
      {...otherProps}
    >
      <ul class="flex items-center flex-wrap gap-1">
        {items.reduce<JSX.Element[]>((acc, item, idx) => {
          if (idx > 0) {
            acc.push(<li class="text-gray-400 select-none">{separator}</li>);
          }
          acc.push(<li>{item}</li>);
          return acc;
        }, [])}
      </ul>
    </nav>
  );
};

export default Breadcrumb;

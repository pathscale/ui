import { type Component, type JSX, splitProps } from "solid-js";
import { breadcrumbItemVariants } from "./Breadcrumb.styles";
import type { VariantProps } from "@src/lib/style";

export type BreadcrumbItemProps = {
  children?: JSX.Element;
  href?: string;
  active?: boolean;
} & VariantProps<typeof breadcrumbItemVariants>;

const BreadcrumbItem: Component<BreadcrumbItemProps> = (props) => {
  const [local, variantProps] = splitProps(
    props,
    ["children", "href", "active"],
    ["active"]
  );

  return (
    <li class="flex items-center gap-1">
      {local.href && !local.active ? (
        <a href={local.href} class={breadcrumbItemVariants(variantProps)}>
          {local.children}
        </a>
      ) : (
        <span class={breadcrumbItemVariants({ active: true })}>
          {local.children}
        </span>
      )}
    </li>
  );
};

export default BreadcrumbItem;

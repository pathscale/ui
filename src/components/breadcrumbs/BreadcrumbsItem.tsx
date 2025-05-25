import { type Component, type JSX, splitProps, Show } from "solid-js";

export type BreadcrumbsItemProps = JSX.HTMLAttributes<HTMLLIElement> & {
  href?: string;
};

const BreadcrumbsItem: Component<BreadcrumbsItemProps> = (props) => {
  const [local, others] = splitProps(props, ["href", "children"]);

  return (
    <li role="link" {...others}>
      <Show when={local.href} fallback={<>{local.children}</>}>
        <a href={local.href}>{local.children}</a>
      </Show>
    </li>
  );
};

export default BreadcrumbsItem;

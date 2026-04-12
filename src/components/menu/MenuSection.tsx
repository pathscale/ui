import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export type MenuSectionRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    title?: JSX.Element;
  };

const MenuSectionRoot: Component<MenuSectionRootProps> = (props) => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "className",
    "dataTheme",
    "style",
    "title",
    "role",
  ]);

  return (
    <div
      {...others}
      role={local.role ?? "group"}
      data-slot="menu-section"
      data-theme={local.dataTheme}
      class={twMerge("menu-section", local.class, local.className)}
      style={local.style}
    >
      <Show when={local.title}>
        <span class="menu-section__title" data-slot="heading">
          {local.title}
        </span>
      </Show>

      {local.children}
    </div>
  );
};

const MenuSection = MenuSectionRoot;

export default MenuSection;
export { MenuSection, MenuSectionRoot };
export type { MenuSectionRootProps as MenuSectionProps };

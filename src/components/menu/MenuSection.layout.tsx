import type { JSX } from "@solidjs/web";
import { type Component, omit, Show } from "solid-js";
import type { Layout } from "../../lib/layouts";
import { twMerge } from "../../lib/twMerge";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, type componentRecipe } from "./Menu.recipe";

export type MenuSectionRootProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> &
  UIBaseProps & {
    children?: JSX.Element;
    title?: JSX.Element;
  };

const MenuSectionRoot: Layout<
  typeof componentRecipe,
  MenuSectionRootProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "title",
    "role",
  );

  return (
    <div
      {...others}
      role={props.role ?? "group"}
      data-slot="menu-section"
      data-theme={props.dataTheme}
      {...{ class: twMerge(CLASSES.Section.base, props.class) }}
      style={props.style}
    >
      <Show when={props.title}>
        <span
          {...{ class: CLASSES.Section.title }}
          data-slot="heading"
        >
          {props.title}
        </span>
      </Show>

      {props.children}
    </div>
  );
};

const MenuSection = MenuSectionRoot;

export default MenuSection;
export type { MenuSectionRootProps as MenuSectionProps };
export { MenuSection, MenuSectionRoot };

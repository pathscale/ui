import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { UIBaseProps } from "../vocabulary";
import { CLASSES } from "./ListBox.recipe";
import type { Layout } from "../../lib/layouts";
import { componentRecipe } from "./ListBox.recipe";

export type ListBoxSectionRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  UIBaseProps & {
    children?: JSX.Element;
    title?: JSX.Element;
  };

const ListBoxSectionRoot: Layout<typeof componentRecipe, ListBoxSectionRootProps> = () => {
  const [local, others] = splitProps(props, [
    "children",
    "class",
    "dataTheme",
    "style",
    "title",
    "role",
  ]);

  return (
    <div
      {...others}
      role={local.role ?? "group"}
      data-slot="listbox-section"
      data-theme={local.dataTheme}
      {...{ class: twMerge(CLASSES.Section.base, local.class) }}
      style={local.style}
    >
      <Show when={local.title}>
        <span {...{ class: CLASSES.Section.title }} data-slot="heading">
          {local.title}
        </span>
      </Show>

      {local.children}
    </div>
  );
};

const ListBoxSection = ListBoxSectionRoot;

export default ListBoxSection;
export { ListBoxSection, ListBoxSectionRoot };
export type { ListBoxSectionRootProps as ListBoxSectionProps };

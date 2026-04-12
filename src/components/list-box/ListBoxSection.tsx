import { Show, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { CLASSES } from "./ListBox.classes";

export type ListBoxSectionRootProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> &
  IComponentBaseProps & {
    children?: JSX.Element;
    title?: JSX.Element;
  };

const ListBoxSectionRoot: Component<ListBoxSectionRootProps> = (props) => {
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
      data-slot="listbox-section"
      data-theme={local.dataTheme}
      class={twMerge(CLASSES.Section.base, local.class, local.className)}
      style={local.style}
    >
      <Show when={local.title}>
        <span class={CLASSES.Section.title} data-slot="heading">
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

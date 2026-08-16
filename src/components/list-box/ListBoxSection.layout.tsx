import {Show, omit, type Component} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";

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
  const others = omit(props, "children", "class", "dataTheme", "style", "title", "role");

  return (
    <div
      {...others}
      role={props.role ?? "group"}
      data-slot="listbox-section"
      data-theme={props.dataTheme}
      {...{ class: twMerge(CLASSES.Section.base, props.class) }}
      style={props.style}
    >
      <Show when={props.title}>
        <span {...{ class: CLASSES.Section.title }} data-slot="heading">
          {props.title}
        </span>
      </Show>

      {props.children}
    </div>
  );
};

const ListBoxSection = ListBoxSectionRoot;

export default ListBoxSection;
export { ListBoxSection, ListBoxSectionRoot };
export type { ListBoxSectionRootProps as ListBoxSectionProps };

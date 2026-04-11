import ListBoxRoot from "./ListBox";
import ListBoxItem, {
  ListBoxItemIndicator,
  ListBoxItemRoot,
  type ListBoxItemIndicatorProps,
  type ListBoxItemProps,
  type ListBoxItemRenderProps,
  type ListBoxItemRootProps,
} from "./ListBoxItem";
import ListBoxSection, {
  ListBoxSectionRoot,
  type ListBoxSectionProps,
  type ListBoxSectionRootProps,
} from "./ListBoxSection";

const ListBox = Object.assign(ListBoxRoot, {
  Root: ListBoxRoot,
  Item: ListBoxItem,
  ItemIndicator: ListBoxItemIndicator,
  Section: ListBoxSection,
});

export default ListBox;

export {
  ListBox,
  ListBoxRoot,
  ListBoxItem,
  ListBoxItemRoot,
  ListBoxItemIndicator,
  ListBoxSection,
  ListBoxSectionRoot,
};

export type { ListBoxProps, ListBoxRootProps } from "./ListBox";
export type { ListBoxSelectionMode, ListBoxVariant } from "./context";
export type {
  ListBoxItemProps,
  ListBoxItemRootProps,
  ListBoxItemIndicatorProps,
  ListBoxItemRenderProps,
  ListBoxSectionProps,
  ListBoxSectionRootProps,
};

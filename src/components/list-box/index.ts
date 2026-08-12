import ListBoxRoot from "./ListBox.generated";
import ListBoxItem, {
  ListBoxItemIndicator,
  ListBoxItemRoot,
  type ListBoxItemIndicatorProps,
  type ListBoxItemProps,
  type ListBoxItemRenderProps,
  type ListBoxItemRootProps,
} from "./ListBoxItem.generated";
import ListBoxSection, {
  ListBoxSectionRoot,
  type ListBoxSectionProps,
  type ListBoxSectionRootProps,
} from "./ListBoxSection.generated";

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

export type { ListBoxProps, ListBoxRootProps } from "./ListBox.generated";
export type { ListBoxSelectionMode, ListBoxVariant } from "./context";
export type {
  ListBoxItemProps,
  ListBoxItemRootProps,
  ListBoxItemIndicatorProps,
  ListBoxItemRenderProps,
  ListBoxSectionProps,
  ListBoxSectionRootProps,
};

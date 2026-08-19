import ListBoxRoot from "./ListBox.generated";
import ListBoxItem, {
  ListBoxItemIndicator,
  type ListBoxItemIndicatorProps,
  type ListBoxItemProps,
  type ListBoxItemRenderProps,
  ListBoxItemRoot,
  type ListBoxItemRootProps,
} from "./ListBoxItem.generated";
import ListBoxSection, {
  type ListBoxSectionProps,
  ListBoxSectionRoot,
  type ListBoxSectionRootProps,
} from "./ListBoxSection.generated";

const ListBox = Object.assign(ListBoxRoot, {
  Root: ListBoxRoot,
  Item: ListBoxItem,
  ItemIndicator: ListBoxItemIndicator,
  Section: ListBoxSection,
});

export default ListBox;

export type { ListBoxSelectionMode, ListBoxVariant } from "./context";

export type { ListBoxProps, ListBoxRootProps } from "./ListBox.generated";
export type {
  ListBoxItemIndicatorProps,
  ListBoxItemProps,
  ListBoxItemRenderProps,
  ListBoxItemRootProps,
  ListBoxSectionProps,
  ListBoxSectionRootProps,
};
export {
  ListBox,
  ListBoxItem,
  ListBoxItemIndicator,
  ListBoxItemRoot,
  ListBoxRoot,
  ListBoxSection,
  ListBoxSectionRoot,
};

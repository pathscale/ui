import { type JSX, type Component } from "solid-js";
import { dropdownItemVariants } from "./Dropdown.styles";

interface DropdownItemProps {
  hasLink?: boolean;
  children: JSX.Element;
}

const DropdownItem: Component<DropdownItemProps> = ({ hasLink = false, children }) => {
  return (
    <div class={dropdownItemVariants({ hasLink })}>
      {children}
    </div>
  );
};

export default DropdownItem;
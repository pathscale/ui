import { useContext, type Component, type JSX } from "solid-js";
import { DropdownContext } from "./DropdownContext";
import { dropdownItemClass } from "./Dropdown.styles";

type DropdownItemProps = {
  children: JSX.Element;
  onClick?: () => void;
  value?: string;
  disabled?: boolean;
};

const DropdownItem: Component<DropdownItemProps> = (props) => {
  const context = useContext(DropdownContext);

  const handleClick = () => {
    if (!props.disabled) {
      props.onClick?.();
      context?.setOpen(false);
    }
  };

  return (
    <div
      role="menuitem"
      onClick={handleClick}
      class={dropdownItemClass({ disabled: props.disabled })}
    >
      {props.children}
    </div>
  );
};

export default DropdownItem;

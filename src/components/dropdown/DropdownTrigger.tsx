import { type Component, useContext, type JSX } from "solid-js";
import { DropdownContext } from "./DropdownContext";
import { dropdownTriggerClass } from "./Dropdown.styles";

const DropdownTrigger: Component<{ children: JSX.Element }> = (props) => {
  const context = useContext(DropdownContext);

  const handleClick = () => {
    if (!context?.hoverable && !context?.disabled) {
      context?.setOpen(!context.open());
    }
  };

  return (
    <div
      onClick={handleClick}
      class={dropdownTriggerClass({
        disabled: context?.disabled,
        hoverable: context?.hoverable,
      })}
    >
      {props.children}
    </div>
  );
};

export default DropdownTrigger;

import { createSignal, type Component, type JSX } from "solid-js";
import { DropdownContext } from "./DropdownContext";
import { dropdownRootClass } from "./Dropdown.styles";

type DropdownProps = {
  children: JSX.Element;
  hoverable?: boolean;
  disabled?: boolean;
  position?: "left" | "right" | "top-left" | "top-right";
};

const Dropdown: Component<DropdownProps> = (props) => {
  const [open, setOpen] = createSignal(false);

  const context = {
    open,
    setOpen,
    disabled: props.disabled,
    hoverable: props.hoverable,
    position: props.position ?? "left",
  };

  return (
    <DropdownContext.Provider value={context}>
      <div
        class={dropdownRootClass()}
        onMouseEnter={props.hoverable ? () => setOpen(true) : undefined}
        onMouseLeave={props.hoverable ? () => setOpen(false) : undefined}
      >
        {props.children}
      </div>
    </DropdownContext.Provider>
  );
};

export default Dropdown;

import { Show, useContext, type Component, type JSX } from "solid-js";
import { DropdownContext } from "./DropdownContext";
import { dropdownMenuClass } from "./Dropdown.styles";

const DropdownMenu: Component<{ children: JSX.Element }> = (props) => {
  const context = useContext(DropdownContext);

  return (
    <Show when={context?.open?.()}>
      <div class={dropdownMenuClass({ position: context?.position })}>
        {props.children}
      </div>
    </Show>
  );
};

export default DropdownMenu;

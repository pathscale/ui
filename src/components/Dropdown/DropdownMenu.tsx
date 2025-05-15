import { splitProps, type Component, type JSX } from "solid-js";
import type { VariantProps } from "@src/lib/style";
import { dropdownVariants } from "./Dropdown.styles";

export interface DropdownMenuProps
  extends VariantProps<typeof dropdownVariants>,  // open + position only
          JSX.HTMLAttributes<HTMLDivElement> {   // allow id, data-*, aria-*, etc.
  children: JSX.Element;
}

const DropdownMenu: Component<DropdownMenuProps> = props => {
  const [local, other] = splitProps(props, ["open","position","children"]);
  return (
    <div
      class={dropdownVariants({ open: local.open, position: local.position })}
      {...other}
    >
      <div class="flex flex-col">{local.children}</div>
    </div>
  );
};

export default DropdownMenu;

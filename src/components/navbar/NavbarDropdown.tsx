import { type Component, splitProps, type JSX, Show } from "solid-js";
import { navbarDropdownClass, dropdownMenuClass } from "./Navbar.styles";
import { classes } from "@src/lib/style";

type NavbarDropdownProps = {
  label: string;
  hoverable?: boolean;
  align?: "left" | "right";
  class?: string;
  children: JSX.Element;
};

const NavbarDropdown: Component<NavbarDropdownProps> = (props) => {
  const [local, rest] = splitProps(props, [
    "label",
    "hoverable",
    "align",
    "class",
    "children",
  ]);

  return (
    <div
      class={classes(
        navbarDropdownClass({ hoverable: local.hoverable }),
        local.class
      )}
      {...rest}
    >
      <div class="cursor-pointer px-4 py-2 rounded hover:bg-white/10">
        {local.label}
      </div>
      <Show when={local.hoverable}>
        <div class={dropdownMenuClass({ align: local.align })}>
          {local.children}
        </div>
      </Show>
    </div>
  );
};

export default NavbarDropdown;

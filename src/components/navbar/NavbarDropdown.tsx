import {
    type Component,
    splitProps,
    type JSX,
    Show,
  } from "solid-js";
  import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
  import {
    navbarDropdownStyles,
    dropdownMenuStyles,
  } from "./Navbar.styles";
  
  export type NavbarDropdownProps = {
    label: string;
    hoverable?: boolean;
    align?: "left" | "right";
    className?: string;
    children: JSX.Element;
  } & VariantProps<typeof navbarDropdownStyles> &
    VariantProps<typeof dropdownMenuStyles> &
    ClassProps;
  
  const NavbarDropdown: Component<NavbarDropdownProps> = (props) => {
    const [local, variantProps, other] = splitProps(
      props,
      ["class","className","label","hoverable","children"] as const,
      [
        ...Object.keys(navbarDropdownStyles.variantKeys ?? {}),
        ...Object.keys(dropdownMenuStyles.variantKeys ?? {}),
      ] as any
    );
  
    return (
      <div
        class={classes(
          navbarDropdownStyles({ hoverable: !!local.hoverable }),
          local.class,
          local.className
        )}
        {...other}
      >
        <div class="cursor-pointer">{local.label}</div>
        <Show when={local.hoverable}>
          <div class={dropdownMenuStyles({ align: variantProps.align })}>
            {local.children}
          </div>
        </Show>
      </div>
    );
  };
  
  export default NavbarDropdown;
  
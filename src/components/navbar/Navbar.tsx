import {
  type Component,
  createSignal,
  splitProps,
  type JSX,
  createEffect,
} from "solid-js";
import { NavbarContext } from "./NavbarContext";
import { navbarClass } from "./Navbar.styles";

export type NavbarProps = {
  color?: "primary" | "info" | "success" | "danger" | "warning" | "light";
  modelValue?: string;
  spaced?: boolean;
  shadow?: boolean;
  transparent?: boolean;
  fixedTop?: boolean;
  fixedBottom?: boolean;
  children?: JSX.Element;
  onChange?: (val: string) => void;
};

const Navbar: Component<NavbarProps> = (props) => {
  const [local] = splitProps(props, [
    "color",
    "modelValue",
    "children",
    "spaced",
    "shadow",
    "transparent",
    "fixedTop",
    "fixedBottom",
  ]);

  const [selected, setSelected] = createSignal(props.modelValue);

  createEffect(() => {
    if (props.modelValue !== undefined) {
      setSelected(props.modelValue);
    }
  });

  return (
    <NavbarContext.Provider
      value={{
        color: local.color ?? "primary",
        selected,
        setSelected: (val: string) => {
          props.onChange?.(val);
          setSelected(val);
        },
      }}
    >
      <nav
        class={navbarClass({
          color: local.color,
          spaced: local.spaced,
          shadow: local.shadow,
          transparent: local.transparent,
          fixedTop: local.fixedTop,
          fixedBottom: local.fixedBottom,
        })}
      >
        {local.children}
      </nav>
    </NavbarContext.Provider>
  );
};

export default Navbar;

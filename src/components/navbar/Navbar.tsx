import {
  type Component,
  splitProps,
  type JSX,
  Show,
} from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import { navbarStyles } from "./Navbar.styles";

// Named‐slot props: brand, start, end
export type NavbarProps = {
  brand?: JSX.Element;
  start?: JSX.Element;
  end?: JSX.Element;
  className?: string;
} & VariantProps<typeof navbarStyles> &
  ClassProps &
  JSX.HTMLAttributes<HTMLElement>;

const Navbar: Component<NavbarProps> = (props) => {
  const [local, variantProps, other] = splitProps(
    props,
    ["class", "className", "brand", "start", "end"] as const,
    Object.keys(navbarStyles.variantKeys ?? {}) as any
  );

  return (
    <nav
      class={classes(
        navbarStyles({ color: variantProps.color }),
        local.class,
        local.className
      )}
      {...other}
    >
      <Show when={local.brand}>
        <div class="flex-shrink-0 mr-4">{local.brand}</div>
      </Show>

      <Show when={local.start}>
        <div class="flex-1 flex items-center space-x-2">{local.start}</div>
      </Show>

      <Show when={local.end}>
        <div class="flex-1 flex justify-end space-x-2">{local.end}</div>
      </Show>
    </nav>
  );
};

export default Navbar;

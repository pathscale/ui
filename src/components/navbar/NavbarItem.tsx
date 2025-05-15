import {
    type Component,
    splitProps,
    type JSX,
} from "solid-js";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";
import { navbarItemStyles } from "./Navbar.styles";
import { Dynamic } from "solid-js/web";

export type NavbarItemProps = {
    active?: boolean;
    href?: string;
    tag?: "a" | "div";
    to?: string;            // for router-link style
    className?: string;
    children: JSX.Element;
} & VariantProps<typeof navbarItemStyles> &
    ClassProps &
    Omit<JSX.HTMLAttributes<HTMLElement>, "children">;

const NavbarItem: Component<NavbarItemProps> = (props) => {
    const [local, variantProps, other] = splitProps(
        props,
        [
            "class", "className", "active", "href", "tag", "to", "children"
        ] as const,
        Object.keys(navbarItemStyles.variantKeys ?? {}) as any
    );

    const Tag = local.tag === "a" || local.href || local.to ? "a" : "div";

    return (
        <Dynamic
            component={Tag}
            class={classes(
                navbarItemStyles({
                    active: !!local.active,
                    tag: local.tag ?? (Tag === "a" ? "a" : "div"),
                }),
                local.class,
                local.className
            )}
            href={local.href ?? local.to}
            {...other}
        >
            {local.children}
        </Dynamic>
    );
};

export default NavbarItem;

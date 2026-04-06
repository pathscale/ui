import { type JSX, mergeProps, splitProps, useContext } from "solid-js";
import { DropdownContext } from "./dropdownContext";

type AnchorProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  closeOnClick?: boolean;
  anchor?: true;
};

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  closeOnClick?: boolean;
  anchor?: false;
};

type NoAnchorProps = {
  children?: JSX.Element;
  anchor?: false;
  closeOnClick?: boolean;
};

export type DropdownItemProps = (AnchorProps | ButtonProps | NoAnchorProps) & {
  id?: string;
  "aria-selected"?: boolean;
  role?: JSX.HTMLAttributes<HTMLLIElement>["role"];
};

const DropdownItem = (props: DropdownItemProps): JSX.Element => {
  const dropdownContext = useContext(DropdownContext);

  const defaultProps = mergeProps(
    {
      closeOnClick: true,
    },
    props,
  );

  const [local, others] = splitProps(defaultProps, [
    "anchor",
    "children",
    "id",
    "aria-selected",
    "role",
    "closeOnClick",
  ]);

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();

    const originalOnClick = (others as AnchorProps | ButtonProps).onClick;
    if (typeof originalOnClick === "function") {
      originalOnClick(e as any);
    }

    if (dropdownContext && local.closeOnClick) {
      dropdownContext.setOpen(false);
    }
  };

  return (
    <li
      id={local.id}
      role={local.role ?? "menuitem"}
      aria-selected={local["aria-selected"]}
    >
      {local.anchor ? (
        <a
          {...(others as AnchorProps)}
          onClick={handleClick}
        >
          {local.children}
        </a>
      ) : (
        <button
          {...(others as ButtonProps)}
          onClick={handleClick}
          type="button"
        >
          {local.children}
        </button>
      )}
    </li>
  );
};

export default DropdownItem;

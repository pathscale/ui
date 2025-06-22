import { type JSX, mergeProps, splitProps, useContext } from "solid-js";
import { DropdownContext } from "./Dropdown";

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
  "aria-selected"?: boolean;
};

const DropdownItem = (props: DropdownItemProps): JSX.Element => {
  const dropdownContext = useContext(DropdownContext);

  const defaultProps = mergeProps({
    closeOnClick: true,
  }, props);

  const [local, others] = splitProps(defaultProps, [
    "anchor",
    "children",
    "aria-selected",
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
    <li role="menuitem" aria-selected={local["aria-selected"]}>
      {local.anchor ? (
        <a {...(others as AnchorProps)} onClick={handleClick}>
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

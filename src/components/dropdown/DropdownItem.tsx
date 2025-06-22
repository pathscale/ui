import { type JSX, splitProps, useContext } from "solid-js";
import { DropdownContext } from "./Dropdown";

type AnchorProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  anchor?: true;
};

type ButtonProps = JSX.ButtonHTMLAttributes<HTMLButtonElement> & {
  anchor?: false;
};

type NoAnchorProps = {
  children?: JSX.Element;
  anchor?: false;
};

export type DropdownItemProps = (AnchorProps | ButtonProps | NoAnchorProps) & {
  "aria-selected"?: boolean;
};

const DropdownItem = (props: DropdownItemProps): JSX.Element => {
  const dropdownContext = useContext(DropdownContext);

  const [local, others] = splitProps(props, [
    "anchor",
    "children",
    "aria-selected",
  ]);

  const handleClick = (e: MouseEvent) => {
    // Stop propagation to prevent the dropdown toggle from being triggered
    e.stopPropagation();

    // Execute the original onClick if provided
    const originalOnClick = (others as AnchorProps | ButtonProps).onClick;
    if (typeof originalOnClick === "function") {
      originalOnClick(e as any);
    }

    // Close the dropdown
    if (dropdownContext) {
      console.log("closing dropdown");
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

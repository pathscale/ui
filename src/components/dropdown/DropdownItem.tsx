import { type JSX, splitProps } from "solid-js";

type AnchorProps = JSX.AnchorHTMLAttributes<HTMLAnchorElement> & {
  anchor?: true;
};

type NoAnchorProps = {
  children?: JSX.Element;
  anchor?: false;
};

export type DropdownItemProps = (AnchorProps | NoAnchorProps) & {
  "aria-selected"?: boolean;
};

const DropdownItem = (props: DropdownItemProps): JSX.Element => {
  const [local, others] = splitProps(props, [
    "anchor",
    "children",
    "aria-selected",
  ]);

  return (
    <li role="menuitem" aria-selected={local["aria-selected"]}>
      {local.anchor ?? true ? (
        <a {...(others as AnchorProps)}>{local.children}</a>
      ) : (
        local.children
      )}
    </li>
  );
};

export default DropdownItem;

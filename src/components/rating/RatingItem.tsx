import { splitProps } from "solid-js";
import type { JSX } from "solid-js";

export type RatingItemProps = JSX.InputHTMLAttributes<HTMLInputElement> & {
  index?: number;
  selected?: boolean;
  onSelect?: () => void;
};

const RatingItem = (props: RatingItemProps) => {
  const [local, rest] = splitProps(props, ["selected", "onSelect"]);

  return (
    <input
      {...rest}
      type="radio"
      name="rating"
      checked={local.selected}
      onChange={local.onSelect}
    />
  );
};

export default RatingItem;

import { type Component, splitProps } from "solid-js";
import type { JSX } from "solid-js";

export type RatingItemProps = JSX.InputHTMLAttributes<HTMLInputElement>;

const RatingItem: Component<RatingItemProps> = (props) => {
  const [local, rest] = splitProps(props, ["type"]);

  return <input {...rest} type="checkbox" />;
};

export default RatingItem;

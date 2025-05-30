import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import { useRatingContext } from "./Rating";

export type RatingHiddenProps = JSX.InputHTMLAttributes<HTMLInputElement>;

const RatingHidden = (props: RatingHiddenProps) => {
	const [local, rest] = splitProps(props, ["class"]);
	const context = useRatingContext();

	const classes = twMerge("rating-hidden", local.class);

	return (
		<input
			{...rest}
			type="radio"
			name={context.name}
			class={classes}
			checked={context.value === 0}
			onChange={() => context.onChange?.(0)}
		/>
	);
};

export default RatingHidden; 
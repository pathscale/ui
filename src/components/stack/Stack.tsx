import { clsx } from "clsx";
import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

type ElementType = keyof JSX.IntrinsicElements;

type StackBaseProps = {
	reverse?: boolean;
	direction?: "top" | "bottom" | "left" | "right";
	as?: ElementType;
	children?: JSX.Element;
	dataTheme?: string;
	class?: string;
	className?: string;
	style?: JSX.CSSProperties;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type StackProps<E extends ElementType = "div"> = Omit<
	PropsOf<E>,
	keyof StackBaseProps
> &
	StackBaseProps &
	IComponentBaseProps;

const Stack = <E extends ElementType = "div">(
	props: StackProps<E>
): JSX.Element => {
	const [local, others] = splitProps(
		props as StackBaseProps & Record<string, unknown>,
		[
			"children",
			"reverse",
			"direction",
			"dataTheme",
			"class",
			"className",
			"style",
			"as",
		]
	);

	const mapDirectionToClass = (direction?: string) => {
		switch (direction) {
			case "left":
				return "stack-start";
			case "right":
				return "stack-end";
			case "top":
				return "stack-top";
			case "bottom":
				return "stack-bottom";
			default:
				return "";
		}
	};

	const classes = () =>
		twMerge(
			"stack",
			mapDirectionToClass(local.direction),
			local.class,
			local.className,
			clsx({
				"stack-reverse": local.reverse,
			})
		);

	const Tag = local.as || "div";

	return (
		<Dynamic
			component={Tag}
			{...others}
			data-theme={local.dataTheme}
			class={classes()}
			style={local.style}
		>
			{local.children}
		</Dynamic>
	);
};

export default Stack;

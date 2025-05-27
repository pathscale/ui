import { type JSX, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";
import { dividerStyles } from "./Divider.styles";

type ElementType = keyof JSX.IntrinsicElements;

type ColorType = "default" | "neutral" | "primary" | "secondary" | "accent" | "success" | "warning" | "info" | "error";
type PositionType = "center" | "start" | "end";

type DividerBaseProps = {
	text?: string;
	horizontal?: boolean;
	color?: ColorType;
	position?: PositionType;
	as?: ElementType;
	children?: JSX.Element;
	dataTheme?: string;
	class?: string;
	className?: string;
	style?: JSX.CSSProperties;
};

type PropsOf<E extends ElementType> = JSX.IntrinsicElements[E];

export type DividerProps<E extends ElementType = "div"> = Omit<
	PropsOf<E>,
	keyof DividerBaseProps
> &
	DividerBaseProps &
	IComponentBaseProps;

const Divider = <E extends ElementType = "div">(
	props: DividerProps<E>
): JSX.Element => {
	const [local, others] = splitProps(
		props as DividerBaseProps & Record<string, unknown>,
		[
			"children",
			"text",
			"horizontal",
			"color",
			"position",
			"dataTheme",
			"class",
			"className",
			"style",
			"as"
		]
	);

	const classes = () =>
		twMerge(
			dividerStyles({
				horizontal: local.horizontal,
				color: local.color,
				position: local.position,
			}),
			local.class,
			local.className
		);

	const Tag = local.as || "div";
	const content = local.children || local.text;

	return (
		<Dynamic
			component={Tag}
			{...others}
			data-theme={local.dataTheme}
			class={classes()}
			style={local.style}
		>
			{content}
		</Dynamic>
	);
};

export default Divider; 
import { ParentComponent, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export interface FooterProps extends IComponentBaseProps {
	center?: boolean;
	horizontal?: boolean;
	vertical?: boolean;
}

const Footer: ParentComponent<FooterProps> = (props) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"className",
		"dataTheme",
		"center",
		"horizontal",
		"vertical"
	]);

	return (
		<footer
			{...others}
			data-theme={local.dataTheme}
			class={twMerge(
				"footer",
				local.center && "footer-center",
				local.horizontal && "footer-horizontal",
				local.vertical && "footer-vertical",
				local.class,
				local.className
			)}
		>
			{local.children}
		</footer>
	);
};

export interface FooterTitleProps extends IComponentBaseProps { }

export const FooterTitle: ParentComponent<FooterTitleProps> = (props) => {
	const [local, others] = splitProps(props, [
		"children",
		"class",
		"className",
		"dataTheme"
	]);

	return (
		<h6
			{...others}
			data-theme={local.dataTheme}
			class={twMerge("footer-title", local.class, local.className)}
		>
			{local.children}
		</h6>
	);
};

export default Footer; 
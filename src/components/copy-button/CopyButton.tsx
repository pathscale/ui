import { createSignal, splitProps, type Component, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";

import type { IComponentBaseProps } from "../types";

export interface CopyButtonProps extends IComponentBaseProps {
	text: string;
	title?: string;
	onCopy?: () => void;
	children?: JSX.Element;
}

const CopyButton: Component<CopyButtonProps> = (props) => {
	const [local, others] = splitProps(props, [
		"text",
		"title",
		"class",
		"className",
		"onCopy",
		"children",
		"dataTheme"
	]);

	const [copied, setCopied] = createSignal(false);

	const copy = async () => {
		await navigator.clipboard.writeText(local.text);
		setCopied(true);
		local.onCopy?.();
		setTimeout(() => setCopied(false), 2000);
	};

	return (
		<button
			type="button"
			onClick={copy}
			title={local.title || "Copy to clipboard"}
			data-theme={local.dataTheme}
			class={twMerge(
				"btn btn-sm btn-ghost",
				copied() ? "text-success" : "",
				local.class,
				local.className
			)}
			{...others}
		>
			{local.children || (copied() ? "Copied!" : "Copy")}
		</button>
	);
};

export default CopyButton; 
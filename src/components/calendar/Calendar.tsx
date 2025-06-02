import "cally";
import { clsx } from "clsx";
import { type JSX, createEffect, createSignal, createUniqueId } from "solid-js";
import { twMerge } from "tailwind-merge";

import Icon from "../icon/Icon";
import type {
	ComponentSize,
	IComponentBaseProps,
} from "../types";

declare module "solid-js" {
	namespace JSX {
		interface IntrinsicElements {
			"calendar-date": any;
			"calendar-month": any;
		}
	}
}

type CalendarBaseProps = {
	size?: ComponentSize;
	value?: string;
	onDateSelect?: (value: string) => void;
	asInput?: boolean;
	placeholder?: string;
	disabled?: boolean;
	children?: JSX.Element;
	dataTheme?: string;
	class?: string;
	className?: string;
	style?: JSX.CSSProperties;
};

export type CalendarProps = CalendarBaseProps & IComponentBaseProps;

const Calendar = (props: CalendarProps): JSX.Element => {
	const [selectedValue, setSelectedValue] = createSignal(props.value || "");
	const [isOpen, setIsOpen] = createSignal(false);
	const uniqueId = createUniqueId();
	const inputId = `calendar-input-${uniqueId}`;

	let calendarRef: any;
	let inputRef: HTMLButtonElement | undefined;

	createEffect(() => {
		if (props.value !== undefined) {
			setSelectedValue(props.value);
		}
	});

	createEffect(() => {
		if (calendarRef && calendarRef.value !== selectedValue()) {
			calendarRef.value = selectedValue();
		}
	});

	createEffect(() => {
		const shouldSetupListeners = props.asInput ? isOpen() && calendarRef : calendarRef;

		if (shouldSetupListeners) {
			const handleChange = (e: Event) => {
				const target = e.target as any;
				const newValue = target.value;

				if (newValue && newValue !== selectedValue()) {
					setSelectedValue(newValue);

					if (props.onDateSelect) {
						props.onDateSelect(newValue);
					}

					if (props.asInput) {
						setIsOpen(false);
					}
				}
			};

			const handleClick = (e: Event) => {
				setTimeout(() => {
					const value = calendarRef.value;
					if (value && value !== selectedValue()) {
						setSelectedValue(value);
						if (props.onDateSelect) {
							props.onDateSelect(value);
						}
						if (props.asInput) {
							setIsOpen(false);
						}
					}
				}, 100);
			};

			calendarRef.addEventListener("change", handleChange);
			calendarRef.addEventListener("click", handleClick);

			return () => {
				if (calendarRef) {
					calendarRef.removeEventListener("change", handleChange);
					calendarRef.removeEventListener("click", handleClick);
				}
			};
		}
	});

	const calendarClasses = () =>
		twMerge(
			"cally",
			!props.asInput && "bg-base-100 border border-base-300 shadow-lg rounded-box",
			"[&_[slot=heading]]:text-xs [&_[slot=heading]]:font-medium",
			"[&_.cally-month-header]:text-xs [&_.cally-year]:text-xs",
			"text-sm",
			props.asInput && "w-full max-w-full",
			"[&_table]:w-full [&_td]:p-1 [&_th]:p-1",
			"[&_button]:p-1 [&_button]:min-h-0 [&_button]:h-auto",
			props.class,
			props.className,
			clsx({
				"text-base [&_[slot=heading]]:text-sm": props.size === "lg",
				"text-sm [&_[slot=heading]]:text-xs": props.size === "md" || !props.size,
				"text-xs [&_[slot=heading]]:text-xs [&_button]:text-xs": props.size === "sm",
				"text-xs [&_button]:text-xs": props.size === "xs",
			})
		);

	const inputClasses = () =>
		twMerge(
			"input input-bordered cursor-pointer",
			"w-72",
			clsx({
				"input-lg w-80": props.size === "lg",
				"input-md w-72": props.size === "md" || !props.size,
				"input-sm w-64": props.size === "sm",
				"input-xs w-56": props.size === "xs",
				"input-disabled cursor-not-allowed": props.disabled,
			})
		);

	const dropdownClasses = () =>
		twMerge(
			"dropdown-content bg-base-100 rounded-box shadow-lg z-50 p-2",
			"w-auto",
			clsx({
				"w-80": props.size === "lg",
				"w-72": props.size === "md" || !props.size,
				"w-64": props.size === "sm",
				"w-56": props.size === "xs",
			})
		);

	const ArrowLeftIcon = () => (
		<Icon
			name="icon-[mdi-light--chevron-left]"
			width={20}
			height={20}
			{...({ "aria-label": "Previous", slot: "previous" } as any)}
		/>
	);

	const ArrowRightIcon = () => (
		<Icon
			name="icon-[mdi-light--chevron-right]"
			width={20}
			height={20}
			{...({ "aria-label": "Next", slot: "next" } as any)}
		/>
	);

	const formatDisplayDate = (value: string) => {
		if (!value) {
			return props.placeholder || "Pick a date";
		}
		try {
			const date = new Date(value);
			return date.toLocaleDateString();
		} catch {
			return props.placeholder || "Pick a date";
		}
	};

	if (props.asInput) {
		return (
			<div
				data-theme={props.dataTheme}
				style={props.style}
				class="dropdown"
			>
				<button
					ref={inputRef}
					id={inputId}
					class={inputClasses()}
					onClick={() => setIsOpen(!isOpen())}
					disabled={props.disabled}
					type="button"
				>
					{formatDisplayDate(selectedValue())}
				</button>

				{isOpen() && (
					<div
						class={dropdownClasses()}
						onClick={(e) => e.stopPropagation()}
					>
						<div class="w-full">
							<calendar-date
								ref={calendarRef}
								class={calendarClasses()}
								value={selectedValue()}
							>
								<ArrowLeftIcon />
								<ArrowRightIcon />
								<calendar-month />
							</calendar-date>
						</div>
					</div>
				)}

				{isOpen() && (
					<div
						class="fixed inset-0 z-40"
						onClick={() => setIsOpen(false)}
					/>
				)}

				{props.children}
			</div>
		);
	}

	return (
		<div
			data-theme={props.dataTheme}
			style={props.style}
		>
			<calendar-date
				ref={calendarRef}
				class={calendarClasses()}
				value={selectedValue()}
			>
				<ArrowLeftIcon />
				<ArrowRightIcon />
				<calendar-month />
			</calendar-date>
			{props.children}
		</div>
	);
};

export default Calendar; 
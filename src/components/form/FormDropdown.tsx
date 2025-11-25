import {
  type Component,
  Show,
  createMemo,
  splitProps,
  type JSX,
  For,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { useFormValidation } from "./ValidatedForm";
import Form from "./Form";
import Dropdown from "../dropdown";
import Icon from "../icon";

export interface DropdownOption {
  value: string;
  label: string;
}

export interface FormDropdownProps {
  label: string;
  name: string;
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  required?: boolean;
  labelClass?: string;
  errorClass?: string;
  containerClass?: string;
  description?: string;
  descriptionClass?: string;
  class?: string;
  className?: string;
  icon?: JSX.Element;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export const FormDropdown: Component<FormDropdownProps> = (props) => {
  const { errors, touched, setData } = useFormValidation();

  const [local, _] = splitProps(props, [
    "label",
    "name",
    "options",
    "value",
    "placeholder",
    "required",
    "labelClass",
    "errorClass",
    "containerClass",
    "description",
    "descriptionClass",
    "class",
    "className",
    "icon",
    "onChange",
    "disabled",
  ]);

  const containerClasses = createMemo(() =>
    twMerge("flex flex-col gap-2", local.containerClass),
  );

  const descriptionClasses = createMemo(() =>
    twMerge("text-sm text-base-content/70", local.descriptionClass),
  );

  const errorClasses = createMemo(() =>
    twMerge("text-error text-sm", local.errorClass),
  );

  const dropdownClasses = createMemo(() =>
    twMerge(
      "border border-base-300 rounded px-4 py-2 w-full flex justify-between items-center",
      local.disabled ? "opacity-70 cursor-not-allowed" : "",
      local.class,
      local.className,
    ),
  );

  const hasError = createMemo(
    () => touched(local.name) && !!errors(local.name),
  );

  const selectedOption = createMemo(() =>
    local.options.find((opt) => opt.value === local.value),
  );

  const handleSelect = (value: string) => {
    setData(local.name, value);
    if (local.onChange) {
      local.onChange(value);
    }
  };

  return (
    <div class={containerClasses()}>
      <Form.Label
        title={local.label}
        class={local.labelClass}
      >
        {local.required && <span class="text-error ml-1">*</span>}
      </Form.Label>

      {local.description && (
        <p class={descriptionClasses()}>{local.description}</p>
      )}

      <Dropdown fullWidth>
        <Dropdown.Toggle
          class={dropdownClasses()}
          aria-invalid={hasError()}
          aria-required={local.required}
          id={local.name}
          disabled={local.disabled}
        >
          <span>
            {selectedOption()?.label || local.placeholder || "Select an option"}
          </span>
          {local.icon || (
            <span class="ml-2">
              <Icon
                name="icon-[mdi-light--chevron-down]"
                width={20}
                height={20}
              />
            </span>
          )}
        </Dropdown.Toggle>
        <Dropdown.Menu class="w-full">
          <For each={local.options}>
            {(option) => (
              <Dropdown.Item
                onClick={() => handleSelect(option.value)}
                class={local.value === option.value ? "bg-base-200" : ""}
              >
                {option.label}
              </Dropdown.Item>
            )}
          </For>
        </Dropdown.Menu>
      </Dropdown>

      <Show when={hasError()}>
        <p class={errorClasses()}>{errors(local.name)}</p>
      </Show>
    </div>
  );
};

export default FormDropdown;

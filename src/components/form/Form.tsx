import FormBase from "./FormBase";
import FormLabel from "./Label";
import ValidatedForm, { useFormValidation } from "./ValidatedForm";
import FormField from "./FormField";
import PasswordField from "./PasswordField";
import NumberField from "./NumberField";
import FormDropdown from "./FormDropdown";

export type { FormProps } from "./FormBase";
export type { ValidatedFormProps } from "./ValidatedForm";
export type { FormFieldProps } from "./FormField";
export type { PasswordFieldProps } from "./PasswordField";
export type { NumberFieldProps } from "./NumberField";
export type { FormDropdownProps, DropdownOption } from "./FormDropdown";

export { useFormValidation };
export default Object.assign(FormBase, {
  Label: FormLabel,
  Validated: ValidatedForm,
  Field: FormField,
  Password: PasswordField,
  Number: NumberField,
  Dropdown: FormDropdown,
});

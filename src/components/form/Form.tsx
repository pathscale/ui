import {
  children as resolveChildren,
  mergeProps,
  onCleanup,
  onMount,
  type JSX,
  type ParentComponent,
  splitProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";
import { IComponentBaseProps } from "../types";
import FormLabel from "./Label";
import ValidatedForm, { useFormValidation } from "./ValidatedForm";
export { type ValidatedFormProps } from "./ValidatedForm";

export type FormProps = Omit<JSX.HTMLAttributes<HTMLFormElement>, "ref"> &
  IComponentBaseProps & {
    autoFocus?: boolean;
    cycleOnEnter?: boolean;
  };

const Form: ParentComponent<FormProps> = (props) => {
  const merged = mergeProps({ autoFocus: true, cycleOnEnter: true }, props);

  const [local, others] = splitProps(merged, [
    "children",
    "dataTheme",
    "class",
    "className",
    "autoFocus",
    "cycleOnEnter",
  ]);

  const resolvedChildren = resolveChildren(() => local.children);

  const classes = () => twMerge("form-control", local.class, local.className);

  let formRef: HTMLFormElement | undefined;

  const getFocusableElements = () => {
    if (!formRef) return [];
    return Array.from(
      formRef.querySelectorAll(
        'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled])'
      )
    ) as HTMLElement[];
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!local.cycleOnEnter || e.key !== "Enter") return;

    const focusableElements = getFocusableElements();
    const activeElement = document.activeElement as HTMLElement;

    if (!formRef?.contains(activeElement)) return;

    const currentIndex = focusableElements.indexOf(activeElement);

    if (currentIndex === -1) return;

    e.preventDefault();

    if (currentIndex === focusableElements.length - 1) {
      formRef?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
    } else {
      const nextElement = focusableElements[currentIndex + 1];
      nextElement?.focus();
    }
  };

  onMount(() => {
    if (local.autoFocus && formRef) {
      const focusableElements = getFocusableElements();

      if (focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        firstElement.focus();
      }
    }

    if (local.cycleOnEnter && formRef) {
      formRef.addEventListener("keydown", handleKeyDown);

      onCleanup(() => {
        formRef?.removeEventListener("keydown", handleKeyDown);
      });
    }
  });

  return (
    <form
      ref={formRef}
      role="form"
      {...others}
      data-theme={local.dataTheme}
      class={classes()}
    >
      {resolvedChildren()}
    </form>
  );
};

export { useFormValidation };
export default Object.assign(Form, {
  Label: FormLabel,
  Validated: ValidatedForm,
});

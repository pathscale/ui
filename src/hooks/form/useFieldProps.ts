import type { JSX } from "solid-js";

import {
  useFieldMeta,
  type FieldName,
  type UseFieldOptions,
} from "./useFieldMeta";

const isEventLike = (value: unknown): value is Event => {
  return value instanceof Event;
};

const getValueFromInputLikeEvent = (event: Event): unknown => {
  const currentTarget = event.currentTarget;
  const target = event.target;

  const element =
    currentTarget instanceof Element
      ? currentTarget
      : target instanceof Element
        ? target
        : undefined;

  if (!element) {
    return undefined;
  }

  if (element instanceof HTMLInputElement) {
    if (element.type === "checkbox" || element.type === "radio") {
      return element.checked;
    }

    return element.value;
  }

  if (element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
    return element.value;
  }

  return undefined;
};

export type UseFieldPropsResult = {
  name: () => string | undefined;
  value: () => unknown;
  onInput: JSX.EventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    InputEvent
  >;
  onChange: (valueOrEvent: unknown) => void;
  onBlur: JSX.EventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    FocusEvent
  >;
};

export const useFieldProps = (
  name: FieldName,
  options: UseFieldOptions = {},
): UseFieldPropsResult => {
  const meta = useFieldMeta(name, options);

  const setValue = (nextValue: unknown) => {
    const form = meta.controller();
    const fieldName = meta.name();

    if (!form || !fieldName) {
      return;
    }

    form.setFieldValue(fieldName, nextValue);
  };

  const markTouched = () => {
    const form = meta.controller();
    const fieldName = meta.name();

    if (!form || !fieldName) {
      return;
    }

    (form.setTouched as (path: string, value: boolean) => void)(fieldName, true);
  };

  const onInput: JSX.EventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    InputEvent
  > = (event) => {
    const nextValue = getValueFromInputLikeEvent(event) ?? event.currentTarget.value;
    setValue(nextValue);
  };

  const onChange = (valueOrEvent: unknown) => {
    if (isEventLike(valueOrEvent)) {
      const extractedValue = getValueFromInputLikeEvent(valueOrEvent);
      setValue(extractedValue);
      return;
    }

    setValue(valueOrEvent);
  };

  const onBlur: JSX.EventHandlerUnion<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement,
    FocusEvent
  > = () => {
    markTouched();
  };

  return {
    name: meta.name,
    value: meta.value,
    onInput,
    onChange,
    onBlur,
  };
};

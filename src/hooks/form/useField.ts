import { createMemo, type Accessor } from "solid-js";

import { useFieldMeta, type FieldName, type UseFieldOptions } from "./useFieldMeta";

export type UseFieldResult = {
  name: Accessor<string | undefined>;
  value: Accessor<unknown>;
  error: Accessor<string | undefined>;
  touched: Accessor<boolean>;
  invalid: Accessor<boolean>;
  setValue: (value: unknown) => void;
};

export const useField = (
  name: FieldName,
  options: UseFieldOptions = {},
): UseFieldResult => {
  const meta = useFieldMeta(name, options);

  const setValue = (value: unknown) => {
    const form = meta.controller();
    const fieldName = meta.name();

    if (!form || !fieldName) {
      return;
    }

    form.setFieldValue(fieldName, value);
  };

  return {
    name: meta.name,
    value: meta.value,
    error: meta.error,
    touched: meta.touched,
    invalid: createMemo(() => meta.invalid()),
    setValue,
  };
};

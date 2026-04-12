import { createMemo, type Accessor } from "solid-js";

import {
  getFormControllerFromElement,
  type FormController,
  type FormPathQuery,
} from "./useForm";
import { normalizeFieldError, toAccessor } from "./utils";

type AnyFormController = FormController<Record<string, unknown>>;

export type FieldName = string | Accessor<string | undefined>;

export type UseFieldOptions = {
  form?: AnyFormController | Accessor<AnyFormController | undefined>;
  element?: Accessor<Element | undefined>;
  showWhenTouched?: boolean;
};

export type UseFieldMetaResult = {
  controller: Accessor<AnyFormController | undefined>;
  name: Accessor<string | undefined>;
  value: Accessor<unknown>;
  rawError: Accessor<string | undefined>;
  error: Accessor<string | undefined>;
  touched: Accessor<boolean>;
  invalid: Accessor<boolean>;
};

const resolveFieldName = (name: FieldName): Accessor<string | undefined> => {
  if (typeof name === "function") {
    return name as Accessor<string | undefined>;
  }

  return () => name;
};

const readFieldState = (
  form: AnyFormController | undefined,
  name: string | undefined,
  reader: (formQuery: FormPathQuery<Record<string, unknown>>) => unknown,
) => {
  if (!form || !name) {
    return undefined;
  }

  return reader(name);
};

export const useFieldMeta = (
  name: FieldName,
  options: UseFieldOptions = {},
): UseFieldMetaResult => {
  const nameAccessor = resolveFieldName(name);
  const showWhenTouched = options.showWhenTouched ?? true;

  const controller = createMemo<AnyFormController | undefined>(() => {
    if (options.form) {
      return toAccessor(options.form)();
    }

    const currentElement = options.element?.();
    if (!currentElement) {
      return undefined;
    }

    return getFormControllerFromElement(currentElement);
  });

  const value = createMemo(() =>
    readFieldState(controller(), nameAccessor(), (path) =>
      controller()?.data(path),
    ),
  );

  const touched = createMemo(() =>
    Boolean(
      readFieldState(controller(), nameAccessor(), (path) =>
        controller()?.touched(path),
      ),
    ),
  );

  const rawError = createMemo(() =>
    normalizeFieldError(
      readFieldState(controller(), nameAccessor(), (path) =>
        controller()?.errors(path),
      ),
    ),
  );

  const error = createMemo(() => {
    const message = rawError();

    if (!message) {
      return undefined;
    }

    if (!showWhenTouched) {
      return message;
    }

    return touched() ? message : undefined;
  });

  const invalid = createMemo(() => Boolean(error()));

  return {
    controller,
    name: nameAccessor,
    value,
    rawError,
    error,
    touched,
    invalid,
  };
};

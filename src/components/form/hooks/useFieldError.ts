import type { Accessor } from "solid-js";

import {
  useFieldMeta,
  type FieldName,
  type UseFieldOptions,
} from "./useFieldMeta";

export const useFieldError = (
  name: FieldName,
  options: UseFieldOptions = {},
): Accessor<string | undefined> => {
  return useFieldMeta(name, options).error;
};

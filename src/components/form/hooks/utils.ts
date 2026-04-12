import type { Accessor } from "solid-js";

export const isAccessor = <T>(value: unknown): value is Accessor<T> => {
  return typeof value === "function";
};

export const toAccessor = <T>(value: T | Accessor<T>): Accessor<T> => {
  if (isAccessor<T>(value)) {
    return value;
  }

  return () => value;
};

export const normalizeFieldError = (value: unknown): string | undefined => {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const normalized = normalizeFieldError(item);
      if (normalized) {
        return normalized;
      }
    }
    return undefined;
  }

  if (value && typeof value === "object") {
    const maybeMessage = (value as Record<string, unknown>).message;
    if (typeof maybeMessage === "string") {
      const trimmed = maybeMessage.trim();
      if (trimmed.length > 0) {
        return trimmed;
      }
    }

    for (const nested of Object.values(value as Record<string, unknown>)) {
      const normalized = normalizeFieldError(nested);
      if (normalized) {
        return normalized;
      }
    }
  }

  return undefined;
};

/**
 * Normalizes a TanStack Form `ValidationError[]` into the first displayable
 * error string.
 *
 * TanStack Form stores errors as `(string | ZodIssue | ValibotIssue | ...)[]`
 * depending on the schema library in use. This function collapses that union
 * to a single `string | undefined` for display in field error components.
 */
export const getFirstFieldError = (
  errors: unknown[],
): string | undefined => {
  if (!errors || errors.length === 0) return undefined;

  for (const error of errors) {
    if (!error) continue;

    if (typeof error === "string") {
      const trimmed = error.trim();
      if (trimmed.length > 0) return trimmed;
      continue;
    }

    if (typeof error === "object") {
      // Standard Schema / Zod / Valibot issues expose .message
      const maybeMessage = (error as Record<string, unknown>).message;
      if (typeof maybeMessage === "string") {
        const trimmed = maybeMessage.trim();
        if (trimmed.length > 0) return trimmed;
      }
      continue;
    }
  }

  return undefined;
};

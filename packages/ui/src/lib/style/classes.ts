export type ClassArgs =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassArgs[];

/**
 * Joins classes into a single string.
 *
 * @param args The args to join.
 * @returns A string of joined class names, excluding any falsy values.
 */
export function classes(...args: ClassArgs[]): string {
  return args.flat().filter(Boolean).join(" ");
}

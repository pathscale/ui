export type ElementOf<T> = T extends keyof HTMLElementTagNameMap
  ? HTMLElementTagNameMap[T]
  : unknown;

/** Return every key declared inside a recipe's `flag` groups. */
export function recipeFlagKeys(recipeSource: string): string[] {
  const keys = new Set<string>();
  for (const match of recipeSource.matchAll(/flag:\s*\{([^}]*)\}/g)) {
    const block = match[1] ?? "";
    for (const keyMatch of block.matchAll(/^\s*([A-Za-z_$][\w$]*):/gm)) {
      const key = keyMatch[1];
      if (key) keys.add(key);
    }
  }
  return [...keys];
}

/** Return recipe flags that no layout reads through `CLASSES.*.flag.*`. */
export function missingRecipeFlagUsages(
  recipeSource: string,
  layoutSource: string,
): string[] {
  return recipeFlagKeys(recipeSource).filter(
    (key) => !new RegExp(`\\.flag\\.${key}\\b`).test(layoutSource),
  );
}

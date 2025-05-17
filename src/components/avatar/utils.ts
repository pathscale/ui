export function parseCaption(alt?: string): string {
  if (!alt) return "";
  const parts = alt.split(" ");
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`;
  }
  return "";
}

export type InlineEditField = Pick<HTMLInputElement, "focus" | "select" | "value">;

export function bindInlineEditWindowDismissal(
  windowSource: Pick<Window, "addEventListener" | "removeEventListener">,
  windowBlur: () => void,
): () => void {
  windowSource.addEventListener("blur", windowBlur);
  return () => {
    windowSource.removeEventListener("blur", windowBlur);
  };
}

export type InlineEditInteractionOptions = {
  value: () => string;
  disabled: () => boolean;
  field: () => InlineEditField | undefined;
  onOpenChange: (open: boolean) => void;
  onCommit?: (value: string) => void | Promise<unknown>;
};

/**
 * Own the complete open, cancel and commit interaction for InlineEdit.
 *
 * The root class is the only rendered state. Keeping the swap here makes a
 * pencil press independently testable and keeps CSS as the single authority
 * for which row is visible.
 */
export function createInlineEditInteractions(
  options: InlineEditInteractionOptions,
) {
  let open = false;
  let focused = false;
  let draft = "";
  let sourceValue = options.value();

  const apply = (next: boolean): void => {
    open = next;
    options.onOpenChange(next);
  };

  const resetDraft = (): void => {
    draft = options.value();
    const field = options.field();
    if (field) field.value = draft;
  };

  const start = (): void => {
    if (options.disabled()) return;
    sourceValue = options.value();
    resetDraft();
    apply(true);
    queueMicrotask(() => {
      options.field()?.focus();
      options.field()?.select();
    });
  };

  const cancel = (): void => {
    resetDraft();
    focused = false;
    apply(false);
  };

  const commit = (): void => {
    const next = draft.trim();
    focused = false;
    apply(false);
    if (!next || next === options.value()) return;
    void options.onCommit?.(next);
  };

  return {
    start,
    cancel,
    commit,
    isOpen: () => open,
    input: (value: string) => {
      draft = value;
    },
    focus: () => {
      focused = true;
    },
    blur: () => {
      if (focused && open) commit();
    },
    windowBlur: () => {
      if (open) commit();
    },
    syncValue: (nextValue: string) => {
      if (open && nextValue !== sourceValue) cancel();
    },
    keyDown: (key: string, preventDefault: () => void) => {
      if (key === "Enter") {
        preventDefault();
        commit();
      } else if (key === "Escape") {
        preventDefault();
        cancel();
      }
    },
  };
}

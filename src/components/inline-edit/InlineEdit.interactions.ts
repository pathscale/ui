export type InlineEditField = Pick<HTMLInputElement, "focus" | "select" | "value">;

export type InlineEditInteractionOptions = {
  value: () => string;
  disabled: () => boolean;
  root: () => Pick<HTMLElement, "classList" | "contains"> | undefined;
  field: () => InlineEditField | undefined;
  editingClass: string;
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

  const apply = (next: boolean): void => {
    open = next;
    options.root()?.classList.toggle(options.editingClass, next);
  };

  const resetDraft = (): void => {
    draft = options.value();
    const field = options.field();
    if (field) field.value = draft;
  };

  const start = (): void => {
    if (options.disabled()) return;
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
    pointerDown: (target: EventTarget | null) => {
      const root = options.root();
      if (open && root && !root.contains(target as Node)) commit();
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

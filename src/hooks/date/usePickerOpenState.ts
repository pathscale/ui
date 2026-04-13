import { createEffect, createMemo, createSignal, onCleanup, onMount, type Accessor } from "solid-js";

type PickerOpenStateOptions = {
  isOpen: Accessor<boolean | undefined>;
  defaultOpen: Accessor<boolean | undefined>;
  onOpenChange: Accessor<((value: boolean) => void) | undefined>;
  isDisabled: Accessor<boolean>;
};

export const usePickerOpenState = (options: PickerOpenStateOptions) => {
  const [internalOpen, setInternalOpen] = createSignal(Boolean(options.defaultOpen()));
  const [rootRef, setRootRef] = createSignal<HTMLElement | undefined>(undefined);

  const isControlled = createMemo(() => options.isOpen() !== undefined);

  const isOpen = createMemo(() =>
    isControlled() ? Boolean(options.isOpen()) : internalOpen(),
  );

  const setOpen = (nextOpen: boolean) => {
    if (nextOpen && options.isDisabled()) return;

    const previous = isOpen();

    if (!isControlled()) {
      setInternalOpen(nextOpen);
    }

    if (previous !== nextOpen) {
      options.onOpenChange()?.(nextOpen);
    }
  };

  const toggleOpen = () => {
    setOpen(!isOpen());
  };

  onMount(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen()) return;

      const root = rootRef();
      if (!root) return;
      if (root.contains(event.target as Node)) return;

      setOpen(false);
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (!isOpen()) return;
      if (event.key !== "Escape") return;

      event.preventDefault();
      setOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleGlobalKeyDown);

    onCleanup(() => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    });
  });

  createEffect(() => {
    if (!options.isDisabled()) return;
    if (!isOpen()) return;

    setOpen(false);
  });

  return {
    isOpen,
    isControlled,
    setOpen,
    toggleOpen,
    setRootRef,
  };
};

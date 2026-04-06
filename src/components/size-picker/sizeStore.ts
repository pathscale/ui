import { createSignal, createEffect } from "solid-js";

export type SizePreset = "M" | "L" | "XL";

const SIZE_SCALE: Record<SizePreset, number> = {
  M: 100,
  L: 112.5,
  XL: 125,
};

export interface SizeStore {
  size: () => SizePreset;
  setSize: (size: SizePreset) => void;
  scale: () => number;
}

function applySize(preset: SizePreset) {
  document.documentElement.style.fontSize = `${SIZE_SCALE[preset]}%`;
}

export function createSizeStore(storagePrefix: string): SizeStore {
  const STORAGE_KEY = `${storagePrefix}_size_preset`;

  const getInitial = (): SizePreset => {
    if (typeof window === "undefined") return "M";
    const saved = localStorage.getItem(STORAGE_KEY) as SizePreset | null;
    if (saved && saved in SIZE_SCALE) return saved;
    return "M";
  };

  const [size, setSizeInternal] = createSignal<SizePreset>(getInitial());

  createEffect(() => {
    const s = size();
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, s);
    applySize(s);
  });

  return {
    size,
    setSize: setSizeInternal,
    scale: () => SIZE_SCALE[size()],
  };
}

let defaultStore: SizeStore | null = null;

export function getDefaultSizeStore(): SizeStore {
  if (!defaultStore) {
    defaultStore = createSizeStore("theme");
  }
  return defaultStore;
}

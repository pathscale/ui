import { createEffect, createMemo, type Accessor } from "solid-js";
import {
  createVirtualizer,
  type PartialKeys,
  type VirtualItem,
  type Virtualizer,
  type VirtualizerOptions,
} from "@tanstack/solid-virtual";

type OmittedVirtualizerOptions =
  | "observeElementRect"
  | "observeElementOffset"
  | "scrollToFn";

export type UseVirtualRowsOptions<
  TScrollElement extends Element,
  TItemElement extends Element,
> = PartialKeys<
  VirtualizerOptions<TScrollElement, TItemElement>,
  OmittedVirtualizerOptions
>;

export type VirtualRowsRange = {
  startIndex: number;
  endIndex: number;
};

export type UseVirtualRowsResult<
  TScrollElement extends Element,
  TItemElement extends Element,
> = {
  virtualizer: Virtualizer<TScrollElement, TItemElement>;
  virtualItems: Accessor<VirtualItem[]>;
  totalSize: Accessor<number>;
  range: Accessor<VirtualRowsRange | undefined>;
  startIndex: Accessor<number>;
  endIndex: Accessor<number>;
};

export const useVirtualRows = <
  TScrollElement extends Element,
  TItemElement extends Element,
>(
  options: UseVirtualRowsOptions<TScrollElement, TItemElement>,
): UseVirtualRowsResult<TScrollElement, TItemElement> => {
  const virtualizer = createVirtualizer<TScrollElement, TItemElement>(options);

  createEffect(() => {
    const scrollElement = options.getScrollElement();
    if (!scrollElement) return;
    virtualizer.measure();
  });

  const virtualItems = () => virtualizer.getVirtualItems();
  const totalSize = () => virtualizer.getTotalSize();

  const range = createMemo<VirtualRowsRange | undefined>(() => {
    const items = virtualItems();
    if (items.length === 0) {
      return undefined;
    }

    return {
      startIndex: items[0].index,
      endIndex: items[items.length - 1].index,
    };
  });

  const startIndex = createMemo(() => range()?.startIndex ?? -1);
  const endIndex = createMemo(() => range()?.endIndex ?? -1);

  return {
    virtualizer,
    virtualItems,
    totalSize,
    range,
    startIndex,
    endIndex,
  };
};

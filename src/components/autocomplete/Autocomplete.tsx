import {
  type Component,
  createSignal,
  createEffect,
  For,
  Show,
  onCleanup,
} from "solid-js";
import {
  autocompleteWrapperClass,
  inputBoxClass,
  dropdownMenuClass,
  dropdownItemClass,
  dropdownEmptyClass,
  labelClass,
} from "./Autocomplete.styles";
import { classes, type VariantProps } from "@src/lib/style";

type AutocompleteProps = {
  items: Array<string | number>;
  label?: string;
  value?: string | number;
  onChange?: (val: string | number) => void;
  disabled?: boolean;
} & VariantProps<typeof inputBoxClass>;

const Autocomplete: Component<AutocompleteProps> = (props) => {
  const [search, setSearch] = createSignal(props.value?.toString() || "");
  const [isOpen, setIsOpen] = createSignal(false);
  const [filtered, setFiltered] = createSignal<(string | number)[]>(
    props.items
  );
  const [highlightIndex, setHighlightIndex] = createSignal(-1);

  let wrapperRef: HTMLDivElement | undefined;

  const filterItems = (val: string) => {
    const lower = val.toLowerCase();
    setFiltered(
      props.items.filter((item) =>
        item.toString().toLowerCase().includes(lower)
      )
    );
  };

  const handleInput = (e: InputEvent) => {
    const val = (e.target as HTMLInputElement).value;
    setSearch(val);
    filterItems(val);
    setIsOpen(true);
    setHighlightIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isOpen()) return;

    if (e.key === "ArrowDown") {
      setHighlightIndex((prev) => Math.min(prev + 1, filtered().length - 1));
      e.preventDefault();
    }

    if (e.key === "ArrowUp") {
      setHighlightIndex((prev) => Math.max(prev - 1, 0));
      e.preventDefault();
    }

    if (e.key === "Enter" && filtered()[highlightIndex()]) {
      const selected = filtered()[highlightIndex()];
      setSearch(selected?.toString() ?? "");
      props.onChange?.(selected!);
      setIsOpen(false);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleSelect = (item: string | number) => {
    setSearch(item.toString());
    props.onChange?.(item);
    setIsOpen(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (!wrapperRef?.contains(e.target as Node)) {
      setIsOpen(false);
    }
  };

  createEffect(() => {
    if (props.value !== undefined) {
      setSearch(props.value.toString());
    }
  });

  createEffect(() => {
    document.addEventListener("click", handleClickOutside);
    onCleanup(() => {
      document.removeEventListener("click", handleClickOutside);
    });
  });

  return (
    <div class={autocompleteWrapperClass} ref={wrapperRef}>
      <Show when={props.label}>
        <label class={labelClass}>{props.label}</label>
      </Show>

      <input
        type="text"
        value={search()}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => setIsOpen(true)}
        disabled={props.disabled}
        autocomplete="off"
        class={inputBoxClass({
          size: props.size,
          state: props.state ?? (props.disabled ? "disabled" : "default"),
        })}
      />

      <Show when={isOpen()}>
        <div class={dropdownMenuClass()}>
          <Show
            when={filtered().length > 0}
            fallback={<div class={dropdownEmptyClass}>No data available</div>}
          >
            <For each={filtered()}>
              {(item, i) => (
                <div
                  class={dropdownItemClass({
                    active: i() === highlightIndex(),
                  })}
                  onMouseDown={() => handleSelect(item)}
                >
                  {item}
                </div>
              )}
            </For>
          </Show>
        </div>
      </Show>
    </div>
  );
};

export default Autocomplete;

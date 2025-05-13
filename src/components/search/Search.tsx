import {
  type Component,
  splitProps,
  Show,
  type JSX,
} from "solid-js";
import { searchWrapper, inputStyles, buttonStyles } from "./Search.styles";
import { classes, type VariantProps, type ClassProps } from "@src/lib/style";

type SearchProps = {
  value?: string;
  placeholder?: string;
  onInput?: JSX.EventHandler<HTMLInputElement, InputEvent>;
  onSearch?: () => void;
  loading?: boolean;
  buttonLabel?: string;
} & VariantProps<typeof searchWrapper>
  & VariantProps<typeof inputStyles>
  & VariantProps<typeof buttonStyles>
  & ClassProps;

const Search: Component<SearchProps> = (props) => {
  const [local, variantProps, rest] = splitProps(
    props,
    ["class", "className", "value", "onInput", "onSearch", "placeholder", "loading", "buttonLabel"],
    ["fullWidth", "size", "color", "loading"]
  );

  return (
    <div
      class={classes(
        searchWrapper({ fullWidth: variantProps.fullWidth }),
        local.class,
        local.className
      )}
      {...rest}
    >
      <input
        type="text"
        value={local.value}
        placeholder={local.placeholder ?? "Search..."}
        onInput={local.onInput}
        class={inputStyles({ size: variantProps.size })}
      />
      <button
        type="button"
        class={buttonStyles({
          color: variantProps.color,
          loading: local.loading,
        })}
        disabled={local.loading}
        onClick={local.onSearch}
      >
        <Show when={!local.loading} fallback={<span>Loading...</span>}>
          {local.buttonLabel ?? "Search"}
        </Show>
      </button>
    </div>
  );
};

export default Search;

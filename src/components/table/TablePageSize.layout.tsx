import { type JSX, splitProps } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { Layout } from "../../lib/layouts";
import type { UIBaseProps } from "../vocabulary";
import { CLASSES, tablePageSizeRecipe } from "./Table.recipe";

export type TablePageSizeProps = Omit<
  JSX.SelectHTMLAttributes<HTMLSelectElement>,
  "onChange"
> &
  UIBaseProps & {
    value: number;
    options: readonly number[];
    onChange: (value: number) => void;
    label?: JSX.Element;
    selectClass?: string;
    selectClassName?: string;
  };

const TablePageSize: Layout<
  typeof tablePageSizeRecipe,
  TablePageSizeProps
> = () => {
  const [local, rest] = splitProps(props, [
    "class",
    "dataTheme",
    "value",
    "options",
    "onChange",
    "label",
    "selectClass",
    "selectClassName",
  ]);

  return (
    <label
      {...{ class: twMerge(CLASSES.pageSize, local.class) }}
      data-theme={local.dataTheme}
      data-slot="table-page-size"
    >
      <span
        {...{ class: CLASSES.pageSizeLabel }}
        data-slot="table-page-size-label"
      >
        {local.label ?? "Rows"}
      </span>
      <select
        {...rest}
        {...{
          class: twMerge(
            CLASSES.pageSizeSelect,
            local.selectClass,
            local.selectClassName,
          ),
        }}
        value={local.value}
        onChange={(event) => local.onChange(Number(event.currentTarget.value))}
      >
        {local.options.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
};

export default TablePageSize;

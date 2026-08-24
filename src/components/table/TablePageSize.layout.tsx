import {omit} from "solid-js";
import type { JSX } from "@solidjs/web";
import { twMerge } from "../../lib/twMerge";
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
  const rest = omit(
    props,
    "class",
    "dataTheme",
    "value",
    "options",
    "onChange",
    "label",
    "selectClass",
    "selectClassName",
  );

  return (
    <label
      {...{ class: twMerge(CLASSES.pageSize, props.class) }}
      data-theme={props.dataTheme}
      data-slot="table-page-size"
    >
      <span
        {...{ class: CLASSES.pageSizeLabel }}
        data-slot="table-page-size-label"
      >
        {props.label ?? "Rows"}
      </span>
      <select
        {...rest}
        {...{
          class: twMerge(
            CLASSES.pageSizeSelect,
            props.selectClass,
            props.selectClassName,
          ),
        }}
        value={props.value}
        onChange={(event) => props.onChange(Number(event.currentTarget.value))}
      >
        {props.options.map((option) => (
          <option value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
};

export default TablePageSize;

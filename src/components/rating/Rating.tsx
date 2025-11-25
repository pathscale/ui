import clsx from "clsx";
import {
  createContext,
  splitProps,
  useContext,
  type JSX,
  type ParentProps,
} from "solid-js";
import { twMerge } from "tailwind-merge";

import RatingHidden from "./RatingHidden";
import RatingItem from "./RatingItem";

export type ComponentSize = "xs" | "sm" | "md" | "lg" | "xl";

export type RatingProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> & {
  name?: string;
  value?: number;
  onChange?: (value: number) => void;
  size?: ComponentSize;
  half?: boolean;
  readonly?: boolean;
};

interface RatingContextValue {
  name?: string;
  value?: number;
  onChange?: (value: number) => void;
  half?: boolean;
  readonly?: boolean;
}

const RatingContext = createContext<RatingContextValue>({});

const Rating = (props: ParentProps<RatingProps>) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "name",
    "value",
    "onChange",
    "size",
    "half",
    "readonly",
  ]);

  const classes = twMerge(
    "rating",
    local.class,
    clsx({
      "rating-xs": local.size === "xs",
      "rating-sm": local.size === "sm",
      "rating-md": local.size === "md",
      "rating-lg": local.size === "lg",
      "rating-xl": local.size === "xl",
      "rating-half": local.half,
    }),
  );

  return (
    <RatingContext.Provider
      value={{
        name: local.name,
        value: local.value,
        onChange: local.onChange,
        half: local.half,
        readonly: local.readonly,
      }}
    >
      <div
        {...rest}
        class={classes}
      >
        {local.children}
      </div>
    </RatingContext.Provider>
  );
};

export const useRatingContext = () => useContext(RatingContext);

export default Object.assign(Rating, {
  Item: RatingItem,
  Hidden: RatingHidden,
});

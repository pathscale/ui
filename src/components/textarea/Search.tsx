// components/DevShowcaseField.tsx
import {
  type Component,
  splitProps,
  type ComponentProps,
} from "solid-js";
import { classes } from "@src/lib/style";
import {
  searchVariants,
  inputStyles,
  selectStyles,
  buttonVariants,
} from "./Search.styles";

type FieldProps = {
  addons?: boolean;
  position?: "left" | "center" | "right";
} & ComponentProps<"div">;

const Field: Component<FieldProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["class", "className", "children"],
    ["addons", "position"],
  );
  return (
    <div
      class={classes(
        searchVariants({
          addons: !!variantProps.addons,
          position: variantProps.position,
        }),
        local.class,
        local.className,
      )}
      {...others}
    >
      {local.children}
    </div>
  );
};

type InputProps = ComponentProps<"input">;
const Input: Component<InputProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className"]);
  return (
    <input
      class={classes(inputStyles(), local.class, local.className)}
      {...others}
    />
  );
};

type SelectProps = ComponentProps<"select">;
const Select: Component<SelectProps> = (props) => {
  const [local, others] = splitProps(props, ["class", "className", "children"]);
  return (
    <select
      class={classes(selectStyles(), local.class, local.className)}
      {...others}
    >
      {local.children}
    </select>
  );
};

type ButtonProps = {
  type?: "info" | "static" | "default";
} & ComponentProps<"button">;

const Button: Component<ButtonProps> = (props) => {
  const [local, variantProps, others] = splitProps(
    props,
    ["class", "className", "children"],
    ["type"],
  );
  return (
    <button
      class={classes(
        buttonVariants({ type: variantProps.type }),
        local.class,
        local.className,
      )}
      {...others}
    >
      {local.children}
    </button>
  );
};

const Search: Component = () => {
  return (
    <Field>
      <Field addons position="left">
        <Input />
        <Button type="info">Search</Button>
      </Field>

      <Field addons position="center">
        <Select placeholder="Category">
          <option>New</option>
          <option>Used</option>
        </Select>
        <Input placeholder="Product name" />
        <Button type="info">Search</Button>
      </Field>

      <Field addons position="right">
        <Input placeholder="Your email" />
        <Button type="static">@gmail.com</Button>
      </Field>
    </Field>
  );
};

export default Search;

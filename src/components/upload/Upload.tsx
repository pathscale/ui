import { type Component, type JSX, splitProps, Show } from "solid-js";
import {
  uploadWrapperVariants,
  fileInputClass,
  fileIconClass,
  fileLabelClass,
} from "./Upload.styles";
import { classes, type VariantProps } from "@src/lib/style";

export type UploadProps = {
  icon?: JSX.Element;
  label?: string;
  multiple?: boolean;
  disabled?: boolean;
  accept?: string;
  dragDrop?: boolean;
  name?: string;
  onChange?: (files: File | File[]) => void;
} & VariantProps<typeof uploadWrapperVariants> &
  Omit<
    JSX.InputHTMLAttributes<HTMLInputElement>,
    "onChange" | "multiple" | "accept" | "disabled"
  >;

const Upload: Component<UploadProps> = (props) => {
  const [local, variantProps, otherProps] = splitProps(
    props,
    [
      "icon",
      "label",
      "multiple",
      "disabled",
      "accept",
      "dragDrop",
      "name",
      "onChange",
    ],
    ["style", "color", "size"]
  );

  const handleChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    if (local.onChange) {
      if (local.multiple) {
        local.onChange(Array.from(files));
      } else if (files[0]) {
        local.onChange(files[0]);
      }
    }
  };

  const handleDrop = (e: DragEvent) => {
    if (!local.dragDrop) return;
    e.preventDefault();
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;

    if (local.onChange) {
      if (local.multiple) {
        local.onChange(Array.from(files));
      } else if (files[0]) {
        local.onChange(files[0]);
      }
    }
  };

  const handleDragOver = (e: DragEvent) => {
    if (local.dragDrop) e.preventDefault();
  };

  return (
    <div class={uploadWrapperVariants(variantProps)}>
      <label class="cursor-pointer relative w-full h-full">
        <input
          type="file"
          class={fileInputClass}
          name={local.name}
          multiple={local.multiple}
          accept={local.accept}
          disabled={local.disabled}
          onChange={handleChange}
          {...otherProps}
        />
        <div
          class={classes(
            variantProps.style === "boxed"
              ? "flex flex-col items-center justify-center gap-2"
              : "flex flex-row items-center justify-center gap-2"
          )}
        >
          <Show when={local.icon}>
            <span class={fileIconClass}>{local.icon}</span>
          </Show>
          <span class={fileLabelClass}>{local.label}</span>
        </div>
      </label>
    </div>
  );
};

export default Upload;

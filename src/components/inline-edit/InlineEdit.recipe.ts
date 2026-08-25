import { recipe } from "../../lib/layouts";

export const CLASSES = {
  base: "inline-edit",
  slot: {
    read: "inline-edit__read",
    value: "inline-edit__value",
    trigger: "inline-edit__trigger",
    edit: "inline-edit__edit",
    field: "inline-edit__field",
  },
  flag: {
    editing: "inline-edit--editing",
    fullWidth: "inline-edit--full-width",
    disabled: "inline-edit--disabled",
  },
} as const;

export const componentRecipe = recipe({
  component: "inline-edit",
  slots: {
    root: {},
    "inline-edit-read": {},
    "inline-edit-value": {},
    "inline-edit-trigger": {},
    "inline-edit-edit": {},
    "inline-edit-field": {},
  },
});

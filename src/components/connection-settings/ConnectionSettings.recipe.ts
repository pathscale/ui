import { recipe } from "../../lib/layouts";

export const CLASSES = {
  base: "connection-settings",
  slot: {
    header: "connection-settings__header",
    title: "connection-settings__title",
    description: "connection-settings__description",
    switch: "connection-settings__switch",
    fields: "connection-settings__fields",
    field: "connection-settings__field",
    label: "connection-settings__label",
    input: "connection-settings__input",
    hint: "connection-settings__hint",
    current: "connection-settings__current",
    actions: "connection-settings__actions",
  },
  flag: {
    open: "connection-settings--open",
    applying: "connection-settings--applying",
  },
} as const;

export const componentRecipe = recipe({
  component: "connection-settings",
  slots: {
    "connection-settings": {},
    "connection-settings-actions": {},
    "connection-settings-current": {},
    "connection-settings-description": {},
    "connection-settings-field": {},
    "connection-settings-fields": {},
    "connection-settings-header": {},
    "connection-settings-hint": {},
    "connection-settings-input": {},
    "connection-settings-label": {},
    "connection-settings-switch": {},
    "connection-settings-title": {},
    root: {},
  },
});

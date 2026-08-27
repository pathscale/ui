/*
 * Every component the harness can mount, and what a person can do to it.
 *
 * This is the whole authoring surface. Adding a component to QA means adding
 * one entry here: a kind, a name, and the props to mount it with. The page
 * mounts it alone, and `generate-checks.ts` turns the entry into the ps-qa
 * checks its kind requires. Nothing else is written per component.
 *
 * ## Why isolation
 *
 * Driving components inside the consuming application makes every check
 * order-dependent. Running the composer, select and rename groups in one
 * process leaves state behind: a pill left on `low` fails the next group's
 * "choosing medium changes the trigger" outright, and a dropdown left open
 * swallows the next group's first click. Those failures say nothing about the
 * component, and they are indistinguishable from real ones in a report.
 *
 * One component, one page, one fixture. The URL selects it, so a check restores
 * its own world by navigating rather than by undoing whatever it did.
 *
 * ## Kinds
 *
 * The kind decides which checks are generated, mirroring the templates in
 * AgencyZero's `tests/qa-templates/templates.ron`:
 *
 *   value  - carries a value a reader can see. Asserted on the control the
 *            reader looks at (the trigger), never on the option that was
 *            pressed: an option's own selected flag flips even when the value
 *            never reaches the trigger, which is how a Select that could not
 *            select passed 2/2.
 *   mode   - swaps one thing for another. Must prove it opens, does its work,
 *            and leaves by each exit a reader has.
 *   action - does something once and shows it happened.
 *   display- only ever paints.
 */

export type ComponentKind = "value" | "mode" | "action" | "display";

export type ComponentSpec = {
  /** URL id and check-id prefix. Kebab-case. */
  id: string;
  /** Exported name in `@pathscale/ui`. */
  component: string;
  kind: ComponentKind;
  /*
   * Accessible name of the control a reader reads: the trigger, field or
   * button. Optional, and its absence is meaningful rather than sloppy: a
   * component with no `subject` yet has only its paint check generated, which
   * is the honest coverage for one nobody has described an interaction for.
   * Filling it in is what upgrades that component to its kind's full set.
   */
  subject?: string;
  /** Role of that subject, so a check cannot assert on the wrong node. */
  subjectRole?: string;
  /** For `value`/`mode`: the option or item to activate, as `role:name`. */
  activate?: string;
  /** For `mode`: the node that proves the mode opened, as `role:name`. */
  opens?: string;
  /** Mount props. Kept literal so the fixture is readable in one glance. */
  props?: Record<string, unknown>;
  /** Option labels, for components that need children. */
  options?: { value: string; label: string }[];
};

export const COMPONENTS: ComponentSpec[] = [
  { id: "accordion", component: "Accordion", kind: "mode" },
  { id: "address", component: "Address", kind: "display" },
  { id: "alert", component: "Alert", kind: "display" },
  { id: "auth-card", component: "AuthCard", kind: "display" },
  { id: "auth-field-group", component: "AuthFieldGroup", kind: "display" },
  { id: "auth-footer-links", component: "AuthFooterLinks", kind: "display" },
  { id: "auth-message", component: "AuthMessage", kind: "display" },
  { id: "auth-powered-by", component: "AuthPoweredBy", kind: "display" },
  { id: "auth-submit-button", component: "AuthSubmitButton", kind: "action" },
  { id: "avatar", component: "Avatar", kind: "display" },
  { id: "badge", component: "Badge", kind: "display" },
  { id: "breadcrumb", component: "Breadcrumb", kind: "display" },
  { id: "button", component: "Button", kind: "action" },
  { id: "calendar", component: "Calendar", kind: "value" },
  { id: "card", component: "Card", kind: "display" },
  { id: "chat-bubble", component: "ChatBubble", kind: "display" },
  { id: "checkbox", component: "Checkbox", kind: "value" },
  { id: "chip", component: "Chip", kind: "display" },
  { id: "collapsible", component: "Collapsible", kind: "mode" },
  { id: "color-swatch", component: "ColorSwatch", kind: "value" },
  { id: "color-wheel", component: "ColorWheel", kind: "value" },
  { id: "complex-color-wheel", component: "ComplexColorWheel", kind: "value" },
  { id: "composer", component: "Composer", kind: "value" },
  { id: "cookie-consent", component: "CookieConsent", kind: "mode" },
  { id: "data-grid", component: "DataGrid", kind: "value" },
  { id: "dialog", component: "Dialog", kind: "mode" },
  { id: "dock", component: "Dock", kind: "display" },
  { id: "drawer", component: "Drawer", kind: "mode" },
  {
    id: "dropdown",
    component: "Dropdown",
    kind: "value",
    subject: "Effort",
    subjectRole: "button",
    activate: "menuitem:high",
    opens: "menuitem:low",
    options: [
      { value: "low", label: "low" },
      { value: "medium", label: "medium" },
      { value: "high", label: "high" },
    ],
  },
  { id: "empty", component: "Empty", kind: "display" },
  { id: "field-group", component: "FieldGroup", kind: "display" },
  { id: "fieldset", component: "Fieldset", kind: "display" },
  { id: "firefox-pwa-banner", component: "FirefoxPWABanner", kind: "mode" },
  { id: "flex", component: "Flex", kind: "display" },
  { id: "footer", component: "Footer", kind: "display" },
  { id: "form", component: "Form", kind: "display" },
  { id: "glow-card", component: "GlowCard", kind: "display" },
  { id: "grid", component: "Grid", kind: "display" },
  { id: "header", component: "Header", kind: "display" },
  { id: "icon", component: "Icon", kind: "display" },
  { id: "immersive-landing", component: "ImmersiveLanding", kind: "display" },
  { id: "inline-edit", component: "InlineEdit", kind: "value" },
  { id: "input", component: "Input", kind: "value" },
  { id: "label", component: "Label", kind: "display" },
  { id: "language-switcher", component: "LanguageSwitcher", kind: "value" },
  { id: "link", component: "Link", kind: "action" },
  { id: "list-box", component: "ListBox", kind: "value" },
  { id: "live-chat-bubble", component: "LiveChatBubble", kind: "action" },
  { id: "live-chat-panel", component: "LiveChatPanel", kind: "mode" },
  { id: "metal-border", component: "MetalBorder", kind: "display" },
  { id: "navbar", component: "Navbar", kind: "display" },
  { id: "pwa-install-prompt", component: "PWAInstallPrompt", kind: "mode" },
  { id: "pagination", component: "Pagination", kind: "value" },
  { id: "password-field", component: "PasswordField", kind: "value" },
  { id: "password-requirements", component: "PasswordRequirements", kind: "display" },
  { id: "popover", component: "Popover", kind: "mode" },
  { id: "progress", component: "Progress", kind: "display" },
  { id: "radio", component: "Radio", kind: "value" },
  { id: "scroll-area", component: "ScrollArea", kind: "display" },
  {
    id: "select",
    component: "Select",
    kind: "value",
    subject: "Session",
    subjectRole: "button",
    activate: "option:second fixture",
    opens: "option:first fixture",
    props: { placeholder: "Session" },
    options: [
      { value: "first", label: "first fixture" },
      { value: "second", label: "second fixture" },
    ],
  },
  { id: "separator", component: "Separator", kind: "display" },
  { id: "skeleton", component: "Skeleton", kind: "display" },
  { id: "slider", component: "Slider", kind: "value" },
  { id: "spinner", component: "Spinner", kind: "display" },
  { id: "switch", component: "Switch", kind: "value" },
  { id: "table", component: "Table", kind: "value" },
  { id: "tabs", component: "Tabs", kind: "value" },
  { id: "text", component: "Text", kind: "display" },
  { id: "theme-color-picker", component: "ThemeColorPicker", kind: "value" },
  { id: "toast", component: "Toast", kind: "mode" },
  { id: "tooltip", component: "Tooltip", kind: "mode" },
];

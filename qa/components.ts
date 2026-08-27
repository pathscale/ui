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
  {
    id: "accordion",
    component: "Accordion",
    kind: "display",
  },
  { id: "address", component: "Address", kind: "display" },
  { id: "alert", component: "Alert", kind: "display" },
  { id: "auth-card", component: "AuthCard", kind: "display" },
  { id: "auth-field-group", component: "AuthFieldGroup", kind: "display" },
  { id: "auth-footer-links", component: "AuthFooterLinks", kind: "display" },
  { id: "auth-message", component: "AuthMessage", kind: "display" },
  { id: "auth-powered-by", component: "AuthPoweredBy", kind: "display" },
  {
    id: "auth-submit-button",
    component: "AuthSubmitButton",
    kind: "action",
    subject: "AuthSubmitButton",
    subjectRole: "button",
  },
  { id: "avatar", component: "Avatar", kind: "display" },
  { id: "badge", component: "Badge", kind: "display" },
  { id: "breadcrumb", component: "Breadcrumb", kind: "display" },
  {
    id: "button",
    component: "Button",
    kind: "action",
    subject: "Button",
    subjectRole: "button",
  },
  {
    id: "calendar",
    component: "Calendar",
    kind: "display",
  },
  { id: "card", component: "Card", kind: "display" },
  { id: "chat-bubble", component: "ChatBubble", kind: "display" },
  {
    id: "checkbox",
    component: "Checkbox",
    kind: "value",
    subject: "Checkbox",
    subjectRole: "checkbox",
    opens: "checkbox:Checkbox",
    activate: "checkbox:Checkbox",
  },
  { id: "chip", component: "Chip", kind: "display" },
  {
    id: "collapsible",
    component: "Collapsible",
    kind: "mode",
    subject: "Collapsible",
    subjectRole: "button",
    opens: "button:Collapsible",
    activate: "button:Collapsible",
  },
  {
    id: "color-swatch",
    component: "ColorSwatch",
    kind: "value",
    subject: "ColorSwatch",
    subjectRole: "button",
    opens: "button:ColorSwatch",
    activate: "button:ColorSwatch",
  },
  {
    id: "color-wheel",
    component: "ColorWheel",
    kind: "display",
  },
  {
    id: "complex-color-wheel",
    component: "ComplexColorWheel",
    kind: "display",
  },
  {
    id: "composer",
    component: "Composer",
    kind: "value",
    subject: "Composer",
    subjectRole: "textbox",
    opens: "textbox:Composer",
    activate: "textbox:Composer",
  },
  {
    id: "cookie-consent",
    component: "CookieConsent",
    kind: "display",
  },
  {
    id: "data-grid",
    component: "DataGrid",
    kind: "display",
  },
  {
    id: "dialog",
    component: "Dialog",
    kind: "display",
  },
  { id: "dock", component: "Dock", kind: "display" },
  {
    id: "drawer",
    component: "Drawer",
    kind: "display",
  },
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
  {
    id: "firefox-pwa-banner",
    component: "FirefoxPWABanner",
    kind: "display",
  },
  { id: "flex", component: "Flex", kind: "display" },
  { id: "footer", component: "Footer", kind: "display" },
  { id: "form", component: "Form", kind: "display" },
  { id: "glow-card", component: "GlowCard", kind: "display" },
  { id: "grid", component: "Grid", kind: "display" },
  { id: "header", component: "Header", kind: "display" },
  { id: "icon", component: "Icon", kind: "display" },
  { id: "immersive-landing", component: "ImmersiveLanding", kind: "display" },
  {
    id: "inline-edit",
    component: "InlineEdit",
    kind: "value",
    subject: "InlineEdit",
    subjectRole: "textbox",
    opens: "textbox:InlineEdit",
    activate: "textbox:InlineEdit",
  },
  {
    id: "input",
    component: "Input",
    kind: "value",
    subject: "Input",
    subjectRole: "textbox",
    opens: "textbox:Input",
    activate: "textbox:Input",
  },
  { id: "label", component: "Label", kind: "display" },
  {
    id: "language-switcher",
    component: "LanguageSwitcher",
    kind: "display",
  },
  {
    id: "link",
    component: "Link",
    kind: "action",
    subject: "Link",
    subjectRole: "link",
  },
  {
    id: "list-box",
    component: "ListBox",
    kind: "display",
  },
  {
    id: "live-chat-bubble",
    component: "LiveChatBubble",
    kind: "action",
    subject: "LiveChatBubble",
    subjectRole: "button",
  },
  {
    id: "live-chat-panel",
    component: "LiveChatPanel",
    kind: "mode",
    subject: "LiveChatPanel",
    subjectRole: "button",
    opens: "button:LiveChatPanel",
    activate: "button:LiveChatPanel",
  },
  { id: "metal-border", component: "MetalBorder", kind: "display" },
  { id: "navbar", component: "Navbar", kind: "display" },
  {
    id: "pwa-install-prompt",
    component: "PWAInstallPrompt",
    kind: "display",
  },
  {
    id: "pagination",
    component: "Pagination",
    kind: "value",
    subject: "Pagination",
    subjectRole: "listitem",
    opens: "listitem:Pagination",
    activate: "listitem:Pagination",
  },
  {
    id: "password-field",
    component: "PasswordField",
    kind: "value",
    subject: "PasswordField",
    subjectRole: "textbox",
    opens: "textbox:PasswordField",
    activate: "textbox:PasswordField",
  },
  { id: "password-requirements", component: "PasswordRequirements", kind: "display" },
  {
    id: "popover",
    component: "Popover",
    kind: "display",
  },
  { id: "progress", component: "Progress", kind: "display" },
  {
    id: "radio",
    component: "Radio",
    kind: "value",
    subject: "Radio",
    subjectRole: "radio",
    opens: "radio:Radio",
    activate: "radio:Radio",
  },
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
  {
    id: "slider",
    component: "Slider",
    kind: "display",
  },
  { id: "spinner", component: "Spinner", kind: "display" },
  {
    id: "switch",
    component: "Switch",
    kind: "value",
    subject: "Switch",
    subjectRole: "checkbox",
    opens: "checkbox:Switch",
    activate: "checkbox:Switch",
  },
  {
    id: "table",
    component: "Table",
    kind: "display",
  },
  {
    id: "tabs",
    component: "Tabs",
    kind: "display",
  },
  { id: "text", component: "Text", kind: "display" },
  {
    id: "theme-color-picker",
    component: "ThemeColorPicker",
    kind: "display",
  },
  {
    id: "toast",
    component: "Toast",
    kind: "display",
  },
  {
    id: "tooltip",
    component: "Tooltip",
    kind: "display",
  },
];

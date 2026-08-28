/*
 * Every component the harness can mount, and what a person can do to it.
 *
 * This is the whole authoring surface. Adding a component to QA means adding
 * one entry here: a kind, a name, and the props to mount it with. The page
 * mounts it alone, and `generate-checks.ts` turns the entry into the ps-qa
 * checks its kind requires. Nothing else is written per component.
 *
 * ## Why one host per component
 *
 * Every component gets a clean document. Outcomes for that component share the
 * document so the 72-component sweep stays below two minutes. Preparation is
 * idempotent: a check opens its precondition only when it is not already open,
 * which also keeps every outcome reproducible by id against a fresh host.
 *
 * One component, one page, one fixture. The URL selects it, so a check restores
 * its own world by navigating rather than by undoing whatever it did.
 *
 * ## Kinds
 *
 * The kind decides which rendered outcomes are generated. AgencyZero's
 * ownership gate maps every imported value-bearing primitive back to these
 * same outcome families:
 *
 *   value  - carries a value a reader can see. Asserted on the control the
 *            reader looks at after a different option is activated.
 *   mode   - swaps one thing for another. Must prove it opens, does its work,
 *            and leaves by each exit a reader has.
 *   field  - accepts native text input and exposes the changed value.
 *   slider - changes its exposed value through its keyboard contract.
 *   inline-edit - opens, commits a controlled value, and abandons a draft.
 *   action - does something once and shows it happened.
 *   display- only ever paints.
 */

/*
 * `toggle` exists because Switch, Radio and Checkbox were declared `value`,
 * which is the menu-shaped contract: it generates `-opens`, `-changes` and
 * `-escape-closes`, and asserts that activating an option changes what a
 * trigger reads. A toggle has no menu, no options and no trigger text, so all
 * three checks were unsatisfiable and all three failed for a reason that had
 * nothing to do with the component.
 *
 * A toggle's whole contract is that clicking it flips its state, which the
 * tree reports as `selected`.
 */
export type ComponentKind =
  | "value"
  | "mode"
  | "action"
  | "toggle"
  | "field"
  | "slider"
  | "inline-edit"
  | "display";

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
    kind: "toggle",
    // Measured: role `checkbox`, empty name, 1x1 at (79,116).
    subjectRole: "checkbox",
  },
  { id: "chip", component: "Chip", kind: "display" },
  {
    id: "collapsible",
    component: "Collapsible",
    /*
     * `display`, not `mode`.
     *
     * As a `mode` this generated three checks that all named the trigger as the
     * thing that opens, changes and vanishes, which is the one node that does
     * none of those: a disclosure trigger keeps its label and stays on screen
     * whether the content is shown or hidden. `-changes` asserted the trigger's
     * name changes (it reads "Collapsible" either way) and `-escape-closes`
     * asserted the trigger vanishes (it was still there at 71x24, correctly).
     *
     * The content is what appears and disappears, but measured, it carries no
     * accessible name at all: the tree holds `button:Collapsible` and the
     * content only as an unnamed box. So the trigger is what a check can
     * address, and what it can honestly assert is that it painted. The fixture
     * measures 1184x48 with the content open, against 24 for the trigger alone,
     * which is the evidence the content rendered.
     *
     * Asserting the disclosure behaviour needs a fixture that starts closed and
     * content that names itself.
     */
    kind: "action",
    subject: "Collapsible",
    subjectRole: "button",
  },
  {
    id: "color-swatch",
    component: "ColorSwatch",
    // Measured: role `option`, 32x32, named "Color undefined". Not a button,
    // and not a menu, so `value` generated three checks against a control that
    // does not exist.
    //
    // The name is a real defect rather than a fixture artefact: the component
    // interpolates a colour prop into its accessible name without checking it
    // is set, so a swatch with no colour announces itself as "Color undefined"
    // to anyone using assistive technology. Left asserted as measured, so the
    // check goes green only once that is fixed and the name changes.
    kind: "display",
    subject: "Color undefined",
    subjectRole: "option",
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
    // Measured: role `textbox` (empty name) and `button:Send`, disabled until
    // there is something to send.
    kind: "action",
    subject: "Send",
    subjectRole: "button",
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
    // Measured: the trigger reads "Effort: medium", not "Effort". A subject of
    // "Effort" matched nothing, so every check that had to press it first
    // failed before reaching its own assertion.
    subject: "Effort:",
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
    kind: "inline-edit",
    subject: "Edit title",
    subjectRole: "button",
    opens: "textbox:Edit title",
  },
  {
    id: "input",
    component: "Input",
    kind: "field",
    subject: "Fixture input",
    subjectRole: "textbox",
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
    /*
     * Measured: without `href` the element reaches the tree as a `generic`, not
     * a `link`, because Blitz only maps `<a>` to the link role when it has one.
     * The component mounted and painted correctly the whole time; the check
     * asked for a role the fixture had not given it the means to have.
     */
    props: { href: "#link" },
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
    // Measured: `button:"Open chat"`, 56x56, pinned bottom-right. It never
    // named itself "LiveChatBubble"; that was the component's name standing in
    // for a control nobody had looked at.
    subject: "Open chat",
    subjectRole: "button",
  },
  {
    id: "live-chat-panel",
    component: "LiveChatPanel",
    /*
     * Measured: the panel renders open at 400x720 and holds
     * `heading:"Chat with us"`, `button:"Close chat"` and a disabled
     * `button:"Send"`. There is no trigger, because the panel *is* the opened
     * state; the bubble next door is what opens one.
     *
     * So `mode` was wrong in the same way Collapsible's was: it asserted that
     * something called "LiveChatPanel" opens, changes and closes, and no node
     * of that name exists at all. Closing is the bubble's contract, not this
     * component's.
     */
    kind: "action",
    subject: "Close chat",
    subjectRole: "button",
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
    // Measured: `navigation:pagination`, and buttons that do name themselves,
    // "Go to page 1", "Go to next page", "Go to previous page". The previous
    // and next controls are disabled on a single-page fixture, so the page
    // button is the one a check can press.
    kind: "action",
    subject: "Go to page 1",
    subjectRole: "button",
  },
  {
    id: "password-field",
    component: "PasswordField",
    // Measured: role `textbox` (empty name) plus an unnamed `button` at 28x28,
    // which is the reveal control and has no accessible name at all.
    kind: "display",
    subjectRole: "textbox",
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
    kind: "toggle",
    // Measured: role `radio`, empty name, 1x1 at (79,103).
    subjectRole: "radio",
  },
  { id: "scroll-area", component: "ScrollArea", kind: "display" },
  {
    id: "select",
    component: "Select",
    kind: "value",
    // Measured: the trigger reads "Session: first fixture". The options exist
    // in the tree but at 0x0 hidden until it opens.
    subject: "Session:",
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
    kind: "slider",
    subject: "Fixture slider",
    subjectRole: "slider",
  },
  { id: "spinner", component: "Spinner", kind: "display" },
  {
    id: "switch",
    component: "Switch",
    kind: "toggle",
    // Measured: role `switch`, empty name, 1x1 at (79,116). The visible control
    // is a styled sibling; this is the real input. It had `checkbox:Switch`,
    // which is wrong in both halves.
    subjectRole: "switch",
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
    id: "textarea",
    component: "Textarea",
    kind: "field",
    subject: "Fixture textarea",
    subjectRole: "textbox",
  },
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

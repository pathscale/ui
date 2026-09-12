import { componentFamilies } from "../../src/component-families";

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
 *   action - does something once and exposes the callback result.
 *   overlay - opens real portalled content and closes it with Escape.
 *   tabs - changes the selected tab and the rendered panel together.
 *   adjustment - changes a controlled semantic choice.
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
  | "form"
  | "calendar"
  | "slider"
  | "inline-edit"
  | "overlay"
  | "tabs"
  | "adjustment"
  | "custom"
  | "display"
  /*
   * settings - the panel swaps to plain inputs behind a toggle and commits them
   *            on an explicit save. Asserts all three layers: the toggle
   *            reveals the inputs, typing alone commits nothing, and the save
   *            button commits.
   */
  | "settings";

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
  /** Stable selector for the subject when its authored DOM id is the contract. */
  subjectSelector?: string;
  /**
   * For `settings`: the value a check types into `opens`, and the node that
   * proves it was committed rather than merely typed.
   */
  commitText?: string;
  committed?: string;
  uncommitted?: string;
  /**
   * For `settings`: a second value, for the check that asserts what the
   * reconnect was handed.
   *
   * Distinct from `commitText` on purpose. The checks in a group share a host,
   * so that one is already in storage by the time the reconnect check runs, and
   * asserting it again passes whether or not this save persisted anything.
   */
  reconnectText?: string;
  /** For `settings`: the control that commits the draft. */
  commit?: string;
  /** For `value`/`mode`/`tabs`: the option, item or tab to activate. */
  activate?: string;
  /** Node that proves an overlay/editor opened or a tab panel changed. */
  opens?: string;
  /** Menu content that must not remain in the renderer while closed. */
  closedContent?: string;
  /** Mount props. Kept literal so the fixture is readable in one glance. */
  props?: Record<string, unknown>;
  /** Option labels, for components that need children. */
  options?: { value: string; label: string }[];
  /** First-frame rendered family whose members must be distinct and contained. */
  geometry?: {
    family: string;
    container: string;
    /** Pointer target whose authored hover feedback must change rendered pixels. */
    changesOnHover?: string;
    /** Desktop relationship that must not collapse into the narrow stack. */
    rightOf?: { subject: string; compare: string };
    /** Side-by-side regions whose rendered vertical centers must align. */
    centerAlignedY?: { subject: string; compare: string };
  };
  /** Exact authored control geometry, before app zoom or theme scaling. */
  measure?: { subject: string; size: string };
  /** Named painted family that must meet the native contrast floor. */
  contrast?: string;
  /** Component-specific native outcomes for behavior outside the shared kinds. */
  outcomes?: {
    suffix: string;
    what: string;
    subject: string;
    expect: string;
    paint?: boolean;
    hover?: string;
    covers?: string[];
    click?: string;
    prepare?: string;
    prepareUnless?: string;
    settleAfterMs?: number;
    key?: string;
    keyOn?: string;
    typeInto?: string;
    text?: string;
    pointerDrag?: { from: string; dx: number; dy: number; steps: number };
  }[];
};

export const COMPONENTS: ComponentSpec[] = [
  {
    id: "accordion",
    component: "Accordion",
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "activating an accordion trigger reveals its panel", click: "button:First section", subject: "heading:First panel", expect: "PaintsNamed", paint: true },
      { suffix: "reports", what: "the accordion reports its controlled selection", click: "button:First section", subject: "heading:Accordion value:", expect: "NameChanges" },
    ],
  },
  {
    id: "address", component: "Address", kind: "custom",
    outcomes: [
      { suffix: "copies", what: "copying an address reports the full value to its caller", click: "button:Copy address", subject: "heading:Address copied:", expect: "NameChanges" },
    ],
  },
  {
    id: "alert", component: "Alert", kind: "custom",
    outcomes: [
      { suffix: "dismisses", what: "the alert dismiss control invokes its owner", click: "button:Dismiss fixture alert", subject: "heading:Alert dismissed", expect: "PaintsNamed", paint: true },
    ],
  },
  { id: "auth-card", component: "AuthCard", kind: "display" },
  { id: "auth-field-group", component: "AuthFieldGroup", kind: "display" },
  {
    id: "auth-footer-links", component: "AuthFooterLinks", kind: "custom",
    outcomes: [
      { suffix: "follows-link", what: "an auth footer link invokes its callback before navigation", click: "link:Privacy fixture", subject: "heading:Auth footer action:", expect: "NameChanges" },
      { suffix: "runs-action", what: "an auth footer action remains a semantic button", click: "button:Help fixture", subject: "heading:Auth footer action:", expect: "NameChanges" },
    ],
  },
  { id: "auth-message", component: "AuthMessage", kind: "display" },
  {
    id: "auth-powered-by", component: "AuthPoweredBy", kind: "custom",
    outcomes: [
      { suffix: "navigates", what: "the powered-by attribution exposes an operable Honey link", click: "link:Secure Auth by Honey", subject: "heading:Honey link activated", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "auth-submit-button",
    component: "AuthSubmitButton",
    kind: "action",
    subject: "AuthSubmitButton",
    subjectRole: "button",
  },
  { id: "avatar", component: "Avatar", kind: "display" },
  { id: "badge", component: "Badge", kind: "display" },
  {
    id: "breadcrumb", component: "Breadcrumb", kind: "custom",
    outcomes: [
      { suffix: "navigates", what: "a breadcrumb link remains operable inside the compound list", click: "link:Products fixture", subject: "heading:Breadcrumb activated", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "button",
    component: "Button",
    kind: "action",
    subject: "Button",
    subjectRole: "button",
    /*
     * The default height, asserted here and on Input, so the two cannot drift
     * apart again.
     *
     * `--control-h-*` gave them the same height at the same named size and left
     * them defaulting to different names, so an unsized Button was 2.25rem
     * beside an unsized Input at 2.5rem. Nothing in this library passes a size
     * to either, so every row of them was 4px out. Height only -- the width is
     * the label.
     */
    measure: { subject: "button:Button", size: "x=36" },
  },
  {
    id: "calendar",
    component: "Calendar",
    kind: "calendar",
    subject: "Tuesday, June 24, 2025",
    subjectRole: "gridcell",
  },
  {
    id: "card", component: "Card", kind: "custom",
    outcomes: [
      { suffix: "activates", what: "an interactive card invokes its consumer callback", click: "button:Interactive fixture card", subject: "heading:Card activated", expect: "PaintsNamed", paint: true },
    ],
  },
  { id: "chat-bubble", component: "ChatBubble", kind: "display" },
  {
    id: "close-button",
    component: "CloseButton",
    kind: "action",
    subject: "Close fixture",
    subjectRole: "button",
  },
  {
    id: "checkbox",
    component: "Checkbox",
    kind: "toggle",
    subject: "Checkbox",
    subjectRole: "checkbox",
  },
  {
    id: "chip", component: "Chip", kind: "custom",
    outcomes: [
      { suffix: "removes", what: "the removable chip invokes its owner", click: "button:Remove fixture chip", subject: "heading:Chip removed", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "collapsible",
    component: "Collapsible",
    /*
     * A disclosure trigger stays named and visible in both states, so menu-like
     * NameChanges/Vanishes outcomes are wrong. The fixture starts closed and
     * names its content as the callback result; activating the trigger must
     * make that result paint.
     */
    kind: "action",
    subject: "Collapsible",
    subjectRole: "button",
  },
  {
    id: "connection-settings",
    component: "ConnectionSettings",
    /*
     * The switch is the whole point. Every hand-written copy of this panel read
     * its flag once, outside a tracked scope, so the checkbox flipped and the
     * fields never appeared. `opens` is what turns that into an outcome instead
     * of something a person has to click to notice.
     */
    kind: "settings",
    subject: "Use a custom backend",
    // Measured, not assumed: the tree reports role `switch` for the input, and
    // declaring `checkbox` made both interaction checks fail on a control that
    // was painting perfectly well.
    subjectRole: "switch",
    opens: "textbox:API URL",
    commit: "button:Save",
    commitText: "ws://qa-committed",
    reconnectText: "ws://qa-reconnected",
    uncommitted: "heading:Committed: wss://api.example.com",
    committed: "heading:Committed: ws://qa-committed",
  },
  {
    id: "color-swatch",
    component: "ColorSwatch",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "a standalone swatch reports its color to its owner", click: "option:Fixture blue", subject: "heading:ColorSwatch selected: #0000ff", expect: "PaintsNamed", paint: true },
    ],
  },
  /*
   * The flower on its own, with no `ThemeColorPicker` around it.
   *
   * That is the arrangement that used to throw. It is exported from
   * `@pathscale/ui/lab`, so a reader can write exactly this, and it read a
   * context declared `createContext(undefined)` -- the default-less form in
   * Solid 2, which throws `ContextNotFoundError` before the component's own
   * "you must use this inside a provider" guard can run. The throw halted the
   * reactive system and blanked the page it was on.
   *
   * `complex-color-wheel` did not cover it: that fixture mounts the flower
   * under a wheel that supplies the context, which is the case that always
   * worked.
   */
  {
    id: "color-wheel-flower",
    component: "ColorWheelFlower",
    kind: "custom",
    /*
     * The centre petal, by name.
     *
     * Not the component name: the fixture renders that on a labelled wrapper,
     * so it is there whether or not the component rendered anything, and a
     * check that asserts it passes against a component that threw. This name
     * comes from inside the flower, so nothing paints it unless the flower
     * built its palette.
     */
    subject: "Reset to neutral",
    subjectRole: "radio",
    outcomes: [
      { suffix: "selects", what: "a flower petal changes the controlled color", click: "radio:Theme color #DDA82C", subject: "radio:Theme color #DDA82C", expect: "SelectionChanges", covers: ["radio:*"] },
      { suffix: "reports", what: "the standalone flower reports the selected color", click: "radio:Theme color #DD732C", subject: "heading:ColorWheelFlower changed", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "color-wheel",
    component: "ColorWheel",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "a color wheel petal changes the controlled selection", click: "radio:Theme color #DDA82C", subject: "radio:Theme color #DDA82C", expect: "SelectionChanges", covers: ["radio:*"] },
      { suffix: "reports", what: "the color wheel reports the selected literal", click: "radio:Theme color #DD732C", subject: "heading:ColorWheel value:", expect: "NameChanges" },
    ],
  },
  {
    id: "complex-color-wheel",
    component: "ComplexColorWheel",
    kind: "custom",
    subject: "Strength 20",
    subjectRole: "button",
    geometry: {
      family: "radio:Theme color ",
      container: "@color-wheel-flower",
      // No `changesOnHover` any more. The dot under a swatch is meant to
      // scale by 1.1 on hover, and the check compared the rendered pixels of
      // the flower before and after. Against `chuzz-headless` it reports every
      // pixel unchanged, while hover itself demonstrably works there: a rule
      // that reveals a sibling on `:hover` reveals it, and a rule that resizes
      // the hovered control resizes it in the tree. So the difference is in
      // the pixel comparison rather than in hover, and asking a question whose
      // answer is about the comparison rather than about the component is
      // worse than not asking it. Reinstate it with the cause found.
      rightOf: {
        subject: "button:Strength 20",
        compare: "@color-wheel-flower",
      },
      centerAlignedY: {
        subject: "@color-wheel-flower",
        compare: "@complex-color-wheel-adjustments",
      },
    },
    contrast: "Theme color ",
    outcomes: [
      { suffix: "adjusts", what: "choosing an adjustment updates its controlled selection", click: "button:Strength 20", subject: "button:Strength 20", expect: "SelectionChanges", covers: ["button:Strength *"] },
      { suffix: "selects-color", what: "choosing a flower petal updates the controlled color", click: "radio:Theme color #DDA82C", subject: "radio:Theme color #DDA82C", expect: "SelectionChanges", covers: ["radio:*"] },
    ],
  },
  {
    id: "composer",
    component: "Composer",
    kind: "custom",
    outcomes: [
      { suffix: "accepts", what: "typing into Composer updates its controlled draft", typeInto: "textbox:Fixture message", text: "QA message", subject: "heading:Composer draft: QA message", expect: "PaintsNamed", paint: true },
      { suffix: "submits", what: "sending Composer reports its trimmed message", click: "button:Send", subject: "heading:Composer submitted: QA message", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "cookie-consent",
    component: "CookieConsent",
    kind: "custom",
    outcomes: [
      { suffix: "manages", what: "cookie consent opens its preference dialog", click: "button:Manage M", subject: "heading:Manage M preferences", expect: "PaintsNamed", paint: true, covers: ["button:Manage *"] },
      { suffix: "saves-custom", what: "saving managed preferences reports custom consent", click: "button:Save M", subject: "heading:Cookie consent M: custom", expect: "PaintsNamed", paint: true },
      { suffix: "accepts-all", what: "accepting all cookies reports full consent", click: "button:Accept all A", subject: "heading:Cookie consent A: all", expect: "PaintsNamed", paint: true, covers: ["button:Accept all *"] },
      { suffix: "declines", what: "declining optional cookies reports essential consent", click: "button:Decline D", subject: "heading:Cookie consent D: essential", expect: "PaintsNamed", paint: true, covers: ["button:Decline *"] },
    ],
  },
  {
    id: "data-grid",
    component: "DataGrid",
    kind: "custom",
    outcomes: [
      { suffix: "sorts", what: "a sortable grid column reports its next direction", click: "columnheader:Name", subject: "heading:Grid sort:", expect: "NameChanges" },
      { suffix: "selects-row", what: "a row checkbox reports the selected row identity", click: "checkbox:Select row", subject: "heading:Grid selection:", expect: "NameChanges", covers: ["checkbox:Select row"] },
      { suffix: "selects-page", what: "the select-all checkbox selects every row on the current page", click: "checkbox:Select all rows", subject: "heading:Grid selection:", expect: "NameChanges" },
      { suffix: "pages", what: "the grid pager reports the next page", click: "button:Next page", subject: "heading:Grid page:", expect: "NameChanges" },
      { suffix: "filters", what: "the grid search field filters the source rows", typeInto: "Search Name", text: "Gam", subject: "heading:Grid first filtered row:", expect: "NameChanges" },
    ],
  },
  {
    id: "dialog",
    component: "Dialog",
    kind: "overlay",
    subject: "Open dialog",
    subjectRole: "button",
    opens: "heading:Dialog outcome",
  },
  {
    id: "dock", component: "Dock", kind: "custom",
    outcomes: [
      { suffix: "acts", what: "a dock item invokes its owner", click: "button:Search", subject: "heading:Dock selected: Search", expect: "PaintsNamed", paint: true, covers: ["button:Home", "button:Search", "button:Settings"] },
    ],
  },
  {
    id: "drawer",
    component: "Drawer",
    kind: "overlay",
    subject: "Open drawer",
    subjectRole: "button",
    opens: "heading:Drawer outcome",
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
    subjectSelector: "#qa-dropdown--trigger",
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
    kind: "custom",
    outcomes: [
      { suffix: "installs", what: "the Firefox extension action invokes its consumer callback", click: "button:Install extension A", subject: "heading:Firefox PWA outcome:", expect: "NameChanges", covers: ["button:Install extension *"] },
      { suffix: "defers", what: "the Firefox later action dismisses the banner", click: "button:Maybe later B", subject: "heading:Firefox PWA outcome:", expect: "NameChanges", covers: ["button:Maybe later *"] },
      { suffix: "closes", what: "the Firefox close action dismisses the banner", click: "button:Close Firefox C", subject: "heading:Firefox PWA outcome:", expect: "NameChanges", covers: ["button:Close Firefox *"] },
    ],
  },
  { id: "flex", component: "Flex", kind: "display" },
  { id: "footer", component: "Footer", kind: "display" },
  { id: "form", component: "Form", kind: "form", subject: "Save quantity", subjectRole: "button" },
  { id: "glow-card", component: "GlowCard", kind: "display" },
  { id: "grid", component: "Grid", kind: "display" },
  { id: "header", component: "Header", kind: "display" },
  { id: "icon", component: "Icon", kind: "display" },
  {
    id: "immersive-landing", component: "ImmersiveLanding", kind: "custom",
    outcomes: [
      { suffix: "navigates", what: "landing navigation changes the active page and reports the route", click: "button:Go to page 2 of 2", subject: "heading:Landing navigation: first to second", expect: "PaintsNamed", paint: true, covers: ["button:Go to page 1 of 2", "button:Go to page 2 of 2", "button:Next page"] },
    ],
  },
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
    // The other half of the pair. See Button above.
    // The control wrapper, not the inner `input`: the height is on the box a
    // person sees, and the element inside it is 17px of text.
    measure: { subject: "@input-control", size: "x=36" },
  },
  { id: "label", component: "Label", kind: "display" },
  {
    id: "language-switcher",
    component: "LanguageSwitcher",
    kind: "value",
    subject: "Current language: English",
    subjectRole: "button",
    subjectSelector: "#qa-language-switcher--trigger",
    activate: "menuitem:Chinese",
    opens: "menuitem:Chinese",
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
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "choosing a listbox item changes its controlled selection", click: "option:Second item", subject: "option:Second item", expect: "SelectionChanges" },
      { suffix: "reports", what: "the listbox reports the selected key", click: "option:First item", subject: "heading:ListBox value:", expect: "NameChanges" },
    ],
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
    kind: "custom",
    outcomes: [
      { suffix: "accepts-message", what: "the chat composer accepts a message", typeInto: "textbox:Message support...", text: "Hello support", subject: "textbox:Message support...", expect: "ValueChanges" },
      { suffix: "sends-message", what: "the chat panel hands the message to its owner", click: "button:Send", subject: "heading:LiveChat sent: Hello support", expect: "PaintsNamed", paint: true },
      { suffix: "closes", what: "the chat panel close control invokes its owner", click: "button:Close chat", subject: "heading:Action result: LiveChatPanel complete", expect: "PaintsNamed", paint: true },
    ],
  },
  { id: "metal-border", component: "MetalBorder", kind: "display" },
  { id: "navbar", component: "Navbar", kind: "display" },
  {
    id: "pwa-install-prompt",
    component: "PWAInstallPrompt",
    kind: "custom",
    outcomes: [
      { suffix: "installs", what: "accepting the browser install prompt reports installation", click: "button:Install A", subject: "heading:PWA outcome:", expect: "NameChanges", covers: ["button:Install *"] },
      { suffix: "defers", what: "the not-now action dismisses the prompt and reports deferral", click: "button:Not now B", subject: "heading:PWA outcome:", expect: "NameChanges", covers: ["button:Not now *"] },
      { suffix: "closes", what: "the close action dismisses the prompt and reports closure", click: "button:Close C", subject: "heading:PWA outcome:", expect: "NameChanges", covers: ["button:Close *"] },
    ],
  },
  {
    id: "pagination",
    component: "Pagination",
    // Measured: `navigation:pagination`, with named previous/next controls. The
    // fixture has two controlled pages, so Next must call onChange.
    kind: "custom",
    outcomes: [
      { suffix: "changes", what: "pagination reports the next page to its owner", click: "button:Go to next page", subject: "heading:Action result: Pagination complete", expect: "PaintsNamed", paint: true, covers: ["button:Go to *"] },
    ],
  },
  {
    id: "panel-toggle",
    component: "PanelToggle",
    kind: "action",
    subject: "Hide details",
    subjectRole: "button",
    measure: { subject: "button:Hide details", size: "8x48" },
  },
  {
    id: "password-field",
    component: "PasswordField",
    kind: "custom",
    outcomes: [
      { suffix: "accepts", what: "typing updates the controlled password value", typeInto: "textbox:Password", text: "secret", subject: "heading:Password value: secret", expect: "PaintsNamed", paint: true },
      { suffix: "reveals", what: "the visibility control reports its pressed state", click: "button:Show password", subject: "button:Hide password", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "password-requirements",
    component: "PasswordRequirements",
    kind: "display",
  },
  {
    id: "popover",
    component: "Popover",
    kind: "overlay",
    subject: "Open popover",
    subjectRole: "button",
    opens: "heading:Popover outcome",
  },
  { id: "progress", component: "Progress", kind: "display" },
  {
    id: "radio",
    component: "Radio",
    kind: "toggle",
    subject: "Radio",
    subjectRole: "radio",
  },
  { id: "scroll-area", component: "ScrollArea", kind: "display" },
  {
    id: "select",
    component: "Select",
    kind: "value",
    // The trigger reads "Session: first fixture" before the menu first opens,
    // while the option nodes themselves stay out of the renderer until then.
    subject: "Session:",
    subjectRole: "button",
    subjectSelector: "#qa-select-trigger",
    activate: "option:second fixture",
    opens: "option:first fixture",
    closedContent: "option:first fixture",
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
    subject: "Switch",
    subjectRole: "switch",
  },
  {
    id: "table",
    component: "Table",
    kind: "custom",
    outcomes: [
      { suffix: "sorts", what: "a sortable table column reports its next direction", click: "Name fixture", subject: "heading:Table sort:", expect: "NameChanges" },
    ],
  },
  {
    id: "tabs",
    component: "Tabs",
    kind: "custom",
    outcomes: [
      { suffix: "changes", what: "activating another tab changes controlled selection", click: "tab:Second", subject: "tab:Second", expect: "SelectionChanges", covers: ["tab:*"] },
      { suffix: "changes-panel", what: "the selected tab exposes its corresponding panel", subject: "heading:Second panel", expect: "PaintsNamed", paint: true },
    ],
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
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "the theme color trigger opens its palette", click: "button:Change theme color", subject: "button:Black", expect: "PaintsNamed", paint: true },
      { suffix: "switches-theme", what: "choosing a grayscale swatch reports the requested theme", click: "button:Black", subject: "heading:ThemeColorPicker theme: light", expect: "PaintsNamed", paint: true, covers: ["button:White", "button:Light gray", "button:Gray", "button:Dark gray", "button:Charcoal", "button:Black"] },
    ],
  },
  {
    id: "toast",
    component: "Toast",
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "requesting a toast paints its queued action", click: "button:Show fixture toast", subject: "button:Undo fixture", expect: "PaintsNamed", paint: true },
      { suffix: "acts", what: "the toast action invokes its consumer callback", click: "button:Undo fixture", subject: "heading:Toast outcome:", expect: "NameChanges" },
      { suffix: "closes", what: "the toast close control removes the notification", click: "button:Dismiss notification", subject: "button:Dismiss notification", expect: "Vanishes" },
    ],
  },
  {
    id: "tooltip",
    component: "Tooltip",
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "hovering the tooltip trigger reveals its content", hover: "button:Tooltip target", subject: "tooltip:Fixture tooltip", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "button-group", component: "ButtonGroup", kind: "custom",
    outcomes: [
      { suffix: "contains-actions", what: "grouped buttons remain operable", click: "button:First grouped button", subject: "heading:ButtonGroup selected: first", expect: "PaintsNamed", paint: true, covers: ["button:* grouped button"] },
    ],
  },
  {
    id: "checkbox-group",
    component: "CheckboxGroup",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "selecting a grouped checkbox changes its controlled selection", click: "checkbox:Second choice", subject: "checkbox:Second choice", expect: "SelectionChanges" },
      { suffix: "reports", what: "selecting a grouped checkbox reports the new values", click: "checkbox:First choice", subject: "heading:CheckboxGroup value:", expect: "NameChanges" },
    ],
  },
  {
    id: "color-area",
    component: "ColorArea",
    kind: "custom",
    outcomes: [
      { suffix: "keyboard-changes", what: "ArrowRight changes the controlled saturation", key: "ArrowRight", keyOn: "slider:Color area", subject: "slider:Color area", expect: "ValueChanges" },
      { suffix: "reports", what: "keyboard adjustment reports the new color area value", key: "ArrowRight", keyOn: "slider:Color area", subject: "heading:ColorArea changed", expect: "Present" },
      { suffix: "pointer-changes", what: "pointer dragging changes the controlled saturation", pointerDrag: { from: "slider:Color area", dx: -80, dy: 20, steps: 4 }, subject: "slider:Color area", expect: "ValueChanges" },
    ],
  },
  {
    id: "color-field",
    component: "ColorField",
    kind: "custom",
    outcomes: [
      { suffix: "accepts", what: "typing a valid color changes the field value", typeInto: "textbox:Color value", text: "#112233", subject: "textbox:Color value", expect: "ValueChanges" },
      { suffix: "reports", what: "typing a valid color reports the normalized value", typeInto: "textbox:Color value", text: "#112233", subject: "heading:ColorField value: #112233", expect: "Present" },
    ],
  },
  {
    id: "color-picker",
    component: "ColorPicker",
    kind: "custom",
    outcomes: [
      { suffix: "hue-changes", what: "the composed hue slider changes the controlled color", key: "ArrowRight", keyOn: "slider:Hue", subject: "slider:Hue", expect: "ValueChanges" },
      { suffix: "area-changes", what: "the composed color area changes the controlled color", key: "ArrowRight", keyOn: "slider:Color area", subject: "slider:Color area", expect: "ValueChanges" },
      { suffix: "field-reports", what: "the composed color field reports a typed literal", typeInto: "textbox:Color value", text: "#112233", subject: "heading:ColorPicker value:", expect: "NameChanges" },
    ],
  },
  {
    id: "color-slider",
    component: "ColorSlider",
    kind: "custom",
    outcomes: [
      { suffix: "keyboard-changes", what: "ArrowRight changes the controlled hue", key: "ArrowRight", keyOn: "slider:Hue", subject: "slider:Hue", expect: "ValueChanges" },
      { suffix: "reports", what: "the hue slider reports the changed value", key: "ArrowRight", keyOn: "slider:Hue", subject: "heading:ColorSlider changed", expect: "Present" },
      { suffix: "pointer-changes", what: "pointer dragging changes the controlled hue", pointerDrag: { from: "slider:Hue", dx: 100, dy: 0, steps: 4 }, subject: "slider:Hue", expect: "ValueChanges" },
    ],
  },
  {
    id: "color-swatch-picker",
    component: "ColorSwatchPicker",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "choosing another swatch changes its controlled selection", click: "radio:Blue swatch", subject: "radio:Blue swatch", expect: "SelectionChanges", covers: ["radio:* swatch"] },
      { suffix: "reports", what: "choosing another swatch reports the color", click: "radio:Blue swatch", subject: "heading:ColorSwatchPicker value: #0000ff", expect: "Present" },
    ],
  },
  {
    id: "combo-box",
    component: "ComboBox",
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "the ComboBox opens an addressable listbox", click: "button:Toggle options", subject: "option:Beta", expect: "PaintsNamed", paint: true },
      { suffix: "selects", what: "choosing an option changes the controlled input value", prepare: "button:Toggle options", prepareUnless: "option:Beta", click: "option:Beta", subject: "combobox:Fixture combo box", expect: "ValueChanges" },
      { suffix: "reports", what: "choosing another option reports the selected key", prepare: "button:Toggle options", prepareUnless: "option:Alpha", click: "option:Alpha", subject: "heading:ComboBox value:", expect: "NameChanges" },
      { suffix: "accepts-query", what: "typing a query clears the committed selection", typeInto: "combobox:Fixture combo box", text: "Gam", subject: "heading:ComboBox value:", expect: "NameChanges" },
    ],
  },
  {
    id: "date-field",
    component: "DateField",
    kind: "custom",
    outcomes: [
      { suffix: "accepts", what: "typing changes the date field value", typeInto: "textbox:Date value", text: "2025-06-24", subject: "textbox:Date value", expect: "ValueChanges" },
      { suffix: "reports", what: "typing reports the date value", typeInto: "textbox:Date value", text: "2025-06-24", subject: "heading:DateField value: 2025-06-24", expect: "Present" },
    ],
  },
  {
    id: "date-picker",
    component: "DatePicker",
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "the date picker opens its calendar dialog", click: "button:Jun 15, 2025", subject: "dialog:", expect: "PaintsNamed", paint: true },
      { suffix: "selects", what: "choosing a date reports the controlled value", prepare: "button:Jun 15, 2025", prepareUnless: "dialog:", click: "gridcell:Tuesday, June 24, 2025", subject: "heading:DatePicker value: 2025-06-24", expect: "Present" },
    ],
  },
  {
    id: "date-range-picker",
    component: "DateRangePicker",
    kind: "custom",
    outcomes: [
      { suffix: "opens", what: "the date range picker opens its calendar dialog", click: "button:Jun 15, 2025 Jun 17, 2025", subject: "dialog:", expect: "PaintsNamed", paint: true },
      { suffix: "starts", what: "choosing a date starts a pending range", prepare: "button:Jun 15, 2025 Jun 17, 2025", prepareUnless: "dialog:", click: "gridcell:Tuesday, June 24, 2025", subject: "gridcell:Tuesday, June 24, 2025", expect: "SelectionChanges" },
      { suffix: "completes", what: "choosing a second date completes the controlled range", click: "gridcell:Thursday, June 26, 2025", subject: "heading:DateRangePicker end: 2025-06-26", expect: "Present" },
    ],
  },
  {
    id: "flex-grid",
    component: "FlexGrid",
    kind: "custom",
    outcomes: [
      {
        suffix: "reveals-more",
        what: "the incremental grid reveals its next page when asked",
        click: "button:Load more rows",
        subject: "heading:Row Three",
        expect: "PaintsNamed",
        paint: true,
      },
    ],
  },
  {
    id: "input-otp",
    component: "InputOTP",
    kind: "custom",
    outcomes: [
      { suffix: "accepts", what: "typing fills the one-time password value", typeInto: "textbox:Verification code", text: "123456", subject: "textbox:Verification code", expect: "ValueChanges" },
      { suffix: "reports", what: "typing reports the one-time password", typeInto: "textbox:Verification code", text: "123456", subject: "heading:InputOTP value: 123456", expect: "Present" },
    ],
  },
  {
    id: "join", component: "Join", kind: "custom",
    outcomes: [
      { suffix: "contains-actions", what: "joined buttons remain operable", click: "button:First joined button", subject: "heading:Join selected: first", expect: "PaintsNamed", paint: true, covers: ["button:* joined button"] },
    ],
  },
  { id: "kbd", component: "Kbd", kind: "display" },
  {
    id: "menu",
    component: "Menu",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "activating a menu item changes its controlled selection", click: "menuitemradio:Beta action", subject: "menuitemradio:Beta action", expect: "SelectionChanges", covers: ["menuitemradio:* action"] },
      { suffix: "reports", what: "activating a menu item reports its selected key", click: "menuitemradio:Beta action", subject: "heading:Menu value: b", expect: "Present" },
    ],
  },
  { id: "meter", component: "Meter", kind: "display" },
  { id: "noise-background", component: "NoiseBackground", kind: "display" },
  { id: "radial-progress", component: "RadialProgress", kind: "display" },
  {
    id: "radio-group",
    component: "RadioGroup",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "choosing another grouped radio changes controlled selection", click: "radio:Second radio", subject: "radio:Second radio", expect: "SelectionChanges", covers: ["radio:* radio"] },
      { suffix: "reports", what: "choosing another grouped radio reports its value", click: "radio:Second radio", subject: "heading:RadioGroup value: second", expect: "Present" },
    ],
  },
  {
    id: "range-calendar",
    component: "RangeCalendar",
    kind: "custom",
    outcomes: [
      { suffix: "starts", what: "choosing a date starts a pending range", click: "gridcell:Tuesday, June 24, 2025", subject: "gridcell:Tuesday, June 24, 2025", expect: "SelectionChanges" },
      { suffix: "completes", what: "choosing a second date completes the controlled range", click: "gridcell:Thursday, June 26, 2025", subject: "heading:RangeCalendar end: 2025-06-26", expect: "Present" },
      { suffix: "next-month", what: "the next-month control advances the visible calendar", click: "button:Next month", subject: "heading:July 2025", expect: "PaintsNamed", paint: true },
      { suffix: "previous-month", what: "the previous-month control returns to the prior calendar", click: "button:Previous month", subject: "heading:June 2025", expect: "PaintsNamed", paint: true },
    ],
  },
  {
    id: "size-picker",
    component: "SizePicker",
    kind: "custom",
    outcomes: [
      { suffix: "selects", what: "choosing a size changes its selected radio", click: "radio:Size L", subject: "radio:Size L", expect: "SelectionChanges", covers: ["radio:Size *"] },
      { suffix: "reports", what: "choosing a size reports the preset", click: "radio:Size L", subject: "heading:SizePicker value: L", expect: "Present" },
    ],
  },
  {
    id: "time-field",
    component: "TimeField",
    kind: "custom",
    outcomes: [
      { suffix: "accepts", what: "typing changes the time field value", typeInto: "textbox:Time value", text: "12:34", subject: "textbox:Time value", expect: "ValueChanges" },
      { suffix: "reports", what: "typing reports the time value", typeInto: "textbox:Time value", text: "12:34", subject: "heading:TimeField value: 12:34", expect: "Present" },
    ],
  },
  {
    id: "toolbar",
    component: "Toolbar",
    kind: "custom",
    outcomes: [
      { suffix: "moves-focus", what: "ArrowRight moves focus to the next toolbar control", prepare: "button:First tool", key: "ArrowRight", keyOn: "button:First tool", subject: "button:Second tool", expect: "FocusMoves" },
    ],
  },
  { id: "video-preview", component: "VideoPreview", kind: "display" },
];

/** Refuse an inventory whose generated pages could overwrite or under-specify one another. */
export function validateComponentSpecs(): void {
  const ids = new Set<string>();
  const components = new Set<string>();

  for (const spec of COMPONENTS) {
    if (ids.has(spec.id)) {
      throw new Error(`duplicate component QA id: ${spec.id}`);
    }
    if (components.has(spec.component)) {
      throw new Error(`duplicate component QA export: ${spec.component}`);
    }
    ids.add(spec.id);
    components.add(spec.component);

    if (spec.kind === "toggle") {
      if (!spec.subjectRole) {
        throw new Error(`${spec.component}: toggle QA requires subjectRole`);
      }
      continue;
    }

    if (spec.kind === "custom") {
      if (!spec.outcomes?.length) {
        throw new Error(`${spec.component}: custom QA requires outcomes`);
      }
      continue;
    }

    if (spec.kind !== "display" && (!spec.subject || !spec.subjectRole)) {
      throw new Error(
        `${spec.component}: ${spec.kind} QA requires subject and subjectRole`,
      );
    }

    if (
      (spec.kind === "value" || spec.kind === "mode" || spec.kind === "tabs") &&
      (!spec.activate || !spec.opens)
    ) {
      throw new Error(
        `${spec.component}: ${spec.kind} QA requires activate and opens`,
      );
    }

    if (
      (spec.kind === "overlay" || spec.kind === "inline-edit") &&
      !spec.opens
    ) {
      throw new Error(`${spec.component}: ${spec.kind} QA requires opens`);
    }
  }

  const declared = new Map(componentFamilies.map((family) => [family.id, family.name]));
  const missing = COMPONENTS.filter((spec) => declared.get(spec.id) !== spec.component);
  const stale = componentFamilies.filter(
    (family) => !COMPONENTS.some((spec) => spec.id === family.id && spec.component === family.name),
  );
  if (missing.length > 0 || stale.length > 0) {
    throw new Error(
      `component family manifest and native QA registry differ; missing/mismatched: ${missing
        .map((spec) => `${spec.id}:${spec.component}`)
        .join(", ") || "none"}; stale: ${stale
        .map((family) => `${family.id}:${family.name}`)
        .join(", ") || "none"}`,
    );
  }
}

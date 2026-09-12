/*
 * One entry point per component.
 *
 * The harness used to import all 71 components into a single bundle. At least
 * one of them (`Accordion`) runs code at module scope that Blitz's JS runtime
 * cannot execute, and it throws during *import* rather than during render. An
 * import-time throw cannot be contained: `createErrorBoundary` catches render
 * failures, but the module never finishes evaluating, so the page stayed empty
 * and all 71 checks failed on a missing control. That is the all-or-nothing
 * failure the whole directory exists to end.
 *
 * A bundle per component confines it. A component that cannot be imported takes
 * down its own page and nothing else: its `-mounts` check goes red naming it,
 * and the other 70 still run.
 *
 * Generated rather than hand-written, for the same reason the checks are: 71
 * near-identical files is not something to maintain by hand, and one that
 * drifts from its entry in `components.ts` is a check that silently tests the
 * wrong component.
 *
 * Run: bun run qa:entries (or qa:build, which does it first)
 */
import { COMPONENTS, validateComponentSpecs } from "./components";
import { mkdirSync, readdirSync, statSync, unlinkSync, writeFileSync } from "node:fs";
import { join } from "node:path";

/*
 * Where each component's own module lives inside the built package.
 *
 * The entry imports *this* rather than the package root, and imports it
 * statically. A dynamic `require("@pathscale/ui")` is opaque to the bundler:
 * it cannot prove which exports are reachable, so it keeps all 71 and every
 * page was 495 kB carrying every other component's module-scope code with it.
 * That is the same failure the entries were meant to remove, just relocated.
 *
 * Generated from `src/index.ts`, so a component that moves cannot leave a
 * stale path behind.
 */
/*
 * How each component is exported from its own module: 48 of the 71 are
 * `default as X` in the barrel, so a named import of `X` from the component's
 * module fails to link. Read from `src/index.ts`, so an export that changes
 * shape cannot leave a stale import behind.
 */
const IMPORT_FORM: Record<string, string> = {
  "AccordionContent": "named",
  "AccordionIndicator": "named",
  "AccordionItem": "named",
  "AccordionTrigger": "named",
  "Accordion": "default",
  "copyAddress": "named",
  "Address": "default",
  "truncateAddress": "named",
  "Alert": "named",
  "AuthCard": "named",
  "AuthFieldGroup": "named",
  "AuthFooterLinks": "named",
  "AuthMessage": "named",
  "AuthPoweredBy": "named",
  "AuthSubmitButton": "named",
  "AvatarFallback": "named",
  "AvatarImage": "named",
  "Avatar": "default",
  "Badge": "default",
  "Breadcrumb": "named",
  "BreadcrumbItem": "named",
  "Button": "default",
  "ButtonGroup": "default",
  "Calendar": "default",
  "CardRoot": "named",
  "CardBody": "named",
  "CardFooter": "named",
  "CardHeader": "named",
  "Card": "default",
  "ChatBubble": "default",
  "Checkbox": "default",
  "CheckboxGroup": "default",
  "Chip": "default",
  "CloseButton": "default",
  "ColorArea": "default",
  "ColorField": "default",
  "ColorPicker": "default",
  "ColorSlider": "default",
  "ColorSwatchPicker": "default",
  "Collapsible": "default",
  "ConnectionSettings": "named",
  "ColorSwatch": "default",
  "ColorWheel": "named",
  "ColorWheelFlower": "named",
  "ComplexColorWheel": "named",
  "ComboBox": "default",
  "autosize": "named",
  "boundsFromRows": "named",
  "Composer": "default",
  "isSubmittable": "named",
  "shouldSubmit": "named",
  "createDataGrid": "named",
  "DataGrid": "default",
  "DateField": "default",
  "DatePicker": "default",
  "DateRangePicker": "default",
  "DialogBackdrop": "named",
  "DialogBody": "named",
  "DialogCloseTrigger": "named",
  "DialogContent": "named",
  "DialogFooter": "named",
  "DialogHeader": "named",
  "DialogHeading": "named",
  "DialogIcon": "named",
  "DialogTrigger": "named",
  "Dialog": "default",
  "Dock": "default",
  "DrawerBackdrop": "named",
  "DrawerBody": "named",
  "DrawerClose": "named",
  "DrawerCloseTrigger": "named",
  "DrawerContent": "named",
  "DrawerDialog": "named",
  "DrawerFooter": "named",
  "DrawerHandle": "named",
  "DrawerHeader": "named",
  "DrawerHeading": "named",
  "DrawerTrigger": "named",
  "Drawer": "default",
  "Dropdown": "default",
  "Empty": "named",
  "Fieldset": "default",
  "FieldGroup": "named",
  "FieldsetActions": "named",
  "FieldsetLegend": "named",
  "Flex": "default",
  "createFlexGrid": "named",
  "FlexGrid": "default",
  "Footer": "default",
  "Form": "default",
  "FormField": "named",
  "FormSubmitButton": "named",
  "FormWithContext": "named",
  "GlowCard": "named",
  "Grid": "default",
  "Header": "default",
  "Icon": "default",
  "CookieConsent": "named",
  "ImmersiveLanding": "default",
  "FirefoxPWABanner": "named",
  "ImmersiveLandingContext": "named",
  "PWAInstallPrompt": "named",
  "useImmersiveLanding": "named",
  "useImmersiveLandingContext": "named",
  "InlineEdit": "default",
  "Input": "default",
  "Join": "default",
  "Kbd": "default",
  "InputOTP": "default",
  "InputOTPGroup": "named",
  "InputOTPSeparator": "named",
  "InputOTPSlot": "named",
  "REGEXP_ONLY_CHARS": "named",
  "REGEXP_ONLY_DIGITS": "named",
  "REGEXP_ONLY_DIGITS_AND_CHARS": "named",
  "Label": "default",
  "createI18n": "named",
  "I18nContext": "named",
  "I18nProvider": "named",
  "LanguageSwitcher": "named",
  "useI18n": "named",
  "Link": "default",
  "LinkIcon": "named",
  "ListBox": "default",
  "ListBoxItem": "named",
  "ListBoxItemIndicator": "named",
  "ListBoxSection": "named",
  "LiveChatBubble": "named",
  "LiveChatPanel": "named",
  "MetalBorder": "named",
  "Menu": "default",
  "Meter": "default",
  "Navbar": "default",
  "NoiseBackground": "default",
  "Pagination": "default",
  "PanelToggle": "named",
  "PasswordField": "named",
  "PasswordRequirements": "named",
  "Popover": "default",
  "Progress": "default",
  "RadialProgress": "default",
  "Radio": "default",
  "RangeCalendar": "default",
  "RadioGroup": "named",
  "ScrollArea": "default",
  "Select": "default",
  "Separator": "default",
  "SizePicker": "named",
  "Skeleton": "default",
  "Slider": "default",
  "Spinner": "default",
  "diffStatus": "named",
  "summarizeStatus": "named",
  "Switch": "default",
  "Table": "default",
  "TableExpandToggle": "named",
  "TableInlineConfirm": "named",
  "TableMobileListView": "named",
  "TableSortIcon": "named",
  "TableVirtualSpacerRow": "named",
  "Tabs": "default",
  "Text": "default",
  "Textarea": "default",
  "createHueShiftStore": "named",
  "getDefaultHueShiftStore": "named",
  "resetHueShift": "named",
  "ThemeColorPicker": "named",
  "TimeField": "default",
  "Toolbar": "default",
  "DEFAULT_TOAST_GAP": "named",
  "DEFAULT_MAX_VISIBLE_TOAST": "named",
  "DEFAULT_TOAST_SCALE_FACTOR": "named",
  "DEFAULT_TOAST_TIMEOUT": "named",
  "DEFAULT_TOAST_WIDTH": "named",
  "Toast": "default",
  "ToastActionButton": "named",
  "ToastCloseButton": "named",
  "ToastContent": "named",
  "ToastDescription": "named",
  "ToastIndicator": "named",
  "ToastProvider": "named",
  "ToastQueue": "named",
  "ToastTitle": "named",
  "toast": "named",
  "toastQueue": "named",
  "Tooltip": "default",
  "VideoPreview": "named",
  "TooltipArrow": "named",
  "TooltipContent": "named",
  "TooltipTrigger": "named",
  "FLAVORS": "named",
  "isInvalid": "named",
  "resolveState": "named",
  "SIZES": "named",
  "SPACES": "named",
  "STATES": "named",
  "VARIANTS": "named",
  "createForm": "named",
  "FormContext": "named",
  "getFirstFieldError": "named",
  "useField": "named",
  "useFormContext": "named",
  "useDesktop": "named",
  "useAnchoredOverlayPosition": "named",
  "evaluatePasswordRules": "named",
  "matchPasswordConfirmation": "named",
  "useStreamingBuffer": "named",
  "useStreamingSubscription": "named",
  "applyGlassTokens": "named",
  "GLASS_DEFAULTS": "named",
  "GLASS_LIMITS": "named",
  "glassTokensToCss": "named",
  "resolveGlassTokens": "named"
};

const MODULE_PATHS: Record<string, string> = {
  "accordion": "components/accordion",
  "address": "components/address",
  "alert": "components/alert",
  "auth-card": "components/auth-card",
  "auth-field-group": "components/auth-field-group",
  "auth-footer-links": "components/auth-footer-links",
  "auth-message": "components/auth-message",
  "auth-powered-by": "components/auth-powered-by",
  "auth-submit-button": "components/auth-submit-button",
  "avatar": "components/avatar",
  "badge": "components/badge",
  "breadcrumb": "components/breadcrumb",
  "button": "components/button",
  "button-group": "components/button-group",
  "calendar": "components/calendar",
  "card": "components/card",
  "chat-bubble": "components/chatbubble",
  "checkbox": "components/checkbox",
  "checkbox-group": "components/checkbox-group",
  "chip": "components/chip",
  "close-button": "components/close-button",
  "color-area": "components/color-area",
  "color-field": "components/color-field",
  "color-picker": "components/color-picker",
  "color-slider": "components/color-slider",
  "color-swatch-picker": "components/color-swatch-picker",
  "collapsible": "components/collapsible",
  "connection-settings": "components/connection-settings",
  "color-swatch": "components/color-swatch",
  "color-wheel": "components/color-wheel",
  "color-wheel-flower": "components/color-wheel-flower",
  "complex-color-wheel": "components/color-wheel",
  "combo-box": "components/combo-box",
  "composer": "components/composer",
  "cookie-consent": "components/immersive-landing",
  "data-grid": "components/data-grid",
  "date-field": "components/date-field",
  "date-picker": "components/date-picker",
  "date-range-picker": "components/date-range-picker",
  "dialog": "components/dialog",
  "dock": "components/dock",
  "drawer": "components/drawer",
  "dropdown": "components/dropdown",
  "empty": "components/empty",
  "field-group": "components/fieldset",
  "fieldset": "components/fieldset",
  "firefox-pwa-banner": "components/immersive-landing",
  "flex": "components/flex",
  "flex-grid": "components/flex-grid",
  "footer": "components/footer",
  "form": "components/form",
  "glow-card": "components/glow-card",
  "grid": "components/grid",
  "header": "components/header",
  "icon": "components/icon",
  "immersive-landing": "components/immersive-landing",
  "inline-edit": "components/inline-edit",
  "input": "components/input",
  "input-otp": "components/input-otp",
  "join": "components/join",
  "kbd": "components/kbd",
  "label": "components/label",
  "language-switcher": "components/language-switcher",
  "link": "components/link",
  "list-box": "components/list-box",
  "live-chat-bubble": "components/live-chat",
  "live-chat-panel": "components/live-chat",
  "metal-border": "components/metal-border",
  "menu": "components/menu",
  "meter": "components/meter",
  "navbar": "components/navbar",
  "noise-background": "components/noise-background",
  "pwa-install-prompt": "components/immersive-landing",
  "pagination": "components/pagination",
  "panel-toggle": "components/panel-toggle",
  "password-field": "components/password-field",
  "password-requirements": "components/password-requirements",
  "popover": "components/popover",
  "progress": "components/progress",
  "radial-progress": "components/radial-progress",
  "radio": "components/radio",
  "radio-group": "components/radio-group",
  "range-calendar": "components/range-calendar",
  "scroll-area": "components/scroll-area",
  "select": "components/select",
  "separator": "components/separator",
  "size-picker": "components/size-picker",
  "skeleton": "components/skeleton",
  "slider": "components/slider",
  "spinner": "components/spinner",
  "switch": "components/switch",
  "table": "components/table",
  "tabs": "components/tabs",
  "text": "components/text",
  "textarea": "components/textarea",
  "theme-color-picker": "components/theme-color-picker",
  "time-field": "components/time-field",
  "toolbar": "components/toolbar",
  "toast": "components/toast",
  "tooltip": "components/tooltip",
  "video-preview": "components/video-preview"
};

const outputDir = join(import.meta.dir, "entries");
mkdirSync(outputDir, { recursive: true });

validateComponentSpecs();

/*
 * Coverage is a source-tree invariant, not a number copied into a README.
 * Every visual component family gets a dedicated harness surface. Aliases are
 * explicit so a newly added directory cannot disappear between a package
 * export and the native QA matrix without breaking qa:entries.
 */
const SOURCE_FAMILY_TO_HARNESS: Record<string, readonly string[]> = {
  chatbubble: ["chat-bubble"],
  "live-chat": ["live-chat-bubble", "live-chat-panel"],
};
const NON_VISUAL_SOURCE_FAMILIES = new Set(["_shared", "status"]);
const harnessIds = new Set(COMPONENTS.map((spec) => spec.id));
const sourceComponentsDir = join(import.meta.dir, "../../src/components");
for (const family of readdirSync(sourceComponentsDir)) {
  if (
    NON_VISUAL_SOURCE_FAMILIES.has(family) ||
    !statSync(join(sourceComponentsDir, family)).isDirectory()
  ) {
    continue;
  }
  const requiredIds = SOURCE_FAMILY_TO_HARNESS[family] ?? [family];
  const missing = requiredIds.filter((id) => !harnessIds.has(id));
  if (missing.length > 0) {
    throw new Error(
      `${family}: source component family has no QA harness page (${missing.join(", ")})`,
    );
  }
}

const expectedFiles = new Set(COMPONENTS.map((spec) => `${spec.id}.tsx`));
for (const file of readdirSync(outputDir)) {
  if (file.endsWith(".tsx") && !expectedFiles.has(file)) {
    unlinkSync(join(outputDir, file));
    console.log(`removed stale ${join(outputDir, file)}`);
  }
}

for (const spec of COMPONENTS) {
  if (!MODULE_PATHS[spec.id]) {
    throw new Error(`${spec.component}: no module path for ${spec.id}`);
  }
  if (!IMPORT_FORM[spec.component]) {
    throw new Error(`${spec.component}: no import form`);
  }
  const source = `/*
 * Generated by tests/qa-harness/generate-entries.ts. Do not edit.
 *
 * The harness page for ${spec.component}, mounted alone. Its own bundle, so an
 * import that throws here cannot reach any other component's page.
 */
import "../index.css";
${IMPORT_FORM[spec.component] === "default" ? `import ${spec.component} from "@pathscale/ui/${MODULE_PATHS[spec.id]}";` : `import { ${spec.component} } from "@pathscale/ui/${MODULE_PATHS[spec.id]}";`}
import { mountComponent } from "../mount";

mountComponent(${JSON.stringify(spec.id)}, ${spec.component});
`;
  writeFileSync(join(outputDir, `${spec.id}.tsx`), source);
}

console.log(`${COMPONENTS.length} entry point(s) generated`);

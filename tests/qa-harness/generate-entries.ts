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
import { COMPONENTS } from "./components";
import { mkdirSync, writeFileSync } from "node:fs";
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
  "Calendar": "default",
  "CardRoot": "named",
  "CardBody": "named",
  "CardFooter": "named",
  "CardHeader": "named",
  "Card": "default",
  "ChatBubble": "default",
  "Checkbox": "default",
  "Chip": "default",
  "Collapsible": "default",
  "ColorSwatch": "default",
  "ColorWheel": "named",
  "ComplexColorWheel": "named",
  "autosize": "named",
  "boundsFromRows": "named",
  "Composer": "default",
  "isSubmittable": "named",
  "shouldSubmit": "named",
  "createDataGrid": "named",
  "DataGrid": "default",
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
  "Navbar": "default",
  "Pagination": "default",
  "PasswordField": "named",
  "PasswordRequirements": "named",
  "Popover": "default",
  "Progress": "default",
  "Radio": "default",
  "RadioGroup": "named",
  "ScrollArea": "default",
  "Select": "default",
  "Separator": "default",
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
  "calendar": "components/calendar",
  "card": "components/card",
  "chat-bubble": "components/chatbubble",
  "checkbox": "components/checkbox",
  "chip": "components/chip",
  "collapsible": "components/collapsible",
  "color-swatch": "components/color-swatch",
  "color-wheel": "components/color-wheel",
  "complex-color-wheel": "components/color-wheel",
  "composer": "components/composer",
  "cookie-consent": "components/immersive-landing",
  "data-grid": "components/data-grid",
  "dialog": "components/dialog",
  "dock": "components/dock",
  "drawer": "components/drawer",
  "dropdown": "components/dropdown",
  "empty": "components/empty",
  "field-group": "components/fieldset",
  "fieldset": "components/fieldset",
  "firefox-pwa-banner": "components/immersive-landing",
  "flex": "components/flex",
  "footer": "components/footer",
  "form": "components/form",
  "glow-card": "components/glow-card",
  "grid": "components/grid",
  "header": "components/header",
  "icon": "components/icon",
  "immersive-landing": "components/immersive-landing",
  "inline-edit": "components/inline-edit",
  "input": "components/input",
  "label": "components/label",
  "language-switcher": "components/language-switcher",
  "link": "components/link",
  "list-box": "components/list-box",
  "live-chat-bubble": "components/live-chat",
  "live-chat-panel": "components/live-chat",
  "metal-border": "components/metal-border",
  "navbar": "components/navbar",
  "pwa-install-prompt": "components/immersive-landing",
  "pagination": "components/pagination",
  "password-field": "components/password-field",
  "password-requirements": "components/password-requirements",
  "popover": "components/popover",
  "progress": "components/progress",
  "radio": "components/radio",
  "scroll-area": "components/scroll-area",
  "select": "components/select",
  "separator": "components/separator",
  "skeleton": "components/skeleton",
  "slider": "components/slider",
  "spinner": "components/spinner",
  "switch": "components/switch",
  "table": "components/table",
  "tabs": "components/tabs",
  "text": "components/text",
  "theme-color-picker": "components/theme-color-picker",
  "toast": "components/toast",
  "tooltip": "components/tooltip"
};

const outputDir = join(import.meta.dir, "entries");
mkdirSync(outputDir, { recursive: true });

for (const spec of COMPONENTS) {
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

export {
  default as Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionIndicator,
} from "./components/accordion";
export type {
  AccordionProps,
  AccordionRootProps,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
  AccordionIndicatorProps,
  AccordionSelectionMode,
  AccordionVariant,
  AccordionValue,
} from "./components/accordion";
export { Callout } from "./components/callout";
export type { CalloutProps, CalloutPlacement } from "./components/callout";
export {
  default as Avatar,
  AvatarImage,
  AvatarFallback,
} from "./components/avatar";
export type {
  AvatarSize,
  AvatarColor,
  AvatarVariant,
  AvatarRootProps,
  AvatarImageProps,
  AvatarFallbackProps,
} from "./components/avatar";
export { default as Badge } from "./components/badge";
export {
  Breadcrumbs,
  BreadcrumbsItem,
} from "./components/breadcrumbs";
export type {
  BreadcrumbsRootProps,
  BreadcrumbsItemProps,
} from "./components/breadcrumbs";

export { default as Button } from "./components/button";
export {
  default as Calendar,
  type CalendarProps,
  type CalendarWeekdayFormat,
  type CalendarSelectionMode,
  type CalendarDaySelectHandler,
  type CalendarDayHoverHandler,
} from "./components/calendar";
export { default as Card, Card as CardRoot, CardHeader, CardBody, CardFooter } from "./components/card";
export type { CardProps, CardSectionProps, CardMaterial, CardElevation } from "./components/card";

export { default as Checkbox } from "./components/checkbox";
export { default as Chip } from "./components/chip";
export type {
  ChipProps,
  ChipRootProps,
  ChipLabelProps,
  ChipVariant,
  ChipColor,
  ChipSize,
} from "./components/chip";

export {
  default as Drawer,
  DrawerTrigger,
  DrawerBackdrop,
  DrawerContent,
  DrawerDialog,
  DrawerHeader,
  DrawerHeading,
  DrawerBody,
  DrawerFooter,
  DrawerHandle,
  DrawerCloseTrigger,
  DrawerClose,
} from "./components/drawer";
export type {
  DrawerPlacement,
  DrawerSize,
  DrawerBackdropVariant,
  DrawerDialogSide,
  DrawerScrollBehavior,
  DrawerRootProps,
  DrawerTriggerProps,
  DrawerBackdropProps,
  DrawerContentProps,
  DrawerDialogProps,
  DrawerHeaderProps,
  DrawerHeadingProps,
  DrawerBodyProps,
  DrawerFooterProps,
  DrawerHandleProps,
  DrawerCloseTriggerProps,
  DrawerCloseProps,
} from "./components/drawer";
export { default as Dropdown } from "./components/dropdown";
export { default as Disclosure } from "./components/disclosure";
export type {
  DisclosureProps,
  DisclosureRootProps,
  DisclosureHeadingProps,
  DisclosureTriggerProps,
  DisclosureContentProps,
  DisclosureBodyProps,
  DisclosureIndicatorProps,
} from "./components/disclosure";
export { EmptyState, type EmptyStateProps } from "./components/empty-state";
export { default as FloatingDock } from "./components/floating-dock";
export type {
  FloatingDockProps,
  FloatingDockItem,
  FloatingDockDirection,
} from "./components/floating-dock";
export { default as Flex } from "./components/flex";
export { GlowCard, type GlowCardProps } from "./components/glow-card";
export { MetalBorder, type MetalBorderProps } from "./components/metal-border";
export type {
  MetalBorderKind,
  MetalBorderPreset,
  MetalBorderResolvedTheme,
  MetalBorderTheme,
} from "./components/metal-border";
export { default as Footer } from "./components/footer";
export type { FooterProps, FooterTitleProps } from "./components/footer";
export {
  default as Fieldset,
  FieldsetLegend,
  FieldGroup,
  FieldsetActions,
} from "./components/fieldset";
export type {
  FieldsetProps,
  FieldsetRootProps,
  FieldsetLegendProps,
  FieldGroupProps,
  FieldsetActionsProps,
} from "./components/fieldset";
// ---------------------------------------------------------------------------
// Form components and hooks (TanStack-based API)
// ---------------------------------------------------------------------------
export {
  default as Form,
  FormWithContext,
} from "./components/form";
export {
  FormField,
  FormSubmitButton,
} from "./components/form";
export { useDesktop } from "./hooks/layout";
export type {
  FormProps,
  FormRootProps,
  FormWithContextProps,
  FormFieldProps,
  FormSubmitButtonProps,
  FieldErrorMessageProps,
} from "./components/form";

export { AuthCard, type AuthCardProps } from "./components/auth-card";
export { AuthFieldGroup, type AuthFieldGroupProps } from "./components/auth-field-group";
export { PasswordField, type PasswordFieldProps } from "./components/password-field";
export { PasswordRequirements, type PasswordRequirementsProps } from "./components/password-requirements";
export { AuthMessage } from "./components/auth-message";
export type { AuthMessageProps } from "./components/auth-message";
export { AuthSubmitButton, type AuthSubmitButtonProps } from "./components/auth-submit-button";
export { AuthFooterLinks, type AuthFooterLinksProps, type AuthFooterLinkItem } from "./components/auth-footer-links";
export { AuthPoweredBy, type AuthPoweredByProps } from "./components/auth-powered-by";
export {
  evaluatePasswordRules,
  matchPasswordConfirmation,
  type PasswordRuleConfig,
  type PasswordRuleResult,
  type PasswordCustomRegexRule,
} from "./passwordRules";

// Form API
export {
  createForm,
  useFormContext,
  useField,
  getFirstFieldError,
  FormContext,
} from "./hooks/form";
export type {
  CreateFormOptions,
  FormApi,
  AnyFormApi,
  UseFieldResult,
} from "./hooks/form";
export { default as Grid } from "./components/grid";
export { default as Header } from "./components/header";
export type { HeaderProps, HeaderRootProps } from "./components/header";
export { default as Icon } from "./components/icon";
export {
  default as ImmersiveLanding,
  useImmersiveLanding,
  useImmersiveLandingContext,
  ImmersiveLandingContext,
  CookieConsent,
  PWAInstallPrompt,
  FirefoxPWABanner,
} from "./components/immersive-landing";
export type {
  ImmersiveLandingProps,
  ImmersiveLandingPageProps,
  ImmersiveLandingArrowsProps,
  ImmersiveLandingNavigationProps,
  ImmersiveLandingContextValue,
  UseImmersiveLandingOptions,
  UseImmersiveLandingReturn,
  CookieConsentProps,
  CookieConsentTexts,
  CookieConsentStorageKeys,
  PWAInstallPromptProps,
  PWAInstallPromptTexts,
  FirefoxPWABannerProps,
  FirefoxPWABannerTexts,
} from "./components/immersive-landing";
export { default as Input } from "./components/input";
export { default as Label } from "./components/label";
export type { LabelProps, LabelRootProps } from "./components/label";
export { default as Link, LinkIcon } from "./components/link";
export type {
  LinkProps,
  LinkRootProps,
  LinkIconProps,
  LinkVariant,
  LinkUnderline,
} from "./components/link";
export { LiveChatBubble, LiveChatPanel } from "./components/live-chat";
export type {
  LiveChatBubbleProps,
  LiveChatPanelProps,
  ChatMessage,
  SendMessagePayload,
  SendMessageResponse,
} from "./components/live-chat";
export { default as Spinner } from "./components/spinner";
export type { SpinnerProps, SpinnerShape } from "./components/spinner";
export {
  LanguageSwitcher,
  createI18n,
  I18nProvider,
  I18nContext,
  useI18n,
} from "./components/language-switcher";
export type {
  LanguageSwitcherProps,
  I18nStore,
  I18nOptions,
  I18nContextValue,
  I18nProviderProps,
  Language,
} from "./components/language-switcher";
export {
  default as Modal,
  ModalTrigger,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalHeading,
  ModalIcon,
  ModalBody,
  ModalFooter,
  ModalCloseTrigger,
} from "./components/modal";
export type {
  ModalProps,
  DialogProps,
  ModalPlacement,
  ModalSize,
  ModalBackdropVariant,
  ModalScrollBehavior,
  ModalRootProps,
  ModalTriggerProps,
  ModalBackdropProps,
  ModalContentProps,
  ModalHeaderProps,
  ModalHeadingProps,
  ModalIconProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalCloseTriggerProps,
} from "./components/modal";
export { default as Navbar } from "./components/navbar";
export type { NavbarProps } from "./components/navbar";
export type { NavbarStackProps } from "./components/navbar/NavbarStack.generated";
export type { NavbarRowProps } from "./components/navbar/NavbarRow.generated";
export { default as Pagination } from "./components/pagination";
export type { PaginationProps } from "./components/pagination";
export { default as ProgressBar } from "./components/progress-bar";
export type {
  ProgressBarProps,
  ProgressBarSize,
  ProgressBarColor,
} from "./components/progress-bar";
export { default as Popover } from "./components/popover";
export type {
  PopoverProps,
  PopoverRootProps,
  PopoverTriggerProps,
  PopoverContentProps,
  PopoverDialogProps,
  PopoverArrowProps,
  PopoverHeadingProps,
} from "./components/popover";
export { default as Radio } from "./components/radio";
export {
  RadioGroup,
  type RadioGroupProps,
  type RadioGroupOrientation,
  type RadioGroupVariant,
} from "./components/radio-group";

export { default as Select } from "./components/select";
export { default as ScrollShadow } from "./components/scroll-shadow";
export type {
  ScrollShadowProps,
  ScrollShadowVisibility,
  ScrollShadowOrientation,
  ScrollShadowVariant,
} from "./components/scroll-shadow";
export { default as Separator } from "./components/separator";
export type {
  SeparatorProps,
  SeparatorOrientation,
  SeparatorVariant,
} from "./components/separator";
export { default as Slider } from "./components/slider";
export type { SliderProps, SliderSize } from "./components/slider";
export { default as Skeleton } from "./components/skeleton";

export { default as Table } from "./components/table";
export {
  SortIcon as TableSortIcon,
  ExpandToggle as TableExpandToggle,
  VirtualSpacerRow as TableVirtualSpacerRow,
  MobileListView as TableMobileListView,
  InlineConfirm as TableInlineConfirm,
} from "./components/table";
export type {
  TableProps,
  TableSortDirection,
  TableSortDescriptor,
  TableColumnRenderProps,
  SortIconProps as TableSortIconProps,
  SortIconState as TableSortIconState,
  ExpandToggleProps as TableExpandToggleProps,
  VirtualSpacerRowProps as TableVirtualSpacerRowProps,
  MobileListViewProps as TableMobileListViewProps,
  InlineConfirmProps as TableInlineConfirmProps,
  InlineConfirmVariant as TableInlineConfirmVariant,
} from "./components/table";
export {
  useTableModel,
  useTableSorting,
  useTablePagination,
  useTableFiltering,
  useTableSelection,
  useTableExpansion,
  toSortDescriptor,
  toSortingState,
  useAnchoredOverlayPosition,
} from "./hooks/table";
export type {
  UseTableModelOptions,
  UseTableSortingOptions,
  UseTableSortingResult,
  HookSortDirection,
  HookSortDescriptor,
  UseTablePaginationOptions,
  UseTablePaginationResult,
  UseTableFilteringOptions,
  UseTableFilteringResult,
  UseTableSelectionOptions,
  UseTableSelectionResult,
  TableSelectionState,
  UseTableExpansionOptions,
  UseTableExpansionResult,
  UseAnchoredOverlayPositionOptions,
} from "./hooks/table";

export { default as Tabs } from "./components/tabs";
export type {
  TabsRootProps,
  TabListContainerProps,
  TabListProps,
  TabProps,
  TabIndicatorProps,
  TabSeparatorProps,
  TabPanelProps,
} from "./components/tabs";
export { default as Text } from "./components/text";
export type {
  TextProps,
  TextRootProps,
  TextSize,
  TextVariant,
  TextWeight,
  TextTransform,
  TextTracking,
  TextLeading,
  TextFamily,
} from "./components/text";
export { default as TextArea } from "./components/text-area";
export type {
  TextAreaProps,
  TextAreaRootProps,
  TextAreaVariant,
} from "./components/text-area";
export {
  ThemeColorPicker,
  createHueShiftStore,
  getDefaultHueShiftStore,
  resetHueShift,
} from "./components/theme-color-picker";
export type {
  ThemeColorPickerProps,
  HueShiftStore,
} from "./components/theme-color-picker";
export {
  default as Toast,
  ToastProvider,
  ToastContent,
  ToastIndicator,
  ToastTitle,
  ToastDescription,
  ToastActionButton,
  ToastCloseButton,
  ToastQueue,
  toast,
  toastQueue,
  DEFAULT_GAP as DEFAULT_TOAST_GAP,
  DEFAULT_MAX_VISIBLE_TOAST,
  DEFAULT_SCALE_FACTOR as DEFAULT_TOAST_SCALE_FACTOR,
  DEFAULT_TOAST_TIMEOUT,
  DEFAULT_TOAST_WIDTH,
} from "./components/toast";
export type {
  ToastPlacement,
  ToastVariant,
  ToastActionProps,
  ToastContentValue,
  ToastQueueAddOptions,
  ToastQueueItem,
  ToastQueueOptions,
  ToastRenderFn,
  ToastRootProps,
  ToastProviderProps,
  ToastContentProps,
  ToastIndicatorProps,
  ToastTitleProps,
  ToastDescriptionProps,
  ToastActionButtonProps,
  ToastCloseButtonProps,
  HeroUIToastOptions,
  ToastPromiseOptions,
  ToastFunction,
} from "./components/toast";
export { default as Toggle } from "./components/toggle";
export {
  default as Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipArrow,
} from "./components/tooltip";
export type {
  TooltipPlacement,
  TooltipRootProps,
  TooltipTriggerProps,
  TooltipContentProps,
  TooltipArrowProps,
} from "./components/tooltip";

// Motion
export * from "./motion";

export { useVirtualRows } from "./primitives/virtualizer";
export type {
  UseVirtualRowsOptions,
  UseVirtualRowsResult,
  VirtualRowsRange,
} from "./primitives/virtualizer";
export {
  useStreamingBuffer,
  useStreamingSubscription,
} from "./primitives/streaming";
export type {
  StreamingBufferStrategy,
  StreamingSubscribeFn,
  StreamingSubscriptionObserver,
  UseStreamingBufferOptions,
  UseStreamingBufferResult,
  UseStreamingSubscriptionOptions,
  UseStreamingSubscriptionResult,
} from "./primitives/streaming";

// The shared parameter vocabulary. A name here means the same thing on every
// component; see docs/ui-usage.md and UI-2.2-API.md.
export type {
  Flavor,
  State,
  Variant,
  Size,
  Radius,
  Space,
  Width,
  Height,
  MaxWidth,
  Align,
  Justify,
  Direction,
  UIBaseProps,
  IconSlotProps,
  Controlled,
  Issue,
  Constraint,
  Validate,
  ValidateOn,
  Validatable,
  OpenChangeReason,
  ChangeReason,
  Disclosable,
  CapabilityProps,
} from "./components/vocabulary";
export { isInvalid } from "./components/vocabulary";
export { FLAVORS, STATES, VARIANTS, SIZES, SPACES } from "./components/vocabulary";

// Restored to the main surface: three were parked by a hand-written list
// rather than the usage data, and ChatBubble is a forward-looking priority.
export {
  default as InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  REGEXP_ONLY_DIGITS,
  REGEXP_ONLY_CHARS,
  REGEXP_ONLY_DIGITS_AND_CHARS,
} from "./components/input-otp";
export type {
  InputOTPProps,
  InputOTPRootProps,
  InputOTPGroupProps,
  InputOTPSlotProps,
  InputOTPSeparatorProps,
  InputOTPVariant,
} from "./components/input-otp";
export {
  default as ListBox,
  ListBoxItem,
  ListBoxItemIndicator,
  ListBoxSection,
} from "./components/list-box";
export type {
  ListBoxProps,
  ListBoxRootProps,
  ListBoxSelectionMode,
  ListBoxVariant,
  ListBoxItemProps,
  ListBoxItemRootProps,
  ListBoxItemIndicatorProps,
  ListBoxItemRenderProps,
  ListBoxSectionProps,
  ListBoxSectionRootProps,
} from "./components/list-box";
export { default as ColorSwatch } from "./components/color-swatch";
export type {
  ColorSwatchProps,
  ColorSwatchShape,
  ColorSwatchSize,
} from "./components/color-swatch";
export { default as ChatBubble } from "./components/chatbubble";

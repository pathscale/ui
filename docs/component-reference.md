# UI/ — built by design & utility

The complete component reference for `@pathscale/ui`. Generated from the built type declarations by `scripts/generate-component-reference.ts`, so it cannot drift from what ships.

**73 components** on the main surface · **24** in `@pathscale/ui/lab`

---

## The three axes

Every component is built from these. They mean the same thing everywhere.

| Axis | Answers | Values | |
| --- | --- | --- | --- |
| `variant` | what shape | `solid` `soft` `outline` `ghost` `plain` | closed |
| `flavor` | what it *is* | `neutral` `primary` `secondary` `accent` `destructive` `success` `warning` `info` … | **open** |
| `state` | what is happening *now* | `default` `loading` `disabled` `invalid` `hidden` | closed |

```tsx
<Button>                                       // solid, primary — the call to action
<Button variant="ghost" size="icon">           // chrome
<Button flavor="destructive" state="loading">  // both, no conflict
<Button flavor="hip">                          // theme-defined, no library change
```

`flavor` is permanent and open — a theme adds one by styling `[data-flavor="hip"]`. `state` is transient and closed, because which conditions a component can be in is the library's to define.

---

## Components

### Accordion

Parts: `AccordionContent` · `AccordionIndicator` · `AccordionItem` · `AccordionTrigger`

```ts
type AccordionProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children?: JSX.Element;
  selectionMode?: AccordionSelectionMode;
  value?: AccordionValue;
  defaultValue?: AccordionValue;
  onValueChange?: (value: string[]) => void;
  hideSeparator?: boolean;
  variant?: AccordionVariant;
  isDisabled?: boolean;
  disabled?: boolean;
};
```

### Address

```ts
type AddressProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "onCopy"> & UIBaseProps & {
  /** The address itself. Always the full value, whatever is displayed. */
  value: string;
  /**
   * A resolved name, shown in place of the hex.
   *
   * ENS and its equivalents are what the address *means* to a person, so when
   * one is known it leads. The hex stays reachable through the title and the
   * copy, because the name is a lookup that can be wrong and the address
   * cannot.
   */
  name?: JSX.Element;
  /** Full URL to a block explorer. No link is rendered without one. */
  explorerUrl?: string;
  truncate?: AddressTruncate;
  /** Characters kept at each end when truncating. */
  lead?: number;
  tail?: number;
  size?: Size;
  state?: State;
  font?: "mono" | "inherit";
  /** Copying is on by default: it is the reason most of these are on screen. */
  copyable?: boolean;
  /** Fired after a successful copy, with the full value. */
  onCopy?: (value: string) => void;
  copyLabel?: JSX.Element;
  copiedLabel?: JSX.Element;
  explorerLabel?: JSX.Element;
};
```

### Alert

```ts
type AlertProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "title"> & UIBaseProps & {
  flavor?: Flavor;
  variant?: Variant;
  placement?: AlertPlacement;
  title?: JSX.Element;
  /** `false` suppresses the state's default icon. */
  icon?: JSX.Element | false;
  onDismiss?: () => void;
  dismissLabel?: string;
  children: JSX.Element;
};
```

### AuthCard

```ts
type AuthCardProps = IComponentBaseProps & {
  title?: JSX.Element;
  description?: JSX.Element;
  children: JSX.Element;
  footer?: JSX.Element;
  brandingSlot?: JSX.Element;
};
```

### AuthFieldGroup

```ts
type AuthFieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children: JSX.Element;
  gap?: AuthFieldGroupGap;
};
```

### AuthFooterLinks

```ts
type AuthFooterLinksProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  items: AuthFooterLinkItem[];
  align?: AuthFooterLinksAlign;
};
```

### AuthMessage

```ts
type AuthMessageProps = UIBaseProps & {
  message?: JSX.Element | string | null;
  flavor?: Flavor;
};
```

### AuthPoweredBy

```ts
type AuthPoweredByProps = IComponentBaseProps & {
  label?: string;
  logo?: JSX.Element;
  href?: string;
  align?: AuthPoweredByAlign;
  variant?: AuthPoweredByVariant;
};
```

### AuthSubmitButton

```ts
type AuthSubmitButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children" | "disabled" | "type"> & IComponentBaseProps & {
  children: JSX.Element;
  type?: "button" | "submit" | "reset";
  variant?: Variant;
  flavor?: Flavor;
  state?: State;
  size?: Size;
  width?: Width;
};
```

### Avatar

Parts: `AvatarFallback` · `AvatarImage`

```ts
type AvatarProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & IComponentBaseProps & {
  children: JSX.Element;
  size?: AvatarSize;
  color?: AvatarColor;
  variant?: AvatarVariant;
};
```

### Badge

_No exported props type._

### Breadcrumb

Parts: `BreadcrumbItem`

```ts
type BreadcrumbProps = Omit<JSX.HTMLAttributes<HTMLElement>, "children"> & IComponentBaseProps & {
  children: JSX.Element;
  separator?: JSX.Element;
};
```

### Button

Parts: `ButtonGroup` · `ButtonGroupSeparator`

```ts
type ButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "color" | "type"> & UIBaseProps & IconSlotProps & {
  variant?: Variant;
  flavor?: Flavor;
  state?: State;
  size?: Size;
  /** `square` is icon-only: as wide as it is tall, at whatever size it is. */
  width?: Width | "square";
  radius?: Radius;
  type?: "button" | "submit" | "reset";
  children?: JSX.Element;
};
```

### Calendar

```ts
type CalendarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & IComponentBaseProps & CalendarBaseProps;
```

### Card

Parts: `CardBody` · `CardFooter` · `CardHeader` · `CardRoot`

```ts
type CardProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & UIBaseProps & {
  variant?: Variant;
  material?: CardMaterial;
  elevation?: CardElevation;
  flavor?: Flavor;
  state?: State;
  padding?: Space;
  radius?: Radius;
  /** Replaces isHoverable and isPressable, which had one call site each across 330. */
  isInteractive?: boolean;
  header?: JSX.Element;
  footer?: JSX.Element;
  children: JSX.Element;
};
```

### ChatBubble

```ts
type ChatBubbleProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLDivElement> & {
  end?: boolean;
};
```

### Checkbox

Parts: `CheckboxGroup`

```ts
type CheckboxProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & IComponentBaseProps & {
  defaultChecked?: boolean;
  children?: JSX.Element;
  description?: JSX.Element;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isIndeterminate?: boolean;
  indeterminate?: boolean;
  variant?: CheckboxVariant;
};
```

### Chip

_No exported props type._

### Collapsible

```ts
type CollapsibleProps = ComponentProps<typeof CollapsibleRoot>;
```

### ColorSwatch

Parts: `ColorSwatchPicker`

```ts
type ColorSwatchProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "onChange" | "onSelect"> & IComponentBaseProps & {
  color: string;
  colorName?: string;
  shape?: ColorSwatchShape;
  size?: ColorSwatchSize;
  isSelected?: boolean;
  isDisabled?: boolean;
  onSelect?: (color: string) => void;
  onChange?: (color: string) => void;
};
```

### Composer

```ts
type ComposerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "onSubmit" | "children"> & UIBaseProps & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string, reason?: ChangeReason) => void;
  /** Fired with the trimmed message. Not fired while `state` is `loading`. */
  onSubmit?: (value: string) => void;
  placeholder?: string;
  size?: Size;
  variant?: Variant;
  radius?: Radius;
  /** `loading` means a send is in flight: the box stays readable and refuses to send again. */
  state?: State;
  /** Server-side or asynchronous problems, rendered under the box. */
  issues?: Issue[];
  minRows?: number;
  maxRows?: number;
  /**
   * Enter sends. Set false where a newline is the common case and sending is
   * an explicit act, which is what long-form editors want.
   */
  submitOnEnter?: boolean;
  /**
   * Announced whenever the box changes height.
   *
   * A chat transcript that pins to the bottom has to know: the composer
   * growing by a line moves the bottom, and a scroller that finds out by
   * observing the DOM finds out a frame late and jitters.
   */
  onHeightChange?: (height: number) => void;
  /** Controls before the field: attachments, model pickers, mode switches. */
  lead?: JSX.Element;
  /** Controls after the field, before the submit button. */
  trail?: JSX.Element;
  submitLabel?: JSX.Element;
  /** Shown beside the controls. Usually the Enter/Shift+Enter reminder. */
  hint?: JSX.Element;
  autofocus?: boolean;
  name?: string;
  /** Height of the window, for the ceiling. Injected for runtimes without one. */
  viewportHeight?: number;
};
```

### CookieConsent

_No exported props type._

### Dialog

Parts: `DialogBackdrop` · `DialogBody` · `DialogCloseTrigger` · `DialogContent` · `DialogFooter` · `DialogHeader` · `DialogHeading` · `DialogIcon` · `DialogTrigger`

```ts
type DialogProps = DialogRootProps;
```

### Dock

```ts
type DockProps = {
  items: DockItem[];
  orientation?: "horizontal" | "vertical";
  tooltipDirection?: DockDirection;
  mobilePopupDirection?: DockDirection;
  /** How to render on mobile: "burger" shows a toggle popup, "dock" shows the full dock bar. @default "burger" */
  mobileMode?: "burger" | "dock";
  gap?: number;
  baseSize?: number;
  hoverSize?: number;
  iconSize?: number;
  hoverIconSize?: number;
  magnifyRange?: number;
  magnify?: boolean;
  nudge?: number;
  showDesktop?: boolean;
  showMobile?: boolean;
  showContainer?: boolean;
  desktopClass?: string;
  mobileClass?: string;
  itemClass?: string;
  tooltipClass?: string;
  mobileToggleIcon?: JSX.Element;
  springMass?: number;
  springStiffness?: number;
  springDamping?: number;
} & IComponentBaseProps;
```

### Drawer

Parts: `DrawerBackdrop` · `DrawerBody` · `DrawerClose` · `DrawerCloseTrigger` · `DrawerContent` · `DrawerDialog` · `DrawerFooter` · `DrawerHandle` · `DrawerHeader` · `DrawerHeading` · `DrawerTrigger`

```ts
type DrawerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children: JSX.Element;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  backdrop?: DrawerBackdropVariant;
  scrollBehavior?: DrawerScrollBehavior;
  isDismissable?: boolean;
  shouldCloseOnEsc?: boolean;
  shouldCloseOnBackdropClick?: boolean;
  trapFocus?: boolean;
  restoreFocus?: boolean;
};
```

### Dropdown

_No exported props type._

### Empty

```ts
type EmptyProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children: JSX.Element;
};
```

### FieldGroup

```ts
type FieldGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children?: JSX.Element;
};
```

### Fieldset

Parts: `FieldsetActions` · `FieldsetLegend`

```ts
type FieldsetProps = JSX.FieldsetHTMLAttributes<HTMLFieldSetElement> & IComponentBaseProps;
```

### FirefoxPWABanner

_No exported props type._

### Flex

```ts
type FlexProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
  as?: keyof JSX.IntrinsicElements;
  direction?: ResponsiveProp<"row" | "col" | "row-reverse" | "col-reverse">;
  justify?: ResponsiveProp<"start" | "center" | "end" | "between" | "around" | "evenly">;
  align?: ResponsiveProp<"start" | "center" | "end" | "stretch" | "baseline">;
  wrap?: ResponsiveProp<"wrap" | "nowrap" | "wrap-reverse">;
  gap?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
  gapX?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
  gapY?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
  paddingInline?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
  paddingBlock?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
  width?: ResponsiveProp<"full">;
  height?: ResponsiveProp<"full">;
  minWidth?: ResponsiveProp<"zero">;
  minHeight?: ResponsiveProp<"zero">;
  grow?: ResponsiveProp<boolean>;
  shrink?: ResponsiveProp<boolean>;
  basis?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">;
};
```

### Footer

```ts
type FooterProps = IComponentBaseProps & {
  children?: JSX.Element;
  center?: boolean;
  horizontal?: boolean;
  vertical?: boolean;
};
```

### Form

Parts: `FormContext` · `FormField` · `FormSubmitButton` · `FormWithContext`

```ts
type FormProps = JSX.FormHTMLAttributes<HTMLFormElement> & IComponentBaseProps;
```

### GlowCard

```ts
type GlowCardProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLDivElement>;
```

### Grid

```ts
type GridProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLElement>, "ref"> & {
  as?: keyof JSX.IntrinsicElements;
  cols?: ResponsiveProp<GridSize>;
  rows?: ResponsiveProp<GridSize>;
  flow?: ResponsiveProp<GridFlow>;
  gap?: ResponsiveProp<GridGap>;
  autoCols?: ResponsiveProp<AutoSize>;
  autoRows?: ResponsiveProp<AutoSize>;
};
```

### Header

```ts
type HeaderProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps;
```

### I18nContext

_No exported props type._

### I18nProvider

_No exported props type._

### Icon

```ts
type IconProps = IComponentBaseProps & {
  width?: number;
  height?: number;
  color?: ComponentColor;
  name?: string;
};
```

### ImmersiveLanding

Parts: `ImmersiveLandingContext`

_No exported props type._

### Input

Parts: `InputOTP` · `InputOTPGroup` · `InputOTPSeparator` · `InputOTPSlot`

_No exported props type._

### InputOTP

Parts: `InputOTPGroup` · `InputOTPSeparator` · `InputOTPSlot`

```ts
type InputOTPProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onInput"> & IComponentBaseProps & {
  children?: JSX.Element;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  maxLength?: number;
  variant?: InputOTPVariant;
  pattern?: string;
  name?: string;
  autoFocus?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  inputClassName?: string;
  inputMode?: JSX.InputHTMLAttributes<HTMLInputElement>["inputMode"];
};
```

### Label

```ts
type LabelProps = Omit<JSX.LabelHTMLAttributes<HTMLLabelElement>, "for"> & IComponentBaseProps & {
  for?: string;
  htmlFor?: string;
  isRequired?: boolean;
  isDisabled?: boolean;
  isInvalid?: boolean;
};
```

### LanguageSwitcher

_No exported props type._

### Link

Parts: `LinkIcon`

```ts
type LinkProps = LinkRootProps;
```

### ListBox

Parts: `ListBoxItem` · `ListBoxItemIndicator` · `ListBoxSection`

```ts
type ListBoxProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children?: JSX.Element;
  title?: JSX.Element;
};
```

### LiveChat

Parts: `LiveChatBubble` · `LiveChatPanel`

_No exported props type._

### MetalBorder

```ts
type MetalBorderProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: JSX.Element;
  preset?: MetalBorderPreset;
  strength?: number;
  kind?: MetalBorderKind;
  glow?: boolean;
  paused?: boolean;
  theme?: MetalBorderTheme;
  cornerRadius?: number | string;
  contentClass?: string;
};
```

### Navbar

```ts
type NavbarProps = JSX.HTMLAttributes<HTMLElement> & IComponentBaseProps & {
  as?: keyof JSX.IntrinsicElements;
  dataTheme?: string;
  className?: string;
};
```

### Pagination

```ts
type PaginationProps = Omit<JSX.HTMLAttributes<HTMLElement>, "onChange"> & IComponentBaseProps & {
  page: number;
  total: number;
  onChange: (page: number) => void;
  isDisabled?: boolean;
};
```

### PasswordField

```ts
type PasswordFieldProps = IComponentBaseProps & {
  id?: string;
  name?: string;
  label?: JSX.Element;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
  autofocus?: boolean;
  autocomplete?: "current-password" | "new-password" | "off";
  "aria-describedby"?: string;
  startIcon?: JSX.Element;
  showLabel: string;
  hideLabel: string;
  value?: string;
  inputRef?: (el: HTMLInputElement) => void;
  onInput?: (value: string) => void;
  onBlur?: () => void;
  visibleIcon?: JSX.Element;
  hiddenIcon?: JSX.Element;
  onVisibilityChange?: (visible: boolean) => void;
  class?: string;
  inputClass?: string;
};
```

### PasswordRequirements

```ts
type PasswordRequirementsProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  title?: JSX.Element;
  results: PasswordRuleResult[];
  metIcon?: JSX.Element;
  unmetIcon?: JSX.Element;
};
```

### PasswordRules

_No exported props type._

### Popover

```ts
type PopoverProps = ComponentProps<typeof PopoverRoot>;
```

### Progress

```ts
type ProgressProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  value?: number;
  minValue?: number;
  maxValue?: number;
  isIndeterminate?: boolean;
  label?: string;
  size?: ProgressSize;
  color?: ProgressColor;
  isDisabled?: boolean;
  formatValue?: (value: number) => string;
  showValue?: boolean;
};
```

### PWAInstallPrompt

_No exported props type._

### Radio

Parts: `RadioGroup`

```ts
type RadioProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children"> & IComponentBaseProps & {
  children?: JSX.Element;
  description?: JSX.Element;
  indicator?: JSX.Element;
  isDisabled?: boolean;
  isInvalid?: boolean;
};
```

### RadioGroup

```ts
type RadioGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & IComponentBaseProps & {
  children: JSX.Element;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  name?: string;
  isDisabled?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  orientation?: RadioGroupOrientation;
  variant?: RadioGroupVariant;
  label?: JSX.Element;
  description?: JSX.Element;
  errorMessage?: JSX.Element;
};
```

### ScrollArea

```ts
type ScrollAreaProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLDivElement>, "size"> & {
  size?: number;
  offset?: number;
  visibility?: ScrollAreaVisibility;
  isEnabled?: boolean;
  orientation?: ScrollAreaOrientation;
  variant?: ScrollAreaVariant;
  hideScrollBar?: boolean;
  onVisibilityChange?: (visibility: ScrollAreaVisibility) => void;
};
```

### Select

```ts
type SelectProps = SelectRootProps;
```

### Separator

```ts
type SeparatorProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  orientation?: SeparatorOrientation;
  variant?: SeparatorVariant;
};
```

### Skeleton

```ts
type SkeletonProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & UIBaseProps & {
  shape?: SkeletonShape;
  /** Token, or a raw number of pixels for the cases a scale cannot cover. */
  width?: Width | number;
  height?: Size | number;
  size?: Size;
  radius?: Radius;
  animation?: SkeletonAnimation;
  /** Renders a stack of lines for a multi-line text placeholder. */
  lines?: number;
};
```

### Slider

```ts
type SliderProps = SliderBaseProps & IComponentBaseProps & Omit<JSX.InputHTMLAttributes<HTMLInputElement>, keyof SliderBaseProps>;
```

### Spinner

```ts
type SpinnerProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & UIBaseProps & {
  size?: Size;
  state?: State;
  shape?: SpinnerShape;
  label?: string;
};
```

### Status

_No exported props type._

### Switch

```ts
type SwitchProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "children" | "color"> & IComponentBaseProps & {
  defaultChecked?: boolean;
  children?: JSX.Element;
  description?: JSX.Element;
  icon?: JSX.Element;
  isDisabled?: boolean;
  color?: ToggleColor;
  size?: ToggleSize;
};
```

### Table

Parts: `TableExpandToggle` · `TableInlineConfirm` · `TableMobileListView` · `TableSortIcon` · `TableVirtualSpacerRow`

```ts
type TableProps = JSX.HTMLAttributes<HTMLDivElement> & IComponentBaseProps & {
  variant?: TableVariant;
};
```

### Tabs

_No exported props type._

### Text

Parts: `Textarea`

```ts
type TextProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "color"> & IComponentBaseProps & {
  size?: TextSize;
  variant?: TextVariant;
  weight?: TextWeight;
  transform?: TextTransform;
  tracking?: TextTracking;
  leading?: TextLeading;
  family?: TextFamily;
  children?: JSX.Element;
};
```

### Textarea

```ts
type TextareaProps = Omit<JSX.TextareaHTMLAttributes<HTMLTextAreaElement>, "children"> & IComponentBaseProps & {
  variant?: TextareaVariant;
  fullWidth?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
  disabled?: boolean;
};
```

### ThemeColorPicker

_No exported props type._

### Toast

Parts: `ToastActionButton` · `ToastCloseButton` · `ToastContent` · `ToastDescription` · `ToastIndicator` · `ToastProvider` · `ToastQueue` · `ToastTitle`

```ts
type ToastProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "title"> & IComponentBaseProps & {
  children?: JSX.Element;
  title?: JSX.Element;
  description?: JSX.Element;
  variant?: ToastVariant;
  indicator?: JSX.Element;
  actionProps?: ToastActionProps;
  isLoading?: boolean;
  onClose?: () => void;
  isFrontmost?: boolean;
  isHidden?: boolean;
  isEntering?: boolean;
  isExiting?: boolean;
};
```

### Tooltip

Parts: `TooltipArrow` · `TooltipContent` · `TooltipTrigger`

```ts
type TooltipProps = IComponentBaseProps & {
  children: JSX.Element;
  placement?: TooltipPlacement;
  autoFlip?: boolean;
  sideOffset?: number;
  showArrow?: boolean;
  delay?: number;
  closeDelay?: number;
  isOpen?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
};
```

---

## `@pathscale/ui/lab`

### ButtonGroup

Parts: `ButtonGroupSeparator`

```ts
type ButtonGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children?: JSX.Element;
  orientation?: ButtonGroupOrientation;
  size?: Size;
  variant?: Variant;
  isDisabled?: boolean;
  fullWidth?: boolean;
};
```

### CheckboxGroup

```ts
type CheckboxGroupProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & IComponentBaseProps & {
  children?: JSX.Element | ((values: string[]) => JSX.Element);
  value?: string[];
  defaultValue?: string[];
  onChange?: (value: string[]) => void;
  name?: string;
  isDisabled?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  variant?: CheckboxGroupVariant;
};
```

### CloseButton

```ts
type CloseButtonProps = Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "disabled"> & IComponentBaseProps & {
  variant?: CloseButtonVariant;
  isDisabled?: boolean;
  isPending?: boolean;
  startIcon?: JSX.Element;
  endIcon?: JSX.Element;
  className?: string;
};
```

### ColorArea

```ts
type ColorAreaProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & IComponentBaseProps & {
  value?: ColorAreaValue;
  onChange?: (value: ColorAreaValue) => void;
  isDisabled?: boolean;
};
```

### ColorField

```ts
type ColorFieldProps = Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "type" | "value" | "defaultValue" | "onChange"> & IComponentBaseProps & {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
  format?: ColorFieldFormat;
  fullWidth?: boolean;
};
```

### ColorPicker

```ts
type ColorPickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & IComponentBaseProps & {
  children?: JSX.Element;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
};
```

### ColorSlider

```ts
type ColorSliderProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange"> & IComponentBaseProps & {
  value?: number;
  defaultValue?: number;
  onChange?: (value: number) => void;
  type?: ColorSliderType;
  isDisabled?: boolean;
};
```

### ColorSwatchPicker

```ts
type ColorSwatchPickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> & IComponentBaseProps & {
  children: JSX.Element;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  isDisabled?: boolean;
};
```

### ColorWheelFlower

_No exported props type._

### ComboBox

Parts: `ComboBoxInput` · `ComboBoxInputGroup` · `ComboBoxList` · `ComboBoxPopover` · `ComboBoxTrigger`

```ts
type ComboBoxProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children?: JSX.Element;
};
```

### DateField

Parts: `DateFieldGroup` · `DateFieldInput` · `DateFieldInputContainer` · `DateFieldPrefix` · `DateFieldSegment` · `DateFieldSuffix`

```ts
type DateFieldProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onBlur"> & IComponentBaseProps & {
  children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element);
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
  fullWidth?: boolean;
  variant?: DateFieldVariant;
  isDisabled?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  required?: boolean;
};
```

### DatePicker

```ts
type DatePickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & IComponentBaseProps & DatePickerBaseProps;
```

### DateRangePicker

```ts
type DateRangePickerProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & IComponentBaseProps & DateRangePickerBaseProps;
```

### Join

```ts
type JoinProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLDivElement> & {
  responsive?: boolean;
  vertical?: boolean;
  horizontal?: boolean;
};
```

### Kbd

Parts: `KbdAbbr` · `KbdContent`

```ts
type KbdProps = KbdRootProps;
```

### Menu

Parts: `MenuItem` · `MenuItemIndicator` · `MenuItemSubmenuIndicator` · `MenuSection`

```ts
type MenuProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & IComponentBaseProps & {
  children?: JSX.Element;
  title?: JSX.Element;
};
```

### Meter

Parts: `MeterFill` · `MeterOutput` · `MeterTrack`

```ts
type MeterProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
  children?: JSX.Element | ((state: MeterRenderState) => JSX.Element);
  value?: number;
  minValue?: number;
  maxValue?: number;
  lowValue?: number;
  highValue?: number;
  optimumValue?: number;
  isDisabled?: boolean;
  size?: MeterSize;
  color?: MeterColor;
  formatOptions?: Intl.NumberFormatOptions;
  formatValue?: (value: number, state: Omit<MeterRenderState, "valueText">) => string;
};
```

### NoiseBackground

```ts
type NoiseBackgroundProps = {
  children?: JSX.Element;
  /** Additional CSS classes for the outer container. */
  containerClass?: string;
  /** Gradient blob colors (provide 2–3). */
  gradientColors?: string[];
  /** Noise texture opacity (0–1). @default 0.2 */
  noiseIntensity?: number;
  /** Animation velocity multiplier. @default 0.1 */
  speed?: number;
  /** Apply a backdrop-blur over the gradient layers. @default false */
  backdropBlur?: boolean;
  /** Enable/disable the wandering animation. @default true */
  animating?: boolean;
  /** CSS border-radius value. @default "var(--radius-box, 1rem)" */
  borderRadius?: string;
  /** Path or URL to the noise texture image. @default "/noise.webp" */
  noiseSrc?: string;
  /** Show the static noise texture overlay. @default false */
  showNoise?: boolean;
} & IComponentBaseProps;
```

### RadialProgress

```ts
type RadialProgressProps = IComponentBaseProps & Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
  value?: number;
  minValue?: number;
  maxValue?: number;
  isIndeterminate?: boolean;
  size?: RadialProgressSize;
  color?: RadialProgressColor;
  isDisabled?: boolean;
  formatValue?: (value: number) => string;
  label?: string;
};
```

### RangeCalendar

```ts
type RangeCalendarProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange" | "children"> & IComponentBaseProps & RangeCalendarBaseProps;
```

### SizePicker

_No exported props type._

### TimeField

Parts: `TimeFieldGroup` · `TimeFieldInput` · `TimeFieldInputContainer` · `TimeFieldPrefix` · `TimeFieldSegment` · `TimeFieldSuffix`

```ts
type TimeFieldProps = Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "onChange" | "onBlur"> & IComponentBaseProps & {
  children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element);
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>;
  fullWidth?: boolean;
  variant?: TimeFieldVariant;
  isDisabled?: boolean;
  disabled?: boolean;
  isInvalid?: boolean;
  isRequired?: boolean;
  required?: boolean;
};
```

### Toolbar

```ts
type ToolbarProps = IComponentBaseProps & JSX.HTMLAttributes<HTMLDivElement> & {
  orientation?: ToolbarOrientation;
  isAttached?: boolean;
};
```

### VideoPreview

```ts
type VideoPreviewProps = VideoPreviewBaseProps & IComponentBaseProps & Omit<JSX.VideoHTMLAttributes<HTMLVideoElement>, keyof VideoPreviewBaseProps>;
```

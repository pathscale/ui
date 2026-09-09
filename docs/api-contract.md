# API contract

**Committed, hand-edited, and enforced.** `bun run check:api` fails the build
when this file and the shipped types disagree, in either direction: a promise
the build does not keep, or API that shipped without being written down.

It is deliberately not regenerated on every build. A document derived from the
code cannot disagree with the code, which is how eleven component renames stayed
invisible for a day behind a doc that looked correct the whole time.

When an API change is intentional, run `bun run check:api -- --write`, read the
diff, and commit it. The diff is the review.

187 components. An empty list means the component adds nothing beyond
HTML attributes and `UIBaseProps`; that is an assertion, not a gap.

---

### Accordion

```ts
children?: JSX.Element
defaultValue?: AccordionValue
disabled?: boolean
hideSeparator?: boolean
onValueChange?: (value: string[]) => void
selectionMode?: AccordionSelectionMode
state?: State
value?: AccordionValue
variant?: AccordionVariant
```

### AccordionContent

```ts
children?: JSX.Element
keepMounted?: boolean
```

### AccordionIndicator

```ts
children?: JSX.Element
```

### AccordionItem

```ts
children?: JSX.Element
disabled?: boolean
state?: State
value?: string
```

### AccordionTrigger

```ts
children?: JSX.Element
indicator?: JSX.Element
showIndicator?: boolean
```

### Address

```ts
copiedLabel?: JSX.Element
copyLabel?: JSX.Element
copyable?: boolean
explorerLabel?: JSX.Element
explorerUrl?: string
font?: "mono" | "inherit"
lead?: number
name?: JSX.Element
onCopy?: (value: string) => void
size?: Size
state?: State
tail?: number
truncate?: AddressTruncate
value: string
```

### Alert

```ts
children: JSX.Element
dismissLabel?: string
flavor?: Flavor
icon?: JSX.Element | false
onDismiss?: () => void
placement?: AlertPlacement
title?: JSX.Element
variant?: Variant
```

### AuthCard

```ts
brandingSlot?: JSX.Element
children: JSX.Element
description?: JSX.Element
footer?: JSX.Element
title?: JSX.Element
```

### AuthFieldGroup

```ts
children: JSX.Element
gap?: AuthFieldGroupGap
```

### AuthFooterLinks

```ts
align?: AuthFooterLinksAlign
items: AuthFooterLinkItem[]
```

### AuthMessage

```ts
flavor?: Flavor
message?: JSX.Element | string | null
```

### AuthPoweredBy

```ts
align?: AuthPoweredByAlign
href?: string
label?: string
logo?: JSX.Element
variant?: AuthPoweredByVariant
```

### AuthSubmitButton

```ts
children: JSX.Element
flavor?: Flavor
size?: Size
state?: State
type?: "button" | "submit" | "reset"
variant?: Variant
width?: Width
```

### Avatar

```ts
children: JSX.Element
flavor?: Flavor
size?: AvatarSize
variant?: AvatarVariant
```

### AvatarFallback

```ts
children?: JSX.Element
delayMs?: number
```

### AvatarImage

_No props beyond HTML attributes and `UIBaseProps`._

### Badge

```ts
children?: JSX.Element
class?: string
flavor?: Flavor
placement?: BadgePlacement
size?: BadgeSize
state?: State
variant?: Extract<Variant, "solid" | "soft" | "outline">
```

### Breadcrumb

```ts
children: JSX.Element
separator?: JSX.Element
```

### BreadcrumbItem

```ts
children: JSX.Element
href?: string
isCurrent?: boolean
```

### Button

```ts
children?: JSX.Element
flavor?: Flavor
href?: string
radius?: Radius
rel?: string
size?: Size
state?: State
target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
type?: "button" | "submit" | "reset"
variant?: Variant
width?: Width | "square"
```

### ButtonGroup

```ts
children?: JSX.Element
fullWidth?: boolean
orientation?: ButtonGroupOrientation
size?: Size
state?: State
variant?: Variant
```

### ButtonGroupSeparator

_No props beyond HTML attributes and `UIBaseProps`._

### Calendar

```ts
dateNames?: DateNames
defaultValue?: Date
disabled?: boolean
isDateUnavailable?: (date: Date) => boolean
locale?: string
maxValue?: Date
minValue?: Date
onChange?: (value: Date) => void
onDayHover?: CalendarDayHoverHandler
onDaySelect?: CalendarDaySelectHandler
rangeEnd?: Date
rangePreview?: Date
rangeStart?: Date
selectionMode?: CalendarSelectionMode
showOutsideDays?: boolean
state?: State
value?: Date
weekdayFormat?: CalendarWeekdayFormat
```

### Card

```ts
children: JSX.Element
elevation?: CardElevation
flavor?: Flavor
footer?: JSX.Element
header?: JSX.Element
href?: string
isInteractive?: boolean
material?: Material
padding?: Space
radius?: Radius
rel?: string
state?: CardState
target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
variant?: Variant
```

### CardBody

```ts
children: JSX.Element
```

### CardFooter

```ts
children: JSX.Element
```

### CardHeader

```ts
children: JSX.Element
```

### CardRoot

```ts
children: JSX.Element
elevation?: CardElevation
flavor?: Flavor
footer?: JSX.Element
header?: JSX.Element
href?: string
isInteractive?: boolean
material?: Material
padding?: Space
radius?: Radius
rel?: string
state?: CardState
target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
variant?: Variant
```

### ChatBubble

```ts
end?: boolean
```

### Checkbox

```ts
children?: JSX.Element
defaultChecked?: boolean
description?: JSX.Element
indeterminate?: boolean
isIndeterminate?: boolean
issues?: Issue[]
onChange?: (checked: boolean) => void
onNativeChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>
state?: State
variant?: CheckboxVariant
```

### CheckboxGroup

```ts
children?: JSX.Element | ((values: string[]) => JSX.Element)
defaultValue?: string[]
disabled?: boolean
issues?: Issue[]
name?: string
onChange?: (value: string[]) => void
state?: State
value?: string[]
variant?: CheckboxGroupVariant
```

### Chip

```ts
children?: JSX.Element
class?: string
endIcon?: JSX.Element
flavor?: Flavor
onRemove?: () => void
removeButtonLabel?: string
size?: ChipSize
startIcon?: JSX.Element
state?: State
variant?: ChipVariant
```

### CloseButton

```ts
endIcon?: JSX.Element
isPending?: boolean
startIcon?: JSX.Element
state?: State
variant?: CloseButtonVariant
```

### Collapsible

```ts
children?: JSX.Element
defaultOpen?: boolean
disabled?: boolean
id?: string
onOpenChange?: (open: boolean) => void
open?: boolean
state?: State
```

### ColorArea

```ts
onChange?: (value: ColorAreaValue) => void
state?: State
value?: ColorAreaValue
```

### ColorField

```ts
defaultValue?: string
format?: ColorFieldFormat
fullWidth?: boolean
onChange?: (value: string) => void
state?: State
value?: string
```

### ColorPicker

```ts
children?: JSX.Element
defaultValue?: string
onChange?: (value: string) => void
state?: State
value?: string
```

### ColorSlider

```ts
defaultValue?: number
onChange?: (value: number) => void
state?: State
type?: ColorSliderType
value?: number
```

### ColorSwatch

```ts
color: string
colorName?: string
isSelected?: boolean
onChange?: (color: string) => void
onSelect?: (color: string) => void
shape?: ColorSwatchShape
size?: ColorSwatchSize
state?: State
```

### ColorSwatchPicker

```ts
children: JSX.Element
defaultValue?: string
onChange?: (value: string) => void
state?: State
value?: string
```

### ColorWheel

```ts
aria-label?: string
class?: string
isDisabled?: boolean
mode?: ColorWheelFlowerMode
onChange: (value: string) => void
palette?: readonly string[]
value: string
wheelClass?: string
```

### ColorWheelFlower

```ts
class?: string
color?: ColorValue | string
defaultColor?: ColorValue | string
disabled?: boolean
id?: string
mode?: ColorWheelFlowerMode
onChange?: (color: ColorValue) => void
palette?: readonly string[]
```

### ComboBox

```ts
allowsCustomValue?: boolean
children?: JSX.Element
defaultFilter?: (textValue: string, inputValue: string) => boolean
defaultInputValue?: string
defaultOpen?: boolean
defaultSelectedKey?: ComboBoxKey | null
disabled?: boolean
endIcon?: JSX.Element
fullWidth?: boolean
inputValue?: string
issues?: Issue[]
itemDisabled?: (item: T, index: number) => boolean
itemKey?: (item: T, index: number) => ComboBoxKey
itemTextValue?: (item: T, index: number) => string
items?: readonly T[]
menuTrigger?: ComboBoxMenuTrigger
name?: string
onInputChange?: (value: string) => void
onOpenChange?: (open: boolean) => void
onSelectionChange?: (key: string | null) => void
open?: boolean
placeholder?: string
required?: boolean
selectedKey?: ComboBoxKey | null
startIcon?: JSX.Element
state?: State
variant?: ComboBoxVariant
```

### ComboBoxInput

```ts
onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
```

### ComboBoxInputGroup

```ts
children?: JSX.Element
```

### ComboBoxList

```ts
children?: JSX.Element | ((item: ComboBoxListRenderItem) => JSX.Element)
endIcon?: JSX.Element
renderEmpty?: () => JSX.Element
```

### ComboBoxPopover

```ts
children?: JSX.Element
```

### ComboBoxTrigger

```ts
endIcon?: JSX.Element
startIcon?: JSX.Element
```

### ComplexColorWheel

```ts
action?: JSX.Element
adjustments: readonly ColorWheelAdjustment[]
adjustmentsClass?: string
layout?: "auto" | "beside" | "stacked"
material?: CardMaterial
```

### Composer

```ts
autofocus?: boolean
defaultValue?: string
hint?: JSX.Element
issues?: Issue[]
lead?: JSX.Element
maxRows?: number
minRows?: number
name?: string
onChange?: (value: string, reason?: ChangeReason) => void
onHeightChange?: (height: number) => void
onSubmit?: (value: string) => void
placeholder?: string
radius?: Radius
size?: Size
state?: State
submitLabel?: JSX.Element
submitOnEnter?: boolean
trail?: JSX.Element
value?: string
variant?: Variant
viewportHeight?: number
```

### ConnectionSettings

```ts
children?: JSX.Element
endpoints: readonly ConnectionSettingsEndpointLabel[]
labels: ConnectionSettingsLabels
onResetDone?: () => void
onSaveFailed?: (error: unknown) => void
onSaved?: () => void
showAppPublicId?: boolean
store: ConnectionSettingsStore
```

### CookieConsent

```ts
analytics: boolean
marketing: boolean
onConsentChange?: (payload: { type: ConsentType; analytics: boolean; marketing: boolean; }) => void
storageKeys?: CookieConsentStorageKeys
texts?: CookieConsentTexts
type: ConsentType
```

### DataGrid

```ts
borders?: DataGridBorders
caption?: JSX.Element
empty?: JSX.Element
flavor?: Flavor
interactive?: boolean
model: DataGridModel<Row>
onPageChange?: (page: number) => void
onSelectionChange?: (ids: ReadonlySet<string>) => void
onSortChange?: (sort: DataGridSort | null) => void
renderExpanded?: (row: Row) => JSX.Element
size?: Size
sticky?: DataGridSticky
striping?: DataGridStriping
width?: Width
```

### DateField

```ts
children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element)
defaultValue?: string
disabled?: boolean
fullWidth?: boolean
issues?: Issue[]
name?: string
onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>
onChange?: (value: string) => void
required?: boolean
state?: State
value?: string
variant?: DateFieldVariant
```

### DateFieldGroup

```ts
children?: JSX.Element | ((props: DateFieldRenderProps) => JSX.Element)
```

### DateFieldInput

```ts
onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
```

### DateFieldInputContainer

_No props beyond HTML attributes and `UIBaseProps`._

### DateFieldPrefix

_No props beyond HTML attributes and `UIBaseProps`._

### DateFieldSegment

```ts
segment?: DateFieldSegmentValue
```

### DateFieldSuffix

_No props beyond HTML attributes and `UIBaseProps`._

### DatePicker

```ts
dateNames?: DateNames
defaultOpen?: boolean
defaultValue?: Date
disabled?: boolean
isDateUnavailable?: (date: Date) => boolean
locale?: string
maxValue?: Date
minValue?: Date
name?: string
onChange?: (value: Date) => void
onOpenChange?: (isOpen: boolean) => void
open?: boolean
placeholder?: string
state?: State
value?: Date
weekdayFormat?: CalendarWeekdayFormat
```

### DateRangePicker

```ts
dateNames?: DateNames
defaultOpen?: boolean
defaultValue?: DateRangeValue
disabled?: boolean
endName?: string
endPlaceholder?: string
isDateUnavailable?: (date: Date) => boolean
locale?: string
maxValue?: Date
minValue?: Date
onChange?: (value: DateRangeValue) => void
onOpenChange?: (isOpen: boolean) => void
open?: boolean
startName?: string
startPlaceholder?: string
state?: State
value?: DateRangeValue
weekdayFormat?: CalendarWeekdayFormat
```

### Dialog

```ts
backdrop?: DialogBackdropVariant
children: JSX.Element
defaultOpen?: boolean
isDismissable?: boolean
onOpenChange?: (isOpen: boolean) => void
open?: boolean
placement?: DialogPlacement
scrollBehavior?: DialogScrollBehavior
shouldCloseOnBackdropClick?: boolean
shouldCloseOnEsc?: boolean
size?: DialogSize
```

### DialogBackdrop

```ts
children: JSX.Element
isDismissable?: boolean
shouldCloseOnBackdropClick?: boolean
variant?: DialogBackdropVariant
```

### DialogBody

```ts
children: JSX.Element
```

### DialogCloseTrigger

```ts
children?: JSX.Element
```

### DialogContent

```ts
backdrop?: DialogBackdropVariant
children: JSX.Element
isDismissable?: boolean
material?: Material
placement?: DialogPlacement
scrollBehavior?: DialogScrollBehavior
shouldCloseOnBackdropClick?: boolean
size?: DialogSize
```

### DialogFooter

```ts
children: JSX.Element
```

### DialogHeader

```ts
children: JSX.Element
```

### DialogHeading

```ts
children: JSX.Element
```

### DialogIcon

```ts
children: JSX.Element
```

### DialogTrigger

```ts
children: JSX.Element
```

### Dock

```ts
baseSize?: number
desktopClass?: string
gap?: number
hoverIconSize?: number
hoverSize?: number
iconSize?: number
itemClass?: string
items: DockItem[]
magnify?: boolean
magnifyRange?: number
mobileClass?: string
mobileMode?: "burger" | "dock"
mobilePopupDirection?: DockDirection
mobileToggleIcon?: JSX.Element
nudge?: number
orientation?: "horizontal" | "vertical"
showContainer?: boolean
showDesktop?: boolean
showMobile?: boolean
springDamping?: number
springMass?: number
springStiffness?: number
tooltipClass?: string
tooltipDirection?: DockDirection
```

### Drawer

```ts
backdrop?: DrawerBackdropVariant
children: JSX.Element
defaultOpen?: boolean
isDismissable?: boolean
onOpenChange?: (isOpen: boolean) => void
open?: boolean
placement?: DrawerPlacement
restoreFocus?: boolean
scrollBehavior?: DrawerScrollBehavior
shouldCloseOnBackdropClick?: boolean
shouldCloseOnEsc?: boolean
size?: DrawerSize
trapFocus?: boolean
```

### DrawerBackdrop

```ts
children: JSX.Element
isDismissable?: boolean
shouldCloseOnBackdropClick?: boolean
variant?: DrawerBackdropVariant
```

### DrawerBody

```ts
children: JSX.Element
id?: string
```

### DrawerClose

```ts
children: JSX.Element
```

### DrawerCloseTrigger

```ts
children?: JSX.Element
endIcon?: JSX.Element
startIcon?: JSX.Element
```

### DrawerContent

```ts
children: JSX.Element
material?: Material
placement?: DrawerPlacement
scrollBehavior?: DrawerScrollBehavior
```

### DrawerDialog

```ts
bg?: string
borderColor?: string
borderWidth?: string
children: JSX.Element
maxWidth?: string
padding?: string
side?: DrawerDialogSide
size?: DrawerSize
width?: string
```

### DrawerFooter

```ts
children: JSX.Element
```

### DrawerHandle

_No props beyond HTML attributes and `UIBaseProps`._

### DrawerHeader

```ts
children: JSX.Element
```

### DrawerHeading

```ts
children: JSX.Element
id?: string
```

### DrawerTrigger

```ts
as?: ValidComponent
children: JSX.Element
```

### Dropdown

```ts
autoFlip?: boolean
children: JSX.Element
dataTheme?: string
defaultOpen?: boolean
disabled?: boolean
onOpenChange?: (open: boolean) => void
open?: boolean
placement?: DropdownPlacement
```

### Empty

```ts
children: JSX.Element
```

### FieldErrorMessage

```ts
message?: string
```

### FieldGroup

```ts
children?: JSX.Element
```

### Fieldset

_No props beyond HTML attributes and `UIBaseProps`._

### FieldsetActions

```ts
children?: JSX.Element
```

### FieldsetLegend

_No props beyond HTML attributes and `UIBaseProps`._

### FirefoxPWABanner

```ts
extensionUrl?: string
icon?: string | JSX.Element
onDismiss?: () => void
onInstall?: () => void
storageKey?: string
texts?: FirefoxPWABannerTexts
```

### Flex

```ts
align?: ResponsiveProp<"start" | "center" | "end" | "stretch" | "baseline">
as?: keyof JSX.IntrinsicElements
basis?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">
direction?: ResponsiveProp<"row" | "col" | "row-reverse" | "col-reverse">
gap?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">
gapX?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">
gapY?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">
grow?: ResponsiveProp<boolean>
height?: ResponsiveProp<"full">
justify?: ResponsiveProp<"start" | "center" | "end" | "between" | "around" | "evenly">
minHeight?: ResponsiveProp<"zero">
minWidth?: ResponsiveProp<"zero">
paddingBlock?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">
paddingInline?: ResponsiveProp<"none" | "sm" | "md" | "lg" | "xl">
shrink?: ResponsiveProp<boolean>
width?: ResponsiveProp<"full">
wrap?: ResponsiveProp<"wrap" | "nowrap" | "wrap-reverse">
```

### FlexGrid

```ts
autoLoad?: boolean
children: (row: T, index: () => number) => JSX.Element
class?: string
count: number
empty?: JSX.Element
fromEnd?: boolean
more?: (props: { count: number; remaining: number; reveal: () => void; }) => JSX.Element
pageSize?: number
remaining: number
reveal: () => void
rows: readonly T[]
```

### Footer

```ts
center?: boolean
children?: JSX.Element
horizontal?: boolean
vertical?: boolean
```

### Form

_No props beyond HTML attributes and `UIBaseProps`._

### FormField

```ts
class?: string
form?: AnyFormApi
inputProps?: Omit<InputFieldProps, "name" | "value" | "onInput" | "onBlur" | "aria-invalid" | "isInvalid">
label?: JSX.Element
name: string
```

### FormSubmitButton

```ts
children?: JSX.Element
flavor?: Flavor
form?: AnyFormApi
href?: string
radius?: Radius
rel?: string
size?: Size
state?: State
target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
variant?: Variant
width?: Width | "square"
```

### GlowCard

_No props beyond HTML attributes and `UIBaseProps`._

### Grid

```ts
as?: keyof JSX.IntrinsicElements
autoCols?: ResponsiveProp<AutoSize>
autoRows?: ResponsiveProp<AutoSize>
cols?: ResponsiveProp<GridSize>
flow?: ResponsiveProp<GridFlow>
gap?: ResponsiveProp<GridGap>
rows?: ResponsiveProp<GridSize>
```

### Header

_No props beyond HTML attributes and `UIBaseProps`._

### I18nProvider

```ts
children: JSX.Element
i18n: I18nStore
```

### Icon

```ts
flavor?: Flavor
height?: number
label?: string
src?: string | JSX.Element
width?: number
```

### ImmersiveLanding

```ts
appVersion?: string
children: JSX.Element | ((context: ImmersiveLandingContextValue) => JSX.Element)
cookieConfig?: CookieConsentProps
currentPage?: Accessor<string>
enableScrollNavigation?: boolean
firefoxPWAConfig?: FirefoxPWABannerProps
initialPage?: string
onNavigate?: (fromPage: string, toPage: string) => void
onNavigationComplete?: (page: string) => void
overlay?: JSX.Element | ((context: ImmersiveLandingContextValue) => JSX.Element)
pages: readonly string[]
pwaConfig?: PWAInstallPromptProps
showArrows?: boolean
showCookieConsent?: boolean
showFirefoxBanner?: boolean
showNavigation?: boolean
showPWAPrompt?: boolean
transitionDuration?: number
```

### InlineEdit

```ts
children?: JSX.Element
disabled?: boolean
fieldClass?: string
fullWidth?: boolean
label?: string
onCommit?: (value: string) => void | Promise<unknown>
trigger?: JSX.Element
value: string
```

### Input

```ts
errorMessage?: JSX.Element
helperText?: JSX.Element
id?: string
label?: JSX.Element
```

### InputOTP

```ts
autoFocus?: boolean
children?: JSX.Element
defaultValue?: string
disabled?: boolean
inputClassName?: string
inputmode?: JSX.InputHTMLAttributes<HTMLInputElement>["inputmode"]
issues?: Issue[]
maxLength?: number
name?: string
onChange?: (value: string) => void
onComplete?: (value: string) => void
pattern?: string
state?: State
value?: string
variant?: InputOTPVariant
```

### InputOTPGroup

```ts
children?: JSX.Element
```

### InputOTPSeparator

```ts
children?: JSX.Element
```

### InputOTPSlot

```ts
index: number
```

### Join

```ts
horizontal?: boolean
responsive?: boolean
vertical?: boolean
```

### Kbd

```ts
children?: JSX.Element
variant?: KbdVariant
```

### KbdAbbr

```ts
keyValue: KbdKey
```

### KbdContent

```ts
children?: JSX.Element
```

### Label

```ts
for?: string
htmlFor?: string
issues?: Issue[]
required?: boolean
state?: State
```

### LanguageSwitcher

```ts
align?: DropdownAlign
aria-label?: string
currentLanguageLabel?: string
i18n: I18nStore
id?: string
loadingLabel?: string
onLanguageChange?: (lang: string) => void
optionsLabel?: string
```

### Link

```ts
isExternal?: boolean
state?: State
underline?: LinkUnderline
variant?: LinkVariant
```

### LinkIcon

_No props beyond HTML attributes and `UIBaseProps`._

### ListBox

```ts
children?: JSX.Element | ((item: T) => JSX.Element)
defaultSelectedKeys?: Iterable<string | number>
disabled?: boolean
disabledKeys?: Iterable<string | number>
disallowEmptySelection?: boolean
items?: readonly T[]
onAction?: (key: string) => void
onSelectionChange?: (keys: Set<string>) => void
renderEmpty?: () => JSX.Element
selectedKeys?: Iterable<string | number>
selectionMode?: ListBoxSelectionMode
state?: State
variant?: ListBoxVariant
```

### ListBoxItem

```ts
children?: JSX.Element | ((props: ListBoxItemRenderProps) => JSX.Element)
disabled?: boolean
id?: string | number
state?: State
textValue?: string
variant?: ListBoxVariant
```

### ListBoxItemIndicator

```ts
children?: JSX.Element | ((props: ListBoxItemRenderProps) => JSX.Element)
```

### ListBoxSection

```ts
children?: JSX.Element
title?: JSX.Element
```

### LiveChatBubble

```ts
aria-label?: string
autoScrollBehavior?: "instant" | "smooth"
autoScrollOnNewMessage?: boolean
children?: JSX.Element
onClose?: () => void
onOpen?: () => void
panelProps?: Omit<LiveChatPanelProps, "onClose">
position?: "bottom-right" | "bottom-left"
stickToBottomThreshold?: number
unreadCount?: number
```

### LiveChatPanel

```ts
autoScrollBehavior?: "instant" | "smooth"
autoScrollOnNewMessage?: boolean
closeLabel?: string
emptyMessage?: string
isSending?: boolean
messages?: ChatMessage[]
mockMode?: boolean
onClose: () => void
onSendMessage?: (payload: SendMessagePayload) => Promise<SendMessageResponse>
placeholder?: string
sendLabel?: string
stickToBottomThreshold?: number
title?: string
```

### Menu

```ts
children?: JSX.Element | ((item: T) => JSX.Element)
defaultSelectedKeys?: Iterable<string | number>
disabled?: boolean
disabledKeys?: Iterable<string | number>
disallowEmptySelection?: boolean
items?: readonly T[]
material?: Material
onAction?: (key: string) => void
onSelectionChange?: (keys: Set<string>) => void
renderEmpty?: () => JSX.Element
selectedKeys?: Iterable<string | number>
selectionMode?: MenuSelectionMode
state?: State
```

### MenuItem

```ts
children?: JSX.Element | ((props: MenuItemRenderProps) => JSX.Element)
disabled?: boolean
hasSubmenu?: boolean
id?: string | number
onAction?: (key: string) => void
state?: State
textValue?: string
variant?: MenuItemVariant
```

### MenuItemIndicator

```ts
children?: JSX.Element | ((props: MenuItemRenderProps) => JSX.Element)
type?: MenuItemIndicatorType
```

### MenuItemSubmenuIndicator

```ts
children?: JSX.Element
```

### MenuSection

```ts
children?: JSX.Element
title?: JSX.Element
```

### MetalBorder

```ts
children?: JSX.Element
contentClass?: string
cornerRadius?: number | string
glow?: boolean
kind?: MetalBorderKind
paused?: boolean
preset?: MetalBorderPreset
strength?: number
theme?: MetalBorderTheme
```

### Meter

```ts
children?: JSX.Element | ((state: MeterRenderState) => JSX.Element)
flavor?: Flavor
formatOptions?: Intl.NumberFormatOptions
formatValue?: (value: number, state: Omit<MeterRenderState, "valueText">) => string
highValue?: number
lowValue?: number
maxValue?: number
minValue?: number
optimumValue?: number
size?: MeterSize
state?: State
value?: number
```

### MeterFill

_No props beyond HTML attributes and `UIBaseProps`._

### MeterOutput

_No props beyond HTML attributes and `UIBaseProps`._

### MeterTrack

_No props beyond HTML attributes and `UIBaseProps`._

### Navbar

```ts
as?: keyof JSX.IntrinsicElements
dataTheme?: string
material?: Material
```

### NoiseBackground

```ts
animating?: boolean
backdropBlur?: boolean
borderRadius?: string
children?: JSX.Element
containerClass?: string
gradientColors?: string[]
noiseIntensity?: number
noiseSrc?: string
showNoise?: boolean
speed?: number
```

### Pagination

```ts
onChange: (page: number) => void
page: number
state?: State
total: number
```

### PanelToggle

```ts
aria-controls?: string
aria-label: string
expanded: boolean
id: string
side?: PanelToggleSide
```

### PasswordField

```ts
aria-describedby?: string
autocomplete?: "current-password" | "new-password" | "off"
autofocus?: boolean
class?: string
disabled?: boolean
hiddenIcon?: JSX.Element
hideLabel: string
id?: string
inputClass?: string
inputRef?: (el: HTMLInputElement) => void
invalid?: boolean
label?: JSX.Element
name?: string
onBlur?: () => void
onChange?: (value: string) => void
onVisibilityChange?: (visible: boolean) => void
placeholder?: string
required?: boolean
showLabel: string
startIcon?: JSX.Element
value?: string
visibleIcon?: JSX.Element
```

### PasswordRequirements

```ts
metIcon?: JSX.Element
results: PasswordRuleResult[]
title?: JSX.Element
unmetIcon?: JSX.Element
```

### Popover

```ts
anchorRect?: PopoverAnchor
autoFlip?: boolean
children: JSX.Element
closeOnEscape?: boolean
closeOnOutsideClick?: boolean
defaultOpen?: boolean
offset?: number
onInteractOutside?: (event: Event) => void
onOpenChange?: (open: boolean) => void
open?: boolean
placement?: PopoverPlacement
```

### Progress

```ts
flavor?: Flavor
formatValue?: (value: number) => string
isIndeterminate?: boolean
label?: string
maxValue?: number
minValue?: number
showValue?: boolean
size?: ProgressSize
state?: State
value?: number
```

### PWAInstallPrompt

```ts
appIcon?: string
appName?: string
onDismiss?: () => void
onInstall?: () => void
storageKey?: string
texts?: PWAInstallPromptTexts
```

### RadialProgress

```ts
flavor?: Flavor
formatValue?: (value: number) => string
isIndeterminate?: boolean
label?: string
maxValue?: number
minValue?: number
size?: RadialProgressSize
state?: State
value?: number
```

### Radio

```ts
children?: JSX.Element
description?: JSX.Element
indicator?: JSX.Element
issues?: Issue[]
onChange?: (checked: boolean) => void
onNativeChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>
state?: State
```

### RadioGroup

```ts
children: JSX.Element
defaultValue?: string
description?: JSX.Element
disabled?: boolean
errorMessage?: JSX.Element
issues?: Issue[]
label?: JSX.Element
name?: string
onChange?: (value: string) => void
orientation?: RadioGroupOrientation
state?: State
value?: string
variant?: RadioGroupVariant
```

### RangeCalendar

```ts
dateNames?: DateNames
defaultValue?: RangeCalendarValue
disabled?: boolean
isDateUnavailable?: (date: Date) => boolean
locale?: string
maxValue?: Date
minValue?: Date
onChange?: (value: RangeCalendarValue) => void
onDayHover?: (date?: Date) => void
onDaySelect?: (date: Date) => void
showOutsideDays?: boolean
state?: State
value?: RangeCalendarValue
weekdayFormat?: CalendarWeekdayFormat
```

### ScrollArea

```ts
hideScrollBar?: boolean
isEnabled?: boolean
offset?: number
onVisibilityChange?: (visibility: ScrollAreaVisibility) => void
orientation?: ScrollAreaOrientation
size?: number
variant?: ScrollAreaVariant
visibility?: ScrollAreaVisibility
```

### Select

```ts
autoFlip?: boolean
children: JSX.Element
defaultOpen?: boolean
defaultSelectedKeys?: Iterable<SelectKey>
defaultValue?: SelectValueType
disabled?: boolean
fullWidth?: boolean
onChange?: (value: string | string[] | null) => void
onOpenChange?: (open: boolean) => void
onSelectionChange?: (keys: Set<string>) => void
open?: boolean
placeholder?: string
placement?: SelectPlacement
selectedKeys?: Iterable<SelectKey>
selectionMode?: SelectSelectionMode
state?: State
value?: SelectValueType
variant?: SelectVariant
```

### Separator

```ts
orientation?: SeparatorOrientation
variant?: SeparatorVariant
```

### SizePicker

```ts
aria-label?: string
onSizeChange?: (size: SizePreset) => void
storagePrefix?: string
```

### Skeleton

```ts
animation?: SkeletonAnimation
height?: Size | number
lines?: number
radius?: Radius
shape?: SkeletonShape
size?: Size
width?: Width | number
```

### Slider

```ts
class?: string
dataTheme?: string
disabled?: boolean
formatValue?: (value: number) => string
label?: string
max?: number
min?: number
onChange: (value: number) => void
onChangeEnd?: (value: number) => void
size?: SliderSize
step?: number
style?: JSX.CSSProperties
value: number
```

### Spinner

```ts
flavor?: Flavor
label?: string
shape?: SpinnerShape
size?: Size
```

### Switch

```ts
children?: JSX.Element
defaultChecked?: boolean
description?: JSX.Element
flavor?: Flavor
icon?: JSX.Element
onChange?: (checked: boolean) => void
onNativeChange?: JSX.EventHandlerUnion<HTMLInputElement, Event>
size?: ToggleSize
state?: State
```

### Table

```ts
variant?: TableVariant
```

### TableExpandToggle

```ts
disabled?: boolean
expanded: boolean
label?: string
onToggle?: () => void
size?: number
```

### TableInlineConfirm

```ts
cancelLabel: string
confirmFlavor?: InlineConfirmVariant
confirmLabel: string
disabled?: boolean
loading?: boolean
onCancel: () => void
onConfirm: () => void
prompt: string
```

### TableMobileListView

```ts
children?: (row: TRow, index: number) => JSX.Element
empty?: JSX.Element
emptyIcon?: string
emptyTitle?: string
itemClass?: string
listClass?: string
renderRow?: (row: TRow, index: number) => JSX.Element
rows: TRow[]
```

### TableSortIcon

```ts
ascIcon?: JSX.Element
descIcon?: JSX.Element
neutralIcon?: JSX.Element
size?: number
state: SortIconState
```

### TableVirtualSpacerRow

```ts
colspan: number
height: number
```

### Tabs

```ts
children: JSX.Element
defaultSelectedKey?: TabKey
onSelectionChange?: (key: TabKey) => void
orientation?: TabsOrientation
selectedKey?: TabKey
variant?: TabsVariant
```

### Text

```ts
as?: TextAs
children?: JSX.Element
family?: TextFamily
leading?: TextLeading
size?: TextSize
tracking?: TextTracking
transform?: TextTransform
variant?: TextVariant
weight?: TextWeight
```

### Textarea

```ts
disabled?: boolean
fullWidth?: boolean
issues?: Issue[]
state?: State
variant?: TextareaVariant
```

### ThemeColorPicker

```ts
align?: ThemeColorPickerAlign
aria-label?: string
autoFlip?: boolean
children?: JSX.Element
onColorChange?: (hue: number | null, saturation: number) => void
onThemeSwitch?: (theme: "light" | "dark") => void
placement?: ThemeColorPickerPlacement
storagePrefix?: string
```

### TimeField

```ts
children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element)
defaultValue?: string
disabled?: boolean
fullWidth?: boolean
issues?: Issue[]
name?: string
onBlur?: JSX.EventHandlerUnion<HTMLInputElement, FocusEvent>
onChange?: (value: string) => void
required?: boolean
state?: State
value?: string
variant?: TimeFieldVariant
```

### TimeFieldGroup

```ts
children?: JSX.Element | ((props: TimeFieldRenderProps) => JSX.Element)
```

### TimeFieldInput

```ts
onInput?: JSX.EventHandlerUnion<HTMLInputElement, InputEvent>
```

### TimeFieldInputContainer

_No props beyond HTML attributes and `UIBaseProps`._

### TimeFieldPrefix

_No props beyond HTML attributes and `UIBaseProps`._

### TimeFieldSegment

```ts
segment?: TimeFieldSegmentValue
```

### TimeFieldSuffix

_No props beyond HTML attributes and `UIBaseProps`._

### Toast

```ts
actionProps?: ToastActionProps
children?: JSX.Element
description?: JSX.Element
indicator?: JSX.Element
isEntering?: boolean
isExiting?: boolean
isFrontmost?: boolean
isHidden?: boolean
onClose?: () => void
state?: State
title?: JSX.Element
variant?: ToastVariant
```

### ToastActionButton

```ts
children?: JSX.Element
flavor?: Flavor
href?: string
radius?: Radius
rel?: string
state?: State
target?: JSX.AnchorHTMLAttributes<HTMLAnchorElement>["target"]
type?: "button" | "submit" | "reset"
width?: Width | "square"
```

### ToastCloseButton

```ts
isPending?: boolean
state?: State
variant?: CloseButtonVariant
```

### ToastContent

```ts
children?: JSX.Element
```

### ToastDescription

```ts
children?: JSX.Element
```

### ToastIndicator

```ts
children?: JSX.Element
variant?: ToastVariant
```

### ToastProvider

```ts
children?: JSX.Element
gap?: number
maxVisibleToasts?: number
placement?: ToastPlacement
queue?: ToastQueue<ToastContentValue> | null
renderToast?: ToastRenderFn
scaleFactor?: number
width?: number | string
```

### ToastTitle

```ts
children?: JSX.Element
```

### Toolbar

```ts
isAttached?: boolean
orientation?: ToolbarOrientation
```

### Tooltip

```ts
autoFlip?: boolean
children: JSX.Element
closeDelay?: number
defaultOpen?: boolean
delay?: number
onOpenChange?: (isOpen: boolean) => void
open?: boolean
placement?: TooltipPlacement
showArrow?: boolean
sideOffset?: number
```

### TooltipArrow

```ts
children?: JSX.Element
```

### TooltipContent

```ts
children: JSX.Element
```

### TooltipTrigger

```ts
children: JSX.Element
```

### VideoPreview

```ts
mirror?: boolean
muted?: boolean
stream: Accessor<MediaStream | null>
```

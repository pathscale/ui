# API contract

**Committed, hand-edited, and enforced.** `bun run check:api` fails the build
when this file and the shipped types disagree, in either direction: a promise
the build does not keep, or API that shipped without being written down.

It is deliberately not regenerated on every build. A document derived from the
code cannot disagree with the code, which is how eleven component renames stayed
invisible for a day behind a doc that looked correct the whole time.

When an API change is intentional, run `bun run check:api -- --write`, read the
diff, and commit it. The diff is the review.

180 components. An empty list means the component adds nothing beyond
HTML attributes and `UIBaseProps`; that is an assertion, not a gap.

---

### Accordion

`children defaultValue disabled hideSeparator onValueChange selectionMode state value variant`

### AccordionContent

`children keepMounted`

### AccordionIndicator

`children`

### AccordionItem

`children disabled state value`

### AccordionTrigger

`children indicator showIndicator`

### Address

`copiedLabel copyLabel copyable explorerLabel explorerUrl font lead name onCopy size state tail truncate value`

### Alert

`children dismissLabel flavor icon onDismiss placement title variant`

### AuthCard

`brandingSlot children description footer title`

### AuthFieldGroup

`children gap`

### AuthFooterLinks

`align items`

### AuthMessage

`flavor message`

### AuthPoweredBy

`align href label logo variant`

### AuthSubmitButton

`children flavor size state type variant width`

### Avatar

`children flavor size variant`

### AvatarFallback

`children delayMs`

### AvatarImage

``

### Badge

`children class flavor placement size state variant`

### Breadcrumb

`children separator`

### BreadcrumbItem

`children href isCurrent`

### Button

`children flavor href radius rel size state target type variant width`

### ButtonGroup

`children fullWidth orientation size state variant`

### ButtonGroupSeparator

``

### Calendar

`defaultValue disabled isDateUnavailable locale maxValue minValue onChange onDayHover onDaySelect rangeEnd rangePreview rangeStart selectionMode showOutsideDays state value weekdayFormat`

### Card

`children elevation flavor footer header isInteractive material padding radius state variant`

### CardBody

`children`

### CardFooter

`children`

### CardHeader

`children`

### CardRoot

`children elevation flavor footer header isInteractive material padding radius state variant`

### ChatBubble

`end`

### Checkbox

`children defaultChecked description indeterminate isIndeterminate issues state variant`

### CheckboxGroup

`children defaultValue disabled issues name onChange state value variant`

### Chip

`children class endIcon flavor onRemove removeButtonLabel size startIcon state variant`

### CloseButton

`endIcon isPending startIcon state variant`

### Collapsible

`children defaultOpen disabled id onOpenChange open state`

### ColorArea

`onChange state value`

### ColorField

`defaultValue format fullWidth onChange state value`

### ColorPicker

`children defaultValue onChange state value`

### ColorSlider

`defaultValue onChange state type value`

### ColorSwatch

`color colorName isSelected onChange onSelect shape size state`

### ColorSwatchPicker

`children defaultValue onChange state value`

### ColorWheelFlower

`class mode palette`

### ComboBox

`allowsCustomValue children defaultFilter defaultInputValue defaultOpen defaultSelectedKey disabled endIcon fullWidth inputValue issues itemDisabled itemKey itemTextValue items menuTrigger name onInputChange onOpenChange onSelectionChange open placeholder required selectedKey startIcon state variant`

### ComboBoxInput

`onInput`

### ComboBoxInputGroup

`children`

### ComboBoxList

`children endIcon renderEmpty`

### ComboBoxPopover

`children`

### ComboBoxTrigger

`endIcon startIcon`

### Composer

`autofocus defaultValue hint issues lead maxRows minRows name onChange onHeightChange onSubmit placeholder radius size state submitLabel submitOnEnter trail value variant viewportHeight`

### CookieConsent

`analytics marketing onConsentChange storageKeys texts type`

### DataGrid

`borders caption empty flavor interactive model onPageChange onSelectionChange onSortChange renderExpanded size sticky striping width`

### DateField

`children defaultValue disabled fullWidth issues name onBlur onChange required state value variant`

### DateFieldGroup

`children`

### DateFieldInput

`onInput`

### DateFieldInputContainer

``

### DateFieldPrefix

``

### DateFieldSegment

`segment`

### DateFieldSuffix

``

### DatePicker

`defaultOpen defaultValue disabled isDateUnavailable locale maxValue minValue name onChange onOpenChange open placeholder state value weekdayFormat`

### DateRangePicker

`defaultOpen defaultValue disabled endName endPlaceholder isDateUnavailable locale maxValue minValue onChange onOpenChange open startName startPlaceholder state value weekdayFormat`

### Dialog

`backdrop children defaultOpen isDismissable onOpenChange open placement scrollBehavior shouldCloseOnBackdropClick shouldCloseOnEsc size`

### DialogBackdrop

`children isDismissable shouldCloseOnBackdropClick variant`

### DialogBody

`children`

### DialogCloseTrigger

`children`

### DialogContent

`backdrop children isDismissable material placement scrollBehavior shouldCloseOnBackdropClick size`

### DialogFooter

`children`

### DialogHeader

`children`

### DialogHeading

`children`

### DialogIcon

`children`

### DialogTrigger

`children`

### Dock

`baseSize desktopClass gap hoverIconSize hoverSize iconSize itemClass items magnify magnifyRange mobileClass mobileMode mobilePopupDirection mobileToggleIcon nudge orientation showContainer showDesktop showMobile springDamping springMass springStiffness tooltipClass tooltipDirection`

### Drawer

`backdrop children defaultOpen isDismissable onOpenChange open placement restoreFocus scrollBehavior shouldCloseOnBackdropClick shouldCloseOnEsc size trapFocus`

### DrawerBackdrop

`children isDismissable shouldCloseOnBackdropClick variant`

### DrawerBody

`children id`

### DrawerClose

`children`

### DrawerCloseTrigger

`children endIcon startIcon`

### DrawerContent

`children material placement scrollBehavior`

### DrawerDialog

`bg borderColor borderWidth children maxWidth padding side size width`

### DrawerFooter

`children`

### DrawerHandle

``

### DrawerHeader

`children`

### DrawerHeading

`children id`

### DrawerTrigger

`children`

### Dropdown

`autoFlip children dataTheme defaultOpen disabled onOpenChange open placement`

### Empty

`children`

### FieldGroup

`children`

### Fieldset

``

### FieldsetActions

`children`

### FieldsetLegend

``

### FirefoxPWABanner

`extensionUrl onDismiss onInstall storageKey texts`

### Flex

`align as basis direction gap gapX gapY grow height justify minHeight minWidth paddingBlock paddingInline shrink width wrap`

### Footer

`center children horizontal vertical`

### Form

``

### FormField

`class form inputProps label name`

### FormSubmitButton

`children flavor form href radius rel size state target variant width`

### GlowCard

``

### Grid

`as autoCols autoRows cols flow gap rows`

### Header

``

### I18nProvider

`children i18n`

### Icon

`flavor height src width`

### ImmersiveLanding

`appVersion children cookieConfig currentPage enableScrollNavigation firefoxPWAConfig initialPage onNavigate onNavigationComplete overlay pages pwaConfig showArrows showCookieConsent showFirefoxBanner showNavigation showPWAPrompt transitionDuration`

### Input

`errorMessage helperText id label`

### InputOTP

`autoFocus children defaultValue disabled inputClassName inputmode issues maxLength name onChange onComplete pattern state value variant`

### InputOTPGroup

`children`

### InputOTPSeparator

`children`

### InputOTPSlot

`index`

### Join

`horizontal responsive vertical`

### Kbd

`children variant`

### KbdAbbr

`keyValue`

### KbdContent

`children`

### Label

`for htmlFor issues required state`

### LanguageSwitcher

`align aria-label currentLanguageLabel i18n loadingLabel onLanguageChange optionsLabel`

### Link

`isExternal state underline variant`

### LinkIcon

``

### ListBox

`children defaultSelectedKeys disabled disabledKeys disallowEmptySelection items onAction onSelectionChange renderEmpty selectedKeys selectionMode state variant`

### ListBoxItem

`children disabled id state textValue variant`

### ListBoxItemIndicator

`children`

### ListBoxSection

`children title`

### LiveChatBubble

`aria-label autoScrollBehavior autoScrollOnNewMessage children onClose onOpen panelProps position stickToBottomThreshold unreadCount`

### LiveChatPanel

`autoScrollBehavior autoScrollOnNewMessage closeLabel emptyMessage isSending messages mockMode onClose onSendMessage placeholder sendLabel stickToBottomThreshold title`

### Menu

`children defaultSelectedKeys disabled disabledKeys disallowEmptySelection items material onAction onSelectionChange renderEmpty selectedKeys selectionMode state`

### MenuItem

`children disabled hasSubmenu id onAction state textValue variant`

### MenuItemIndicator

`children type`

### MenuItemSubmenuIndicator

`children`

### MenuSection

`children title`

### MetalBorder

`children contentClass cornerRadius glow kind paused preset strength theme`

### Meter

`children flavor formatOptions formatValue highValue lowValue maxValue minValue optimumValue size state value`

### MeterFill

``

### MeterOutput

``

### MeterTrack

``

### Navbar

`as dataTheme material`

### NoiseBackground

`animating backdropBlur borderRadius children containerClass gradientColors noiseIntensity noiseSrc showNoise speed`

### Pagination

`onChange page state total`

### PasswordField

`aria-describedby autocomplete autofocus class disabled hiddenIcon hideLabel id inputClass inputRef invalid label name onBlur onInput onVisibilityChange placeholder required showLabel startIcon value visibleIcon`

### PasswordRequirements

`metIcon results title unmetIcon`

### Popover

`anchorRect autoFlip children closeOnEscape closeOnOutsideClick defaultOpen offset onInteractOutside onOpenChange open placement`

### Progress

`flavor formatValue isIndeterminate label maxValue minValue showValue size state value`

### PWAInstallPrompt

`appIcon appName onDismiss onInstall storageKey texts`

### RadialProgress

`flavor formatValue isIndeterminate label maxValue minValue size state value`

### Radio

`children description indicator issues state`

### RadioGroup

`children defaultValue description disabled errorMessage issues label name onChange orientation state value variant`

### RangeCalendar

`defaultValue disabled isDateUnavailable locale maxValue minValue onChange onDayHover onDaySelect showOutsideDays state value weekdayFormat`

### ScrollArea

`hideScrollBar isEnabled offset onVisibilityChange orientation size variant visibility`

### Select

`autoFlip children defaultOpen defaultSelectedKeys defaultValue disabled fullWidth onChange onOpenChange onSelectionChange open placeholder placement selectedKeys selectionMode state value variant`

### Separator

`orientation variant`

### SizePicker

`aria-label onSizeChange storagePrefix`

### Skeleton

`animation height lines radius shape size width`

### Slider

`class dataTheme disabled formatValue label max min onChange onChangeEnd size step style value`

### Spinner

`flavor label shape size`

### Switch

`children defaultChecked description flavor icon size state`

### Table

`variant`

### TableExpandToggle

`disabled expanded label onToggle size`

### TableInlineConfirm

`cancelLabel confirmFlavor confirmLabel disabled loading onCancel onConfirm prompt`

### TableMobileListView

`children empty emptyIcon emptyTitle itemClass listClass renderRow rows`

### TableSortIcon

`ascIcon descIcon neutralIcon size state`

### TableVirtualSpacerRow

`colspan height`

### Tabs

`children defaultSelectedKey onSelectionChange orientation selectedKey variant`

### Text

`children family leading size tracking transform variant weight`

### Textarea

`disabled fullWidth issues state variant`

### ThemeColorPicker

`align aria-label autoFlip children onColorChange onThemeSwitch placement storagePrefix`

### TimeField

`children defaultValue disabled fullWidth issues name onBlur onChange required state value variant`

### TimeFieldGroup

`children`

### TimeFieldInput

`onInput`

### TimeFieldInputContainer

``

### TimeFieldPrefix

``

### TimeFieldSegment

`segment`

### TimeFieldSuffix

``

### Toast

`actionProps children description indicator isEntering isExiting isFrontmost isHidden onClose state title variant`

### ToastActionButton

`children flavor href radius rel state target type width`

### ToastCloseButton

`isPending state variant`

### ToastContent

`children`

### ToastDescription

`children`

### ToastIndicator

`children variant`

### ToastProvider

`children gap maxVisibleToasts placement queue renderToast scaleFactor width`

### ToastTitle

`children`

### Toolbar

`isAttached orientation`

### Tooltip

`autoFlip children closeDelay defaultOpen delay onOpenChange open placement showArrow sideOffset`

### TooltipArrow

`children`

### TooltipContent

`children`

### TooltipTrigger

`children`

### VideoPreview

`mirror muted stream`

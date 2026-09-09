import "./Popover.css";
import { Dynamic, type JSX, Portal } from "@solidjs/web";
import {
  createContext,
  createMemo,
  createSignal,
  createTrackedEffect,
  omit,
  onSettled,
  Show,
  useContext,
  type ValidComponent,
} from "solid-js";
import { twMerge } from "../../lib/twMerge";
import { registerOverlay } from "../../lib/overlay";

import "../_shared/material.css";
import type { Layout } from "../../lib/layouts";
import { applyBooleanStateRequest } from "../_shared/controlledState";
import {
  createOverlayPosition,
  type OverlayAnchorRect,
  type OverlayPlacement,
} from "../_shared/overlayPosition";
import type { Material, UIBaseProps } from "../vocabulary";
import { asAriaName, resolvePopoverDialogName } from "./Popover.a11y";
import { CLASSES, componentRecipe } from "./Popover.recipe";

export type PopoverPlacement = OverlayPlacement;
export type PopoverAnchorRect = OverlayAnchorRect;
export type PopoverAnchor =
  | PopoverAnchorRect
  | (() => PopoverAnchorRect | undefined);

type PopoverContextValue = {
  isOpen: () => boolean;
  setIsOpen: (next: boolean, options?: { focusTrigger?: boolean }) => void;
  preferredPlacement: () => PopoverPlacement;
  placement: () => PopoverPlacement;
  setPlacement: (next: PopoverPlacement) => void;
  autoFlip: () => boolean;
  anchorRect: () => PopoverAnchorRect | undefined;
  triggerRef: () => HTMLElement | undefined;
  setTriggerRef: (el: HTMLElement) => void;
  contentRef: () => HTMLElement | undefined;
  setContentRef: (el: HTMLElement) => void;
  triggerId: () => string;
  contentId: () => string;
  offset: () => number;
  onInteractOutside?: (event: Event) => void;
  /*
   * What `Popover.Dialog` was told to call the dialog.
   *
   * `role="dialog"` is on `Popover.Content`, because the content is the
   * portalled overlay and `Popover.Dialog` is an optional panel inside it. So
   * an `aria-label` written on `Popover.Dialog`, which is where a reader
   * expects to name a dialog, landed on a generic inside the dialog and named
   * nothing. Every popover dialog in the fleet was anonymous for that reason.
   *
   * The label travels up rather than the role travelling down: moving
   * `role="dialog"` to `Popover.Dialog` would leave a popover written without
   * one with no dialog at all, and would make two dialogs of a popover written
   * with two panels.
   */
  dialogLabel: () => string | undefined;
  setDialogLabel: (next: string | undefined) => void;
  dialogLabelledBy: () => string | undefined;
  setDialogLabelledBy: (next: string | undefined) => void;
};

const PopoverContext = createContext<PopoverContextValue | null>(null);

const usePopoverContext = () => {
  const ctx = useContext(PopoverContext);
  if (!ctx)
    throw new Error(
      "Popover compound components must be used within <Popover>",
    );
  return ctx;
};

export type PopoverRootProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
    open?: boolean;
    defaultOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    placement?: PopoverPlacement;
    autoFlip?: boolean;
    offset?: number;
    anchorRect?: PopoverAnchor;
    closeOnOutsideClick?: boolean;
    closeOnEscape?: boolean;
    onInteractOutside?: (event: Event) => void;
  };

const PopoverRoot: Layout<typeof componentRecipe, PopoverRootProps> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "open",
    "defaultOpen",
    "onOpenChange",
    "placement",
    "autoFlip",
    "offset",
    "anchorRect",
    "closeOnOutsideClick",
    "closeOnEscape",
    "onInteractOutside",
  );

  const [internalOpen, setInternalOpen] = createSignal(
    Boolean(props.defaultOpen),
  );
  const [triggerRef, setTriggerRef] = createSignal<HTMLElement | undefined>();
  const [contentRef, setContentRef] = createSignal<HTMLElement | undefined>();
  const [triggerId] = createSignal(
    `popover-trigger-${Math.random().toString(36).slice(2, 8)}`,
  );
  const [contentId] = createSignal(
    `popover-content-${Math.random().toString(36).slice(2, 8)}`,
  );
  const [resolvedPlacement, setResolvedPlacement] =
    createSignal<PopoverPlacement>(props.placement ?? "bottom");
  const [dialogLabel, setDialogLabel] = createSignal<string | undefined>();
  const [dialogLabelledBy, setDialogLabelledBy] = createSignal<
    string | undefined
  >();

  const isControlled = createMemo(() => props.open !== undefined);
  const isOpen = createMemo(() =>
    isControlled() ? Boolean(props.open) : internalOpen(),
  );

  const setIsOpen = (next: boolean, options?: { focusTrigger?: boolean }) => {
    applyBooleanStateRequest({
      current: isOpen(),
      next,
      controlled: isControlled(),
      setInternal: setInternalOpen,
      onChange: props.onOpenChange,
    });
    if (!next && options?.focusTrigger) {
      triggerRef()?.focus();
    }
  };

  const preferredPlacement = () => props.placement ?? "bottom";
  const placement = () => resolvedPlacement();
  const offset = () => props.offset ?? 8;
  const autoFlip = () => props.autoFlip ?? true;
  const anchorRect = () =>
    typeof props.anchorRect === "function"
      ? props.anchorRect()
      : props.anchorRect;

  onSettled(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!isOpen()) return;
      if (props.closeOnOutsideClick === false) return;
      const content = contentRef();
      const trigger = triggerRef();
      if (content?.contains(event.target as Node)) return;
      if (trigger?.contains(event.target as Node)) return;
      props.onInteractOutside?.(event);
      setIsOpen(false, { focusTrigger: false });
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  });

  /*
   * Registered on the shared stack when this popover opens, and released when
   * it closes -- which matters most for this component, because a popover is
   * the thing typically opened *inside* a dialog or drawer.
   *
   * In an effect keyed on `isOpen`, not in the setup above. Registering once at
   * mount put mount order into a stack whose whole job is open order: two
   * popovers on a page, open the second and then the first, and Escape reached
   * the second, because that is the one that happened to mount last. Being
   * skipped while closed was not enough; among the open ones the ranking was
   * still wrong.
   *
   * No `trapFocusIn`: a popover is not modal and does not take the keyboard
   * away from the page behind it.
   *
   * `dismissable` is read at dismiss time rather than captured, so toggling
   * `closeOnEscape` while open is honoured.
   */
  createTrackedEffect(() => {
    if (!isOpen()) return;
    const releaseOverlay = registerOverlay({
      dismissable: () => props.closeOnEscape !== false,
      dismiss: () => setIsOpen(false, { focusTrigger: true }),
      /*
       * Not modal -- a popover does not take the keyboard away from the page --
       * but its content still joins the focus scope of whatever it was opened
       * from.
       *
       * Without this, a popover opened inside a Dialog was the top of the stack
       * and declared no scope, so Tab did nothing and focus escaped to the page
       * behind a dialog that was still open. Naming the content is what lets
       * the dialog keep containing focus *and* lets Tab reach the popover.
       */
      element: () => contentRef() ?? undefined,
    });
    return () => {
      releaseOverlay();
    };
  });

  const ctx: PopoverContextValue = {
    isOpen,
    setIsOpen,
    preferredPlacement,
    placement,
    setPlacement: setResolvedPlacement,
    autoFlip,
    anchorRect,
    triggerRef,
    setTriggerRef,
    contentRef,
    setContentRef,
    triggerId,
    contentId,
    offset,
    onInteractOutside: props.onInteractOutside,
    dialogLabel,
    setDialogLabel,
    dialogLabelledBy,
    setDialogLabelledBy,
  };

  return (
    <PopoverContext value={ctx}>
      <div
        {...others}
        {...{ class: twMerge(CLASSES.slot.root, props.class) }}
        data-slot="popover-root"
        data-theme={props.dataTheme}
        style={props.style}
      >
        {props.children}
      </div>
    </PopoverContext>
  );
};

export type PopoverTriggerProps = UIBaseProps &
  Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
    children: JSX.Element;
    /**
     * The component to be the trigger, instead of a bare button.
     *
     * `Popover.Trigger` renders a `button`, which is right when the trigger is
     * a word or a glyph. It is wrong when the call site hands it a control:
     * `<Popover.Trigger><Button>Filters</Button></Popover.Trigger>` emitted a
     * second, anonymous button wrapping the named one at identical
     * coordinates. Found on three separate sites. Nested interactive content
     * is invalid HTML, and a press by coordinate lands on the anonymous outer
     * one rather than on the control that was written.
     *
     * `as` makes the control *be* the trigger, so there is one element:
     *
     * ```tsx
     * <Popover.Trigger as={Button} flavor="primary">Filters</Popover.Trigger>
     * ```
     *
     * The wiring -- id, `aria-haspopup`, `aria-expanded`, `aria-controls`, the
     * ref and both handlers -- goes to the delegate, and anything else written
     * here goes with it. The trigger's own class is a button reset and is
     * dropped, because a control does not want one; so is
     * `data-slot="popover-trigger"`, since the delegate's recipe owns that
     * attribute. Select the delegate's own slot, or `[aria-haspopup="dialog"]`.
     */
    as?: ValidComponent;
  };

const PopoverTrigger: Layout<
  typeof componentRecipe,
  PopoverTriggerProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "type",
    "onClick",
    "onKeyDown",
    "as",
  );

  const ctx = usePopoverContext();

  const handleClick: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> = (
    event,
  ) => {
    if (typeof props.onClick === "function") props.onClick(event);
    if (event.defaultPrevented) return;
    ctx.setIsOpen(!ctx.isOpen());
  };

  const handleKeyDown: JSX.EventHandlerUnion<
    HTMLButtonElement,
    KeyboardEvent
  > = (event) => {
    if (typeof props.onKeyDown === "function") props.onKeyDown(event);
    if (event.defaultPrevented) return;
    if (event.key === "Escape" && ctx.isOpen()) {
      event.preventDefault();
      ctx.setIsOpen(false, { focusTrigger: true });
    }
  };

  /*
   * The delegate branch is a `Dynamic`; the default branch stays a literal
   * `<button>`. Not symmetry for its own sake: `Button` already found that a
   * Dynamic string element paints correctly under Blitz and drops a nested
   * consumer's event binding, which on the element that opens the popover is
   * the whole component. A `Dynamic` over a *component* is the shape the
   * library already ships in Alert, Navbar and AvatarGroup.
   */
  return (
    <Show
      when={props.as}
      fallback={
        <button
          {...others}
          ref={(el) => ctx.setTriggerRef(el)}
          type={props.type ?? "button"}
          id={ctx.triggerId()}
          {...{ class: twMerge(CLASSES.slot.trigger, props.class) }}
          data-slot="popover-trigger"
          data-theme={props.dataTheme}
          style={props.style}
          aria-haspopup="dialog"
          aria-expanded={ctx.isOpen() ? "true" : "false"}
          aria-controls={ctx.isOpen() ? ctx.contentId() : undefined}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {props.children}
        </button>
      }
    >
      <Dynamic
        component={props.as as ValidComponent}
        {...others}
        ref={(el: HTMLElement) => ctx.setTriggerRef(el)}
        type={props.type ?? "button"}
        id={ctx.triggerId()}
        class={props.class}
        data-theme={props.dataTheme}
        style={props.style}
        aria-haspopup="dialog"
        aria-expanded={ctx.isOpen() ? "true" : "false"}
        aria-controls={ctx.isOpen() ? ctx.contentId() : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {props.children}
      </Dynamic>
    </Show>
  );
};

export type PopoverContentProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
    sideOffset?: number;
    /** What the panel is made of. `solid` by default. */
    material?: Material;
  };

const PopoverContent: Layout<
  typeof componentRecipe,
  PopoverContentProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "sideOffset",
    "material",
  );

  const ctx = usePopoverContext();
  const overlayPosition = createOverlayPosition({
    open: ctx.isOpen,
    triggerRef: ctx.triggerRef,
    anchorRect: ctx.anchorRect,
    overlayRef: ctx.contentRef,
    placement: ctx.preferredPlacement,
    offset: () => props.sideOffset ?? ctx.offset(),
    autoFlip: ctx.autoFlip,
    align: () => "center",
  });

  createTrackedEffect(() => {
    ctx.setPlacement(overlayPosition.placement());
  });

  const dialogName = () =>
    resolvePopoverDialogName({
      contentLabel: asAriaName(props["aria-label"]),
      contentLabelledBy: asAriaName(props["aria-labelledby"]),
      dialogLabel: ctx.dialogLabel(),
      dialogLabelledBy: ctx.dialogLabelledBy(),
      triggerId: ctx.triggerRef() ? ctx.triggerId() : undefined,
    });

  const style = () => {
    const overlayStyle = overlayPosition.style();

    if (typeof props.style === "string") {
      return [
        props.style,
        Object.entries(overlayStyle)
          .map(([key, value]) => `${key}: ${String(value)}`)
          .join("; "),
      ]
        .filter(Boolean)
        .join("; ");
    }

    return {
      ...(props.style ?? {}),
      ...overlayStyle,
    } as JSX.CSSProperties;
  };

  return (
    <Show when={ctx.isOpen()}>
      <Portal>
        <div
          {...others}
          ref={(el) => ctx.setContentRef(el)}
          id={ctx.contentId()}
          role="dialog"
          {...{ class: twMerge(CLASSES.base, props.class) }}
          data-slot="popover-content"
          data-material={props.material ?? "solid"}
          data-material-explicit={props.material ? "" : undefined}
          data-open={ctx.isOpen() ? "true" : "false"}
          data-placement={ctx.placement()}
          data-theme={props.dataTheme}
          style={style()}
          aria-label={dialogName()["aria-label"]}
          aria-labelledby={dialogName()["aria-labelledby"]}
          aria-hidden={ctx.isOpen() ? "false" : "true"}
        >
          {props.children}
        </div>
      </Portal>
    </Show>
  );
};

export type PopoverDialogProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverDialog: Layout<
  typeof componentRecipe,
  PopoverDialogProps
> = () => {
  const others = omit(
    props,
    "children",
    "class",
    "dataTheme",
    "style",
    "aria-label",
    "aria-labelledby",
  );

  const ctx = usePopoverContext();

  /*
   * The name is handed to the node that carries `role="dialog"` rather than
   * written here, and is withdrawn when this panel unmounts so a popover
   * reopened without one is not still wearing the last one.
   *
   * Both attributes are removed from the passthrough above: repeating them on
   * this generic would name an element nothing addresses, and would make a
   * screen reader announce the name twice inside the dialog it already names.
   */
  createTrackedEffect(() => {
    ctx.setDialogLabel(asAriaName(props["aria-label"]));
    return () => ctx.setDialogLabel(undefined);
  });

  createTrackedEffect(() => {
    ctx.setDialogLabelledBy(asAriaName(props["aria-labelledby"]));
    return () => ctx.setDialogLabelledBy(undefined);
  });

  return (
    <div
      {...others}
      {...{ class: twMerge(CLASSES.slot.dialog, props.class) }}
      data-slot="popover-dialog"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </div>
  );
};

export type PopoverArrowProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> & {
    children?: JSX.Element;
  };

const PopoverArrow: Layout<typeof componentRecipe, PopoverArrowProps> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  const ctx = usePopoverContext();

  const defaultArrow = (
    <svg
      aria-hidden="true"
      data-slot="popover-arrow-svg"
      height="12"
      viewBox="0 0 12 12"
      width="12"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 0C5.48483 8 6.5 8 12 0Z"
        fill="currentColor"
      />
    </svg>
  );

  return (
    <span
      {...others}
      {...{ class: twMerge(CLASSES.slot.arrow, props.class) }}
      data-slot="popover-arrow"
      data-placement={ctx.placement()}
      data-theme={props.dataTheme}
      style={props.style}
      aria-hidden="true"
    >
      {props.children ?? defaultArrow}
    </span>
  );
};

export type PopoverHeadingProps = UIBaseProps &
  Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children"> & {
    children: JSX.Element;
  };

const PopoverHeading: Layout<
  typeof componentRecipe,
  PopoverHeadingProps
> = () => {
  const others = omit(props, "children", "class", "dataTheme", "style");

  return (
    <h3
      {...others}
      {...{ class: twMerge(CLASSES.slot.heading, props.class) }}
      data-slot="popover-heading"
      data-theme={props.dataTheme}
      style={props.style}
    >
      {props.children}
    </h3>
  );
};

const Popover = Object.assign(PopoverRoot, {
  Root: PopoverRoot,
  Trigger: PopoverTrigger,
  Content: PopoverContent,
  Dialog: PopoverDialog,
  Arrow: PopoverArrow,
  Heading: PopoverHeading,
});

export default Popover;
export {
  PopoverArrow,
  PopoverContent,
  PopoverDialog,
  PopoverHeading,
  PopoverRoot,
  PopoverTrigger,
};

/**
 * Which name reaches the node that carries `role="dialog"`.
 *
 * `role="dialog"` is on `Popover.Content`, because the content is the
 * portalled overlay and `Popover.Dialog` is an optional panel inside it. A
 * reader naming a dialog writes `aria-label` on `Popover.Dialog`, which is the
 * part called Dialog, so the name landed on a generic inside the dialog and
 * named nothing at all. Measured on two sites: every popover dialog in the
 * fleet was anonymous.
 *
 * The name travels up to the role rather than the role travelling down to the
 * name. Moving `role="dialog"` onto `Popover.Dialog` would leave a popover
 * written without one with no dialog, and would make two dialogs of a popover
 * written with two panels.
 *
 * `aria-labelledby` outranks `aria-label` in the accessible name calculation,
 * so a supplied name has to *replace* the fallback reference to the trigger
 * rather than sit beside it. Leaving both would keep the dialog named after
 * the button that opened it while the author's own name was ignored, which is
 * the same silent failure in a new place.
 */
export type PopoverDialogNameInput = {
  /** `aria-label` written on `Popover.Content` itself. Outranks everything. */
  contentLabel?: string;
  /** `aria-labelledby` written on `Popover.Content` itself. */
  contentLabelledBy?: string;
  /** `aria-label` written on a `Popover.Dialog` inside the content. */
  dialogLabel?: string;
  /** `aria-labelledby` written on a `Popover.Dialog` inside the content. */
  dialogLabelledBy?: string;
  /** The trigger's id, used only when nothing else names the dialog. */
  triggerId?: string;
};

export type PopoverDialogName = {
  "aria-label": string | undefined;
  "aria-labelledby": string | undefined;
};

/**
 * An ARIA attribute value as a name, or nothing.
 *
 * Solid types every `aria-*` attribute as `string | RemoveAttribute`, where the
 * second member is `false` and means "do not emit this". A name is only ever
 * the first, and the second has to become `undefined` before it can be
 * compared, stored or handed to another element.
 */
export const asAriaName = (value: unknown): string | undefined =>
  typeof value === "string" ? value : undefined;

const firstNonEmpty = (...values: (string | undefined)[]) =>
  values.find((value) => value !== undefined && value !== "");

export const resolvePopoverDialogName = (
  input: PopoverDialogNameInput,
): PopoverDialogName => {
  const labelledBy = firstNonEmpty(
    input.contentLabelledBy,
    input.dialogLabelledBy,
  );
  const label = firstNonEmpty(input.contentLabel, input.dialogLabel);

  // A reference wins outright: it is the stronger of the two and the author
  // wrote it on purpose.
  if (labelledBy !== undefined) {
    return { "aria-label": undefined, "aria-labelledby": labelledBy };
  }

  // A name replaces the trigger fallback rather than competing with it.
  if (label !== undefined) {
    return { "aria-label": label, "aria-labelledby": undefined };
  }

  return {
    "aria-label": undefined,
    "aria-labelledby": firstNonEmpty(input.triggerId),
  };
};

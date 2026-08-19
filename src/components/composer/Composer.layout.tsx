import "./Composer.css";
import type { JSX } from "@solidjs/web";
import {For, Show, createSignal, createTrackedEffect, onSettled} from "solid-js";
import type { Layout } from "../../lib/layouts";
import type {
  ChangeReason,
  Issue,
  Radius,
  Size,
  State,
  UIBaseProps,
  Variant,
} from "../vocabulary";
import { isInvalid, resolveState } from "../vocabulary";
import { composer } from "./Composer.recipe";
import {
  afterValueLands,
  autosize,
  boundsFromRows,
  isSubmittable,
  newAutosizeMemo,
  shouldSubmit,
  viewportHeight,
} from "./Composer.interactions";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type ComposerProps = Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange" | "onSubmit" | "children"
> &
  UIBaseProps & {
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

/* -------------------------------------------------------------------------------------------------
 * Composer
 *
 * Uncontrolled until given a `value`, because a draft is the one piece of state
 * a chat surface usually wants to own — it has to survive an unmount when the
 * user changes tab, and that lives above this component or not at all.
 * -----------------------------------------------------------------------------------------------*/
export const ComposerLayout: Layout<typeof composer, ComposerProps> = () => {
  const [internal, setInternal] = createSignal(local.defaultValue ?? "");
  const value = () => local.value ?? internal();
  const busy = () => local.state === "loading" || local.state === "disabled";
  const state = () => resolveState(local.state, local.issues);

  let field: HTMLTextAreaElement | undefined;
  const memo = newAutosizeMemo();

  const measure = () => {
    if (!field) return;
    const bounds = boundsFromRows(
      local.minRows ?? 1,
      local.maxRows ?? 8,
      viewportHeight(local.viewportHeight),
    );
    local.onHeightChange?.(autosize(field, bounds, memo));
  };

  onSettled(() => {
    if (local.autofocus) field?.focus();
    measure();
  });

  // A controlled value can change without an input event — a draft restored on
  // returning to a tab. Measure that the same way as text typed into the field.
  createTrackedEffect(() => {
    value();
    measure();
  });

  const write = (next: string, reason: ChangeReason) => {
    if (local.value === undefined) setInternal(next);
    local.onChange?.(next, reason);
  };

  const submit = () => {
    if (busy()) return;
    const message = value().trim();
    if (!isSubmittable(message)) return;
    local.onSubmit?.(message);
    if (local.value === undefined) setInternal("");
  };

  return (
    <div {...slot.root} data-state={state()}>
      <textarea
        {...slot.field}
        ref={field}
        name={local.name}
        value={value()}
        rows={local.minRows ?? 1}
        placeholder={local.placeholder}
        disabled={local.state === "disabled"}
        aria-invalid={isInvalid(local.issues) ? "true" : undefined}
        onInput={(event) => {
          write(event.currentTarget.value, "input");
          measure();
        }}
        onPaste={() => afterValueLands(measure)}
        onKeyDown={(event) => {
          if (!shouldSubmit(event, local.submitOnEnter !== false)) return;
          event.preventDefault();
          submit();
        }}
      />

      <div {...slot.toolbar}>
        <Show when={local.lead}>
          <span {...slot.lead}>{local.lead}</span>
        </Show>
        <Show when={local.hint}>
          <span {...slot.hint}>{local.hint}</span>
        </Show>
        <Show when={local.trail}>
          <span {...slot.trail}>{local.trail}</span>
        </Show>
        <button
          {...slot.submit}
          type="button"
          onClick={submit}
          disabled={busy() || !isSubmittable(value())}
          data-loading={local.state === "loading" ? "true" : "false"}
        >
          {local.submitLabel ?? "Send"}
        </button>
      </div>

      <Show when={local.issues?.length}>
        <ul {...slot.issues}>
          <For each={local.issues}>
            {(issue) => (
              <li data-severity={issue.severity ?? "error"}>{issue.message ?? issue.code}</li>
            )}
          </For>
        </ul>
      </Show>
    </div>
  );
};

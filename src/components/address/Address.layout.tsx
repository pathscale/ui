import "./Address.css";
import type { JSX } from "@solidjs/web";
import {Show, createSignal, onCleanup} from "solid-js";
import type { Layout } from "../../lib/layouts";
import type { Size, State, UIBaseProps } from "../vocabulary";
import { address } from "./Address.recipe";
import {
  copyAddress,
  scheduleCopyReset,
  truncateAddress,
  DEFAULT_LEAD,
  DEFAULT_TAIL,
} from "./Address.interactions";

/* -------------------------------------------------------------------------------------------------
 * Types
 * -----------------------------------------------------------------------------------------------*/
export type AddressTruncate = "middle" | "none";

export type AddressProps = Omit<JSX.HTMLAttributes<HTMLSpanElement>, "onCopy"> &
  UIBaseProps & {
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

/* -------------------------------------------------------------------------------------------------
 * Address
 *
 * The displayed text is short; the value is not. Everything that leaves this
 * component — the copy, the link, the `title` — carries the full address, so
 * the truncation is presentation and never data. That distinction is the whole
 * safety argument: a short form exists to be recognised, not to be used.
 * -----------------------------------------------------------------------------------------------*/
export const AddressLayout: Layout<typeof address, AddressProps> = () => {
  const [copied, setCopied] = createSignal(false);
  let cancel: (() => void) | undefined;
  onCleanup(() => cancel?.());

  const shown = () =>
    local.truncate === "none"
      ? local.value
      : truncateAddress(local.value, {
          lead: local.lead ?? DEFAULT_LEAD,
          tail: local.tail ?? DEFAULT_TAIL,
        });

  const copy = async () => {
    if (!(await copyAddress(local.value))) return;
    local.onCopy?.(local.value);
    setCopied(true);
    cancel?.();
    cancel = scheduleCopyReset(() => setCopied(false));
  };

  return (
    <span {...slot.root} data-state={local.state ?? "default"}>
      <span {...slot.value} title={local.value}>
        <Show when={local.name} fallback={shown()}>
          {local.name}
        </Show>
      </span>

      <Show when={local.copyable !== false}>
        <button
          {...slot.copy}
          type="button"
          onClick={copy}
          disabled={local.state === "disabled"}
          aria-label={copied() ? undefined : (local.copyLabel as string) ?? "Copy address"}
        >
          <Show when={copied()} fallback={local.copyLabel ?? "Copy"}>
            <span {...slot.feedback} role="status">
              {local.copiedLabel ?? "Copied"}
            </span>
          </Show>
        </button>
      </Show>

      <Show when={local.explorerUrl}>
        <a
          {...slot.link}
          href={local.explorerUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {local.explorerLabel ?? "View"}
        </a>
      </Show>
    </span>
  );
};

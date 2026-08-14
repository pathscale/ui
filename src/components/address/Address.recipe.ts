import { recipe } from "../../lib/layouts";

/**
 * A blockchain address, shown the way people actually read one.
 *
 * The survey found wallet addresses in two apps and a `truncateAddress` helper
 * living in one of them and nowhere else, which is the usual sign that a
 * component is missing rather than that the need is rare. Rendering the hex is
 * the easy part; what every call site rebuilds is the middle truncation, the
 * copy affordance and its confirmation, and the link out to an explorer.
 *
 * Deliberately not a form input. This displays an address someone already has;
 * entering one is `Input` with a validator.
 */
export const address = recipe({
  component: "address",
  element: "span",
  slots: {
    root: { base: "address" },
    value: { base: "address__value" },
    copy: { base: "address__copy" },
    link: { base: "address__link" },
    feedback: { base: "address__feedback" },
  },
  props: {
    size: {
      xs: "address--xs",
      sm: "address--sm",
      md: "address--md",
      lg: "address--lg",
      xl: "address--xl",
    },
    state: {
      default: "",
      loading: "address--loading",
      error: "address--error",
      invalid: "address--invalid",
      disabled: "address--disabled",
      hidden: "address--hidden",
    },
    /** Monospace by default: hex is compared character by character. */
    font: {
      mono: "address--mono",
      inherit: "",
    },
  },
  defaults: { size: "md", state: "default", font: "mono" },
});

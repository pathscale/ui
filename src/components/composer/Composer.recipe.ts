import { recipe } from "../../lib/layouts";

/**
 * The box you type a message into.
 *
 * Not a `Textarea` with a button beside it. What every chat surface rebuilds is
 * the behaviour: send on Enter and newline on Shift+Enter without breaking IME
 * composition, grow with the content up to a ceiling and then scroll, refuse to
 * send whitespace or to send twice while a send is in flight, and tell whatever
 * is scrolling above it that the box changed height.
 *
 * The survey found one built and tested implementation, in agencyzero, and
 * eight repositories hand-rolling Enter handling. Usage said one site; the
 * roadmap says every site, because support.cafe chat is going on all of them.
 */
export const composer = recipe({
  component: "composer",
  element: "div",
  slots: {
    root: { base: "composer" },
    field: { base: "composer__field" },
    toolbar: { base: "composer__toolbar" },
    lead: { base: "composer__lead" },
    trail: { base: "composer__trail" },
    submit: { base: "composer__submit" },
    hint: { base: "composer__hint" },
    issues: { base: "composer__issues" },
  },
  props: {
    size: {
      xs: "composer--xs",
      sm: "composer--sm",
      md: "composer--md",
      lg: "composer--lg",
      xl: "composer--xl",
    },
    variant: {
      solid: "composer--solid",
      soft: "composer--soft",
      outline: "composer--outline",
      ghost: "composer--ghost",
      plain: "composer--plain",
    },
    state: {
      default: "",
      loading: "composer--loading",
      error: "composer--error",
      invalid: "composer--invalid",
      disabled: "composer--disabled",
      hidden: "composer--hidden",
    },
    radius: {
      none: "composer--radius-none",
      sm: "composer--radius-sm",
      md: "composer--radius-md",
      lg: "composer--radius-lg",
      full: "composer--radius-full",
    },
  },
  defaults: { size: "md", variant: "outline", state: "default", radius: "lg" },
});

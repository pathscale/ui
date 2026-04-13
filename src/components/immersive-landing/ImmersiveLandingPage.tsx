import { splitProps, useContext, createMemo, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingPageProps } from "./types";
import { ImmersiveLandingContext } from "./ImmersiveLandingContext";
import { CLASSES } from "./ImmersiveLanding.classes";

const ImmersiveLandingPage = (props: ImmersiveLandingPageProps): JSX.Element => {
  const [local, others] = splitProps(props, ["id", "children", "class", "className", "style"]);

  const context = useContext(ImmersiveLandingContext);

  const isActive = createMemo(() => context?.activePage() === local.id);
  const fadeDurationMs = 200;

  const classes = () =>
    twMerge(
      CLASSES.page.base,
      isActive() ? CLASSES.page.active : CLASSES.page.inactive,
      local.class,
      local.className,
    );

  return (
    <section
      id={local.id}
      role="region"
      aria-label={`${local.id} section`}
      class={classes()}
      style={{
        "transition-duration": `${fadeDurationMs}ms`,
        "transition-delay": isActive() ? `${fadeDurationMs}ms` : "0ms",
        ...local.style,
      }}
      aria-hidden={!isActive()}
      {...others}
    >
      <div class={CLASSES.page.content}>{local.children}</div>
    </section>
  );
};

export default ImmersiveLandingPage;

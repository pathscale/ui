import { splitProps, useContext, createMemo, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import type { ImmersiveLandingPageProps } from "./types";
import { ImmersiveLandingContext } from "./ImmersiveLandingContext";

const ImmersiveLandingPage = (props: ImmersiveLandingPageProps): JSX.Element => {
  const [local, others] = splitProps(props, ["id", "children", "class", "className", "style"]);

  const context = useContext(ImmersiveLandingContext);

  const isActive = createMemo(() => context?.activePage() === local.id);
  const fadeDurationMs = 200;

  const classes = () =>
    twMerge(
      "absolute inset-0 h-full w-full overflow-hidden bg-transparent transition-opacity ease-in-out",
      isActive() ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
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
      <div class="relative z-10 h-full">{local.children}</div>
    </section>
  );
};

export default ImmersiveLandingPage;

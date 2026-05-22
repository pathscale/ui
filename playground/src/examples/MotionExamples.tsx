/**
 * MotionExamples.tsx — playground demos for motion primitives.
 *
 * Showcases:
 *   - Presence: orchestrate enter/exit animation for conditional content.
 *   - AnimatedCollapse: smoothly open/close measured-height panels.
 *
 * The default motion driver is the immediate driver (jumps to final state
 * with no interpolation). To see actual animation, enable popmotion once at
 * module load.
 */
import { createSignal, For } from "solid-js";
import { animate } from "popmotion";
import {
  AnimatedCollapse,
  Button,
  Card,
  enablePopmotion,
  MotionDiv,
  Presence,
} from "@pathscale/ui";

enablePopmotion(({ from, to, duration, ease, onUpdate, onComplete }) =>
  animate({
    from,
    to,
    duration,
    ease,
    onUpdate,
    onComplete,
  }),
);

const PresenceAlertDemo = () => {
  const [visible, setVisible] = createSignal(false);
  return (
    <div class="flex flex-col gap-3">
      <Button onClick={() => setVisible((v) => !v)}>
        {visible() ? "Dismiss alert" : "Show alert"}
      </Button>
      <Presence when={visible()}>
        {(isExiting, onExitComplete) => (
          <MotionDiv
            isExiting={isExiting()}
            onExitComplete={onExitComplete}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, easing: "ease-out" }}
            class="rounded border border-warning bg-warning/10 px-4 py-3 text-sm text-warning-content"
          >
            Heads up — this alert mounts and unmounts with a real exit.
          </MotionDiv>
        )}
      </Presence>
    </div>
  );
};

const PresenceStepSwapDemo = () => {
  const [step, setStep] = createSignal<"a" | "b" | "c">("a");
  const next = () =>
    setStep((s) => (s === "a" ? "b" : s === "b" ? "c" : "a"));
  const label = (id: "a" | "b" | "c") =>
    ({ a: "Sign in", b: "Two-factor", c: "Welcome" })[id];

  return (
    <div class="flex flex-col gap-3">
      <Button onClick={next}>Next step</Button>
      <div class="relative min-h-24 rounded border border-base-300 bg-base-200/40 p-4">
        <For each={["a", "b", "c"] as const}>
          {(id) => (
            <Presence when={step() === id}>
              {(isExiting, onExitComplete) => (
                <MotionDiv
                  isExiting={isExiting()}
                  onExitComplete={onExitComplete}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2, easing: "ease-out" }}
                  class="text-base"
                >
                  Step: {label(id)}
                </MotionDiv>
              )}
            </Presence>
          )}
        </For>
      </div>
    </div>
  );
};

const PresenceConditionalCardDemo = () => {
  const [show, setShow] = createSignal(true);
  return (
    <div class="flex flex-col gap-3">
      <Button onClick={() => setShow((v) => !v)}>
        {show() ? "Hide card" : "Show card"}
      </Button>
      <Presence when={show()}>
        {(isExiting, onExitComplete) => (
          <MotionDiv
            isExiting={isExiting()}
            onExitComplete={onExitComplete}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.24, easing: "ease-out" }}
          >
            <Card class="bg-base-100">
              <Card.Body>
                <h4 class="text-base font-semibold">Conditional card</h4>
                <p class="text-sm text-base-content/80">
                  Conditional content keeps its mount through the exit
                  animation.
                </p>
              </Card.Body>
            </Card>
          </MotionDiv>
        )}
      </Presence>
    </div>
  );
};

const CollapseAccordionDemo = () => {
  const [open, setOpen] = createSignal(false);
  return (
    <div class="flex flex-col gap-3">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        {open() ? "Collapse section" : "Expand section"}
      </Button>
      <AnimatedCollapse
        open={open()}
        class="rounded border border-base-300 bg-base-200/40"
        contentClass="px-4 py-3 text-sm"
      >
        <p>
          This panel uses a measured height animation. Multiple lines of
          content collapse and expand smoothly without layout jitter.
        </p>
        <p class="mt-2 text-base-content/70">
          Reduced motion preference is honored — when set, the panel snaps
          open/closed instantly.
        </p>
      </AnimatedCollapse>
    </div>
  );
};

const CollapseDetailsDemo = () => {
  const [open, setOpen] = createSignal(false);
  return (
    <div class="flex flex-col gap-3">
      <Button variant="ghost" onClick={() => setOpen((v) => !v)}>
        {open() ? "Hide details" : "Show details"}
      </Button>
      <AnimatedCollapse
        open={open()}
        unmountOnExit
        class="rounded border border-base-300"
        contentClass="px-4 py-3 text-sm"
      >
        <div class="grid grid-cols-2 gap-2">
          <span class="text-base-content/60">ID</span>
          <span class="font-mono">usr_01HZ</span>
          <span class="text-base-content/60">Created</span>
          <span>2026-05-21</span>
          <span class="text-base-content/60">Role</span>
          <span>Admin</span>
        </div>
      </AnimatedCollapse>
    </div>
  );
};

const CollapseDynamicHeightDemo = () => {
  const [open, setOpen] = createSignal(true);
  const [items, setItems] = createSignal(["Apple", "Banana"]);
  const addItem = () =>
    setItems((list) => [...list, `Item ${list.length + 1}`]);
  return (
    <div class="flex flex-col gap-3">
      <div class="flex gap-2">
        <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
          {open() ? "Close" : "Open"}
        </Button>
        <Button variant="ghost" size="sm" onClick={addItem}>
          Add item
        </Button>
      </div>
      <AnimatedCollapse
        open={open()}
        class="rounded border border-base-300 bg-base-200/40"
        contentClass="px-4 py-3 text-sm"
      >
        <ul class="list-disc pl-5">
          <For each={items()}>{(item) => <li>{item}</li>}</For>
        </ul>
      </AnimatedCollapse>
    </div>
  );
};

export const MotionExamples = () => {
  return (
    <section class="flex flex-col gap-8 py-12">
      <header>
        <h2 class="text-2xl font-semibold">Motion primitives</h2>
        <p class="text-sm text-base-content/70">
          Presence and AnimatedCollapse demos. Popmotion is enabled inline so
          you can see real transitions.
        </p>
      </header>

      <div class="grid gap-6 md:grid-cols-3">
        <div>
          <h3 class="mb-2 text-sm font-semibold uppercase text-base-content/60">
            Presence: alert
          </h3>
          <PresenceAlertDemo />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-semibold uppercase text-base-content/60">
            Presence: step swap
          </h3>
          <PresenceStepSwapDemo />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-semibold uppercase text-base-content/60">
            Presence: conditional card
          </h3>
          <PresenceConditionalCardDemo />
        </div>
      </div>

      <div class="grid gap-6 md:grid-cols-3">
        <div>
          <h3 class="mb-2 text-sm font-semibold uppercase text-base-content/60">
            Collapse: accordion section
          </h3>
          <CollapseAccordionDemo />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-semibold uppercase text-base-content/60">
            Collapse: details panel
          </h3>
          <CollapseDetailsDemo />
        </div>
        <div>
          <h3 class="mb-2 text-sm font-semibold uppercase text-base-content/60">
            Collapse: dynamic content height
          </h3>
          <CollapseDynamicHeightDemo />
        </div>
      </div>
    </section>
  );
};

export default MotionExamples;

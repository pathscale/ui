import type { Component } from "solid-js";
import { createSignal } from "solid-js";
import Accordion from "./Accordion";
import Join from "../join";

const AccordionShowcase: Component = () => {
  // For controlled accordion example
  const [isExpanded, setIsExpanded] = createSignal(false);
  const toggleAccordion = () => setIsExpanded(!isExpanded());

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Checkbox Accordion (Multiple can be open)
        </h2>
        <div class="space-y-2">
          <Accordion icon="plus" mode="checkbox">
            <Accordion.Title>Is it mobile-friendly?</Accordion.Title>
            <Accordion.Content>
              Yes, DaisyUI is responsive and supports Tailwind breakpoints.
            </Accordion.Content>
          </Accordion>
          <Accordion icon="plus" mode="checkbox">
            <Accordion.Title>Can I customize the theme?</Accordion.Title>
            <Accordion.Content>
              Yes, DaisyUI integrates with Tailwind's theming system.
            </Accordion.Content>
          </Accordion>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Controlled Accordion
        </h2>
        <div class="space-y-4">
          <button class="btn btn-primary" onClick={toggleAccordion}>
            {isExpanded() ? "Collapse" : "Expand"} Accordion
          </button>

          <Accordion
            icon="arrow"
            mode="controlled"
            expanded={isExpanded()}
            onToggle={toggleAccordion}
            class="bg-base-100 border border-base-300"
          >
            <Accordion.Title class="font-semibold">
              Controlled Accordion
            </Accordion.Title>
            <Accordion.Content class="text-sm">
              This accordion is controlled programmatically. You can expand or
              collapse it using the button above or by clicking on the accordion
              itself.
            </Accordion.Content>
          </Accordion>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Joined Accordion Items
        </h2>
        <Join vertical class="bg-base-100 w-full">
          <Accordion
            icon="plus"
            mode="checkbox"
            class="join-item border border-base-300"
          >
            <Accordion.Title class="font-semibold">
              How do I create an account?
            </Accordion.Title>
            <Accordion.Content class="text-sm">
              Click the "Sign Up" button in the top right corner and follow the
              registration process.
            </Accordion.Content>
          </Accordion>
          <Accordion
            icon="plus"
            mode="checkbox"
            class="join-item border border-base-300"
          >
            <Accordion.Title class="font-semibold">
              I forgot my password. What should I do?
            </Accordion.Title>
            <Accordion.Content class="text-sm">
              Click on "Forgot Password" on the login page and follow the
              instructions sent to your email.
            </Accordion.Content>
          </Accordion>
          <Accordion
            icon="plus"
            mode="checkbox"
            class="join-item border border-base-300"
          >
            <Accordion.Title class="font-semibold">
              How do I update my profile?
            </Accordion.Title>
            <Accordion.Content class="text-sm">
              Go to "My Account" settings and select "Edit Profile" to make
              changes.
            </Accordion.Content>
          </Accordion>
        </Join>
      </section>
    </div>
  );
};

export default AccordionShowcase;

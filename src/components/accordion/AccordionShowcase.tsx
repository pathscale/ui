import type { Component } from "solid-js";
import Accordion from "./Accordion";

const AccordionShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Accordion (Arrow Icon)
        </h2>
        <div class="space-y-2">
          <Accordion icon="arrow" name="faq">
            <Accordion.Title>What is SolidJS?</Accordion.Title>
            <Accordion.Content>
              SolidJS is a declarative UI library.
            </Accordion.Content>
          </Accordion>
          <Accordion icon="arrow" name="faq">
            <Accordion.Title>Why use DaisyUI?</Accordion.Title>
            <Accordion.Content>
              Because it offers utility-based styling with a clean design.
            </Accordion.Content>
          </Accordion>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Accordion (Plus Icon)
        </h2>
        <div class="space-y-2">
          <Accordion icon="plus" name="features">
            <Accordion.Title>Is it mobile-friendly?</Accordion.Title>
            <Accordion.Content>
              Yes, DaisyUI is responsive and supports Tailwind breakpoints.
            </Accordion.Content>
          </Accordion>
          <Accordion icon="plus" name="features">
            <Accordion.Title>Can I customize the theme?</Accordion.Title>
            <Accordion.Content>
              Yes, DaisyUI integrates with Tailwind's theming system.
            </Accordion.Content>
          </Accordion>
        </div>
      </section>
    </div>
  );
};

export default AccordionShowcase;

import { Component } from "solid-js";
import Button from "../button";
import ShowcaseBlock from "./ShowcaseBlock";
import Flex from "../flex";

const ShowcaseBlockShowcase: Component = () => {
  return (
    <Flex direction="col" gap="xl" class="p-8">
      <section>
        <h2 class="text-lg font-semibold border-b border-base-content/20 pb-2 mb-4 text-base-content">
          Basic ShowcaseBlock
        </h2>
        <ShowcaseBlock
          title="Basic Example"
          description="This is a basic example of a ShowcaseBlock component."
        >
          <p>This is the content of the ShowcaseBlock.</p>
        </ShowcaseBlock>
      </section>

      <section>
        <h2 class="text-lg font-semibold border-b border-base-content/20 pb-2 mb-4 text-base-content">
          With Preview
        </h2>
        <ShowcaseBlock
          title="Preview Example"
          description="This ShowcaseBlock has the preview prop set to true."
          preview
        >
          <Flex direction="col" align="center" justify="center" gap="md">
            <Button>Click Me</Button>
            <p>This content is displayed inside a preview container.</p>
          </Flex>
        </ShowcaseBlock>
      </section>

      <section>
        <h2 class="text-lg font-semibold border-b border-base-content/20 pb-2 mb-4 text-base-content">
          Custom Styles
        </h2>
        <ShowcaseBlock
          title="Custom Styles Example"
          description="This ShowcaseBlock has custom classes applied."
          class="p-2"
        >
          <p>Content with custom parent styles.</p>
        </ShowcaseBlock>
      </section>

      <section>
        <h2 class="text-lg font-semibold border-b border-base-content/20 pb-2 mb-4 text-base-content">
          With Different Theme
        </h2>
        <ShowcaseBlock
          title="Themed Example"
          description="This ShowcaseBlock uses a different theme."
          dataTheme="dark"
        >
          <p>This content is shown with the dark theme.</p>
        </ShowcaseBlock>
      </section>
    </Flex>
  );
};

export default ShowcaseBlockShowcase;

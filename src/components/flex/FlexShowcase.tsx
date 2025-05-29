import Flex from "./Flex";

export default function FlexShowcase() {
  return (
    <section class="space-y-6">
      <div class="bg-base-200 p-4 rounded">
        <h2 class="text-lg font-bold mb-2">Default Flex Row</h2>
        <Flex class="bg-base-100 p-2 rounded">
          <div class="bg-primary text-white p-2 rounded">Item 1</div>
          <div class="bg-secondary text-white p-2 rounded">Item 2</div>
          <div class="bg-accent text-white p-2 rounded">Item 3</div>
        </Flex>
      </div>

      <div class="bg-base-200 p-4 rounded">
        <h2 class="text-lg font-bold mb-2">Flex Column with Gap</h2>
        <Flex direction="col" gap="md" class="bg-base-100 p-2 rounded">
          <div class="bg-primary text-white p-2 rounded">Item 1</div>
          <div class="bg-secondary text-white p-2 rounded">Item 2</div>
          <div class="bg-accent text-white p-2 rounded">Item 3</div>
        </Flex>
      </div>

      <div class="bg-base-200 p-4 rounded">
        <h2 class="text-lg font-bold mb-2">Justify and Align</h2>
        <Flex
          justify="between"
          align="center"
          class="bg-base-100 p-2 rounded h-24"
        >
          <div class="bg-primary text-white p-2 rounded">Start</div>
          <div class="bg-secondary text-white p-2 rounded">End</div>
        </Flex>
      </div>

      <div class="bg-base-200 p-4 rounded">
        <h2 class="text-lg font-bold mb-2">Flex Wrap</h2>
        <Flex wrap="wrap" gap="sm" class="bg-base-100 p-2 rounded">
          {Array.from({ length: 10 }).map((_, i) => (
            <div class="bg-primary text-white p-2 rounded w-24 text-center">
              Item {i + 1}
            </div>
          ))}
        </Flex>
      </div>
    </section>
  );
}

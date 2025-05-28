import Flex from "./Flex";

export default function FlexShowcase() {
  return (
    <section class="space-y-8 p-6">
      <div>
        <h3 class="text-lg font-semibold mb-2">Row direction with gap</h3>
        <Flex direction="row" gap="md" class="bg-base-200 p-4 rounded">
          <Box>Item 1</Box>
          <Box>Item 2</Box>
          <Box>Item 3</Box>
        </Flex>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-2">Column direction, centered</h3>
        <Flex
          direction="col"
          justify="center"
          align="center"
          gap="sm"
          class="bg-base-200 p-4 rounded h-64"
        >
          <Box>Item A</Box>
          <Box>Item B</Box>
        </Flex>
      </div>

      <div>
        <h3 class="text-lg font-semibold mb-2">Wrap and gap</h3>
        <Flex wrap="wrap" gap="lg" class="bg-base-200 p-4 rounded">
          {Array.from({ length: 6 }).map((_, i) => (
            <Box>{`Item ${i + 1}`}</Box>
          ))}
        </Flex>
      </div>
    </section>
  );
}

function Box(props: { children: string }) {
  return (
    <div class="bg-primary text-primary-content px-4 py-2 rounded shadow text-sm">
      {props.children}
    </div>
  );
}

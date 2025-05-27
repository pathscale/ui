import Kbd from "./Kbd";

const KbdShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Kbd>A</Kbd>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">In Text</h2>
        <p class="font-sans text-sm">
          Press <Kbd>F</Kbd> to pay respects.
        </p>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Key Combination
        </h2>
        <div class="text-sm">
          <Kbd>ctrl</Kbd> + <Kbd>shift</Kbd> + <Kbd>del</Kbd>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Function Keys</h2>
        <div class="flex gap-2 text-sm">
          <Kbd>⌘</Kbd>
          <Kbd>⌥</Kbd>
          <Kbd>⇧</Kbd>
          <Kbd>⌃</Kbd>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Full Keyboard</h2>
        <div class="overflow-x-auto text-sm">
          <div class="flex justify-center gap-1">
            {"qwertyuiop".split("").map((key) => (
              <Kbd>{key}</Kbd>
            ))}
          </div>
          <div class="flex justify-center gap-1 my-1">
            {"asdfghjkl".split("").map((key) => (
              <Kbd>{key}</Kbd>
            ))}
          </div>
          <div class="flex justify-center gap-1 my-1">
            {"zxcvbnm/".split("").map((key) => (
              <Kbd>{key}</Kbd>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Arrow Keys</h2>
        <div class="space-y-4 text-sm">
          <div class="flex justify-center">
            <Kbd>▲</Kbd>
          </div>
          <div class="flex justify-center gap-12">
            <Kbd>◀︎</Kbd>
            <Kbd>▶︎</Kbd>
          </div>
          <div class="flex justify-center">
            <Kbd>▼</Kbd>
          </div>
        </div>
      </section>
    </div>
  );
};

export default KbdShowcase;

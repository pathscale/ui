import Diff from "./Diff";

const DiffShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Diff
          secondItem={
            <img
              alt="daisy"
              src="https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a-blur.webp"
            />
          }
        >
          <img
            alt="daisy"
            src="https://img.daisyui.com/images/stock/photo-1560717789-0ac7c58ac90a.webp"
          />
        </Diff>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Text</h2>
        <Diff
          secondItem={
            <div class="bg-base-200 text-9xl font-black grid place-content-center">
              DAISY
            </div>
          }
        >
          <div class="bg-primary text-primary-content text-9xl font-black grid place-content-center">
            DAISY
          </div>
        </Diff>
      </section>
    </div>
  );
};

export default DiffShowcase;

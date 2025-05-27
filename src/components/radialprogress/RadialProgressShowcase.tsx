import RadialProgress from "./RadialProgress";

const RadialProgressShowcase = () => {
  return (
    <div class="flex flex-col gap-8 p-8">
      <section>
        <h2 class="text-lg font-semibold mb-2">Default</h2>
        <RadialProgress value={75}>75%</RadialProgress>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">Custom Color</h2>
        <RadialProgress value={75} color="primary">
          75%
        </RadialProgress>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">Background Color</h2>
        <RadialProgress
          value={75}
          class="bg-primary text-primary-content border-4 border-primary"
        >
          75%
        </RadialProgress>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">Custom Size and Thickness</h2>
        <div class="flex items-center gap-4">
          <RadialProgress value={70} size="12rem" thickness="2px">
            70%
          </RadialProgress>
          <RadialProgress value={80} size="12rem" thickness="2rem">
            80%
          </RadialProgress>
        </div>
      </section>
    </div>
  );
};

export default RadialProgressShowcase;

import Progress from "./Progress";

const ProgressShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Usage</h2>
        <div class="space-y-4">
          <Progress value={60} />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Sizes</h2>
        <div class="space-y-4">
          <Progress value={75} size="sm" showValue />
          <Progress value={75} size="md" showValue />
          <Progress value={75} size="lg" showValue />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Shapes</h2>
        <div class="space-y-4">
          <Progress value={75} shape="rounded" showValue />
          <Progress value={75} shape="circle" showValue />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Colors</h2>
        <div class="space-y-4">
          <Progress value={75} color="default" showValue />
          <Progress value={75} color="danger" showValue />
          <Progress value={75} color="success" showValue />
          <Progress value={75} color="info" showValue />
          <Progress value={75} color="warning" showValue />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Variants</h2>
        <div class="space-y-4">
          <Progress value={75} variant="filled" showValue />
          <Progress value={75} variant="outlined" showValue />
          <Progress value={75} variant="ghost" showValue />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Labels</h2>
        <div class="space-y-4">
          <Progress value={75} showValue format="percent" />
          <Progress value={75} showValue format="raw" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Indeterminate</h2>
        <div class="space-y-4">
          <Progress value={null} />
        </div>
      </section>
    </div>
  );
};

export default ProgressShowcase;

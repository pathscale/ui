import Grid from "./Grid";

export default function GridShowcase() {
  return (
    <div class="space-y-8 p-4">
      <section>
        <h2 class="text-lg font-semibold mb-2">Default Grid</h2>
        <Grid cols="3" gap="md" class="bg-base-200 p-4 rounded">
          <div class="bg-primary text-white p-4 rounded">1</div>
          <div class="bg-secondary text-white p-4 rounded">2</div>
          <div class="bg-accent text-white p-4 rounded">3</div>
        </Grid>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">Responsive Grid</h2>
        <Grid
          cols={{ base: "1", sm: "2", md: "3" }}
          gap="md"
          class="bg-base-200 p-4 rounded"
        >
          {[...Array(6)].map((_, i) => (
            <div class="bg-neutral text-white p-4 rounded" key={i}>
              Item {i + 1}
            </div>
          ))}
        </Grid>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">Custom Flow</h2>
        <Grid cols="2" flow="col" gap="lg" class="bg-base-200 p-4 rounded">
          <div class="bg-info text-white p-4 rounded">A</div>
          <div class="bg-success text-white p-4 rounded">B</div>
          <div class="bg-warning text-white p-4 rounded">C</div>
          <div class="bg-error text-white p-4 rounded">D</div>
        </Grid>
      </section>

      <section>
        <h2 class="text-lg font-semibold mb-2">Auto Rows and Columns</h2>
        <Grid
          autoCols="fr"
          autoRows="min"
          gap="sm"
          class="bg-base-200 p-4 rounded"
        >
          <div class="bg-primary text-white p-4 rounded">1</div>
          <div class="bg-secondary text-white p-4 rounded">2</div>
          <div class="bg-accent text-white p-4 rounded">3</div>
          <div class="bg-info text-white p-4 rounded">4</div>
        </Grid>
      </section>
    </div>
  );
}

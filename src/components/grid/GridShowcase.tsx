import Grid from "./Grid";

export default function GridShowcase() {
  return (
    <section class="space-y-12">
      <Grid class="grid-cols-3 gap-4">
        <div class="bg-primary text-primary-content p-4">01</div>
        <div class="bg-primary text-primary-content p-4">02</div>
        <div class="bg-primary text-primary-content p-4">03</div>
        <div class="col-span-2 bg-secondary text-secondary-content p-4">
          04 (col-span-2)
        </div>
        <div class="bg-primary text-primary-content p-4">05</div>
        <div class="bg-primary text-primary-content p-4">06</div>
        <div class="col-span-2 bg-secondary text-secondary-content p-4">
          07 (col-span-2)
        </div>
      </Grid>

      <Grid class="grid-cols-6 gap-4">
        <div class="col-span-4 col-start-2 bg-accent text-accent-content p-4">
          01 (start 2, span 4)
        </div>
        <div class="col-start-1 col-end-3 bg-neutral text-neutral-content p-4">
          02 (1 → 3)
        </div>
        <div class="col-span-2 col-end-7 bg-success text-success-content p-4">
          03 (span 2 → end 7)
        </div>
        <div class="col-start-1 col-end-7 bg-warning text-warning-content p-4">
          04 (1 → 7)
        </div>
      </Grid>

      <Grid class="grid-cols-[repeat(16,_minmax(0,_1fr))] gap-2">
        <div class="col-[16_/_span_16] bg-error text-error-content p-4">
          Custom: col-[16 / span 16]
        </div>
      </Grid>

      <Grid class="grid-cols-[var(--my-columns)] gap-2">
        <div class="col-[--my-columns] bg-info text-info-content p-4">
          Custom property: col-(--my-columns)
        </div>
      </Grid>

      <Grid class="grid-cols-6 gap-4">
        <div class="col-span-2 md:col-span-6 bg-base-200 text-base-content p-4">
          Responsive: col-span-2 md:col-span-6
        </div>
      </Grid>
    </section>
  );
}

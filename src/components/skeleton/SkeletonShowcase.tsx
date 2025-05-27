import Skeleton from "./Skeleton";

const SkeletonShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Skeleton class="w-32 h-32" />
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Circle With Content
        </h2>
        <div class="flex flex-col gap-4 w-52">
          <div class="flex gap-4 items-center">
            <Skeleton class="w-16 h-16 rounded-full shrink-0" />
            <div class="flex flex-col gap-4">
              <Skeleton class="h-4 w-20" />
              <Skeleton class="h-4 w-28" />
            </div>
          </div>
          <Skeleton class="h-32 w-full" />
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Rectangle With Content
        </h2>
        <div class="flex flex-col gap-4 w-52">
          <Skeleton class="h-32 w-full" />
          <Skeleton class="h-4 w-28" />
          <Skeleton class="h-4 w-full" />
          <Skeleton class="h-4 w-full" />
        </div>
      </section>
    </div>
  );
};

export default SkeletonShowcase;

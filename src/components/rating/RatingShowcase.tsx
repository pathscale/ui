import { Component, createSignal, onCleanup } from "solid-js";
import Rating from "./Rating";

const RatingShowcase: Component = () => {
  const [rating1, setRating1] = createSignal(2);
  const [rating2, setRating2] = createSignal(2);
  const [rating3, setRating3] = createSignal(2);
  const [rating4, setRating4] = createSignal(2);
  const [rating5, setRating5] = createSignal(0);
  const [rating6, setRating6] = createSignal(3);

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Rating value={rating1()} onChange={setRating1}>
          <Rating.Item name="rating-1" class="mask mask-star" />
          <Rating.Item name="rating-1" class="mask mask-star" />
          <Rating.Item name="rating-1" class="mask mask-star" />
          <Rating.Item name="rating-1" class="mask mask-star" />
          <Rating.Item name="rating-1" class="mask mask-star" />
        </Rating>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Mask Star 2 - Warning
        </h2>
        <Rating value={rating2()} onChange={setRating2}>
          <Rating.Item name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <Rating.Item name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <Rating.Item name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <Rating.Item name="rating-2" class="mask mask-star-2 bg-orange-400" />
          <Rating.Item name="rating-2" class="mask mask-star-2 bg-orange-400" />
        </Rating>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Mask Heart - Multi Color
        </h2>
        <Rating value={rating3()} onChange={setRating3}>
          <Rating.Item name="rating-3" class="mask mask-heart bg-red-400" />
          <Rating.Item name="rating-3" class="mask mask-heart bg-orange-400" />
          <Rating.Item name="rating-3" class="mask mask-heart bg-yellow-400" />
          <Rating.Item name="rating-3" class="mask mask-heart bg-lime-400" />
          <Rating.Item name="rating-3" class="mask mask-heart bg-green-400" />
        </Rating>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Mask Star 2 - Green
        </h2>
        <Rating value={rating4()} onChange={setRating4}>
          <Rating.Item name="rating-4" class="mask mask-star-2 bg-green-500" />
          <Rating.Item name="rating-4" class="mask mask-star-2 bg-green-500" />
          <Rating.Item name="rating-4" class="mask mask-star-2 bg-green-500" />
          <Rating.Item name="rating-4" class="mask mask-star-2 bg-green-500" />
          <Rating.Item name="rating-4" class="mask mask-star-2 bg-green-500" />
        </Rating>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Hidden</h2>
        <Rating value={rating5()} onChange={setRating5} size="lg">
          <Rating.Item name="rating-9" class="mask mask-star" />
          <Rating.Item name="rating-9" class="mask mask-star" />
          <Rating.Item name="rating-9" class="mask mask-star" />
          <Rating.Item name="rating-9" class="mask mask-star" />
          <Rating.Item name="rating-9" class="mask mask-star" />
        </Rating>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Half Stars</h2>
        <Rating value={rating6()} onChange={setRating6} half size="lg">
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-1 bg-green-500"
          />
          <Rating.Item
            name="rating-10"
            class="mask mask-star-2 mask-half-2 bg-green-500"
          />
        </Rating>
      </section>
    </div>
  );
};

export default RatingShowcase;

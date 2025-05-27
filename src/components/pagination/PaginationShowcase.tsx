import type { Component } from "solid-js";
import Pagination from "./Pagination";

const PaginationShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Basic Pagination
        </h2>
        <Pagination>
          <button class="join-item btn">1</button>
          <button class="join-item btn btn-active">2</button>
          <button class="join-item btn">3</button>
        </Pagination>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Responsive Layout
        </h2>
        <Pagination responsive>
          <button class="join-item btn">Prev</button>
          <button class="join-item btn">1</button>
          <button class="join-item btn">2</button>
          <button class="join-item btn">3</button>
          <button class="join-item btn">Next</button>
        </Pagination>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Vertical Layout
        </h2>
        <Pagination vertical>
          <button class="join-item btn">Top</button>
          <button class="join-item btn btn-active">Middle</button>
          <button class="join-item btn">Bottom</button>
        </Pagination>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Horizontal Layout
        </h2>
        <Pagination horizontal>
          <button class="join-item btn">First</button>
          <button class="join-item btn btn-active">Second</button>
          <button class="join-item btn">Third</button>
        </Pagination>
      </section>
    </div>
  );
};

export default PaginationShowcase;

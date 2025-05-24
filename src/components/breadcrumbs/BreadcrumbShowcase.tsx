import { type Component } from "solid-js";
import Breadcrumbs from "./Breadcrumbs";

const BreadcrumbShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Basic Breadcrumbs
        </h2>
        <Breadcrumbs>
          <li>
            <a href="#">Home</a>
          </li>
          <li>
            <a href="#">Library</a>
          </li>
          <li>
            <span class="font-semibold">Data</span>
          </li>
        </Breadcrumbs>
      </section>
    </div>
  );
};

export default BreadcrumbShowcase;

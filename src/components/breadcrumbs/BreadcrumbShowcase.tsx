import { type Component } from "solid-js";
import { Breadcrumbs, BreadcrumbsItem } from "./";

const BreadcrumbShowcase: Component = () => {
  const longPath = [
    { label: "Home", href: "/" },
    { label: "Docs", href: "/docs" },
    { label: "Guides", href: "/guides" },
    { label: "Frameworks", href: "/frameworks" },
    { label: "SolidJS", href: "/solid" },
    { label: "Breadcrumbs", href: "/components/breadcrumbs" },
    { label: "Current Page" },
  ];

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Basic Usage</h2>
        <Breadcrumbs>
          <BreadcrumbsItem href="/">Home</BreadcrumbsItem>
          <BreadcrumbsItem href="/docs">Docs</BreadcrumbsItem>
          <BreadcrumbsItem>Current Page</BreadcrumbsItem>
        </Breadcrumbs>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          With External Links
        </h2>
        <Breadcrumbs>
          <BreadcrumbsItem href="https://example.com">Main</BreadcrumbsItem>
          <BreadcrumbsItem href="https://example.com/docs">
            Docs
          </BreadcrumbsItem>
          <BreadcrumbsItem>External</BreadcrumbsItem>
        </Breadcrumbs>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Long Path (Horizontal Scroll)
        </h2>
        <div class="overflow-x-auto max-w-full">
          <Breadcrumbs>
            {longPath.map((item) =>
              item.href ? (
                <BreadcrumbsItem href={item.href}>{item.label}</BreadcrumbsItem>
              ) : (
                <BreadcrumbsItem>{item.label}</BreadcrumbsItem>
              )
            )}
          </Breadcrumbs>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Single Item</h2>
        <Breadcrumbs>
          <BreadcrumbsItem>Dashboard</BreadcrumbsItem>
        </Breadcrumbs>
      </section>
    </div>
  );
};

export default BreadcrumbShowcase;

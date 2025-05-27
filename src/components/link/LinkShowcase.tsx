import Link from "./Link";

const LinkShowcase = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Link>It's just a simple link</Link>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Href</h2>
        <Link href="https://google.com" target="_blank">
          Take me to Google!
        </Link>
      </section>
    </div>
  );
};

export default LinkShowcase;

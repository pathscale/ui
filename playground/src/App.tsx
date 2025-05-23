import { createSignal, onMount } from "solid-js";

import ButtonShowcase from "../../src/components/button/ButtonShowcase";
import InputShowcase from "../../src/components/input/InputShowcase";

const NAV_ITEMS = [
  { id: "button", label: "Button" },
  { id: "input", label: "Input" },
];

export default function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  onMount(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    }
  });

  const toggleTheme = () => {
    const next = theme() === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <div class="flex min-h-screen bg-base-100 text-base-content">
      <aside class="w-48 border-r border-base-300 p-4 flex flex-col justify-between sticky top-0 h-screen bg-base-200">
        <nav class="space-y-2">
          {NAV_ITEMS.map((item) => (
            <a
              href={`#${item.id}`}
              class="block px-3 py-2 rounded hover:bg-base-300 transition-colors"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <button
          onClick={toggleTheme}
          class="mt-8 px-3 py-2 rounded bg-base-300 hover:bg-base-100 transition-colors"
        >
          {theme() === "light" ? "Dark" : "Light"}
        </button>
      </aside>

      <main class="flex-1 p-8 space-y-16 scroll-smooth">
        <section id="button">
          <ButtonShowcase />
        </section>
        <section id="input">
          <InputShowcase />
        </section>
      </main>
    </div>
  );
}

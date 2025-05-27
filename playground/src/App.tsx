import { createSignal, onMount } from "solid-js";

import LinkShowcase from "../../src/components/link/LinkShowcase";

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
      <aside class="w-48 border-r border-base-300 p-4 flex flex-col sticky top-0 h-screen bg-base-200">
        <button
          onClick={toggleTheme}
          class="mt-4 px-3 py-2 rounded bg-base-300 hover:bg-base-100 transition-colors"
        >
          {theme() === "light" ? "Dark" : "Light"}
        </button>
      </aside>
      
      <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <LinkShowcase />
      </main>
    </div>
  );
}

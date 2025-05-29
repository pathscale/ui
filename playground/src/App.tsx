import { createSignal, onMount } from "solid-js";

import ChatBubbleShowcase from "../../src/components/chatbubble/ChatBubbleShowcase";

export default function App() {
  const [theme, setTheme] = createSignal<"light" | "dark">("light");

  onMount(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") {
      setTheme(stored);
      document.documentElement.setAttribute("data-theme", stored);
    } else {
      document.documentElement.setAttribute("data-theme", "light");
    }
  });

  const toggleTheme = () => {
    const next = theme() === "light" ? "dark" : "light";
    setTheme(next);
    localStorage.setItem("theme", next);
    document.documentElement.setAttribute("data-theme", next);
  };

  return (
    <main class="flex-1 p-8 space-y-16 scroll-smooth">
      <ChatBubbleShowcase />
    </main>
  );
}

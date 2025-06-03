import { createEffect, createSignal, onCleanup, onMount } from "solid-js";
import { Sidenav, SidenavMenu, SidenavItem, SidenavLink } from ".";
import Button from "../button/Button";

export default function SidenavDebugShowcase() {
  const [isOpen, setIsOpen] = createSignal(true);
  const [isDesktop, setIsDesktop] = createSignal(true);
  const [activePath, setActivePath] = createSignal("/");

  const toggleSidebar = () => {
    setIsOpen(!isOpen());
  };

  const checkIfDesktop = () => {
    const viewportWidth = window.innerWidth;
    setIsDesktop(viewportWidth >= 1024);
  };

  onMount(() => {
    checkIfDesktop();
    window.addEventListener("resize", checkIfDesktop);
  });

  onCleanup(() => {
    window.removeEventListener("resize", checkIfDesktop);
  });

  createEffect(() => {
    if (isDesktop()) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  });

  const routes = [
    { id: "/", label: "Home" },
    { id: "/about", label: "About" },
    { id: "/services", label: "Services" },
    { id: "/contact", label: "Contact" },
  ];

  return (
    <div class="flex h-screen">
      <Button
        onClick={toggleSidebar}
        class="lg:hidden fixed top-4 right-4 z-50 p-2 rounded-lg"
      >
        {isOpen() ? "Close" : "Menu"}
      </Button>

      <Sidenav
        title="Simple Test"
        isOpen={isOpen()}
        onClose={() => setIsOpen(false)}
        class={isDesktop() ? "sidenav-desktop" : ""}
        footer={
          <div class="p-4 flex justify-center">
            <span>Footer</span>
          </div>
        }
      >
        <SidenavMenu>
          {routes.map((route) => (
            <SidenavItem active={activePath() === route.id}>
              <SidenavLink asChild>
                <a
                  href="#"
                  class="sidenav-item-link"
                  onClick={(e) => {
                    e.preventDefault();
                    setActivePath(route.id);
                  }}
                >
                  {route.label}
                </a>
              </SidenavLink>
            </SidenavItem>
          ))}
        </SidenavMenu>
      </Sidenav>

      <div class="flex-1 p-6 ml-0 lg:ml-64">
        <h1 class="text-xl font-bold mb-4">Active route: {activePath()}</h1>
        <div class="flex space-x-2">
          <Button onClick={toggleSidebar}>Toggle Sidebar</Button>
          <Button onClick={() => setIsDesktop(!isDesktop())}>
            Toggle Desktop: {isDesktop() ? "On" : "Off"}
          </Button>
        </div>
      </div>
    </div>
  );
}

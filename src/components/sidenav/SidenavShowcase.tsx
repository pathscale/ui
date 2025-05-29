import type { Component } from "solid-js";
import { createSignal, Show } from "solid-js";
import Sidenav, { type SidenavItem, type SidenavItemGroup } from "./Sidenav";

const SidenavShowcase: Component = () => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [selectedId, setSelectedId] = createSignal("dashboard");
  const [isMobile, setIsMobile] = createSignal(false);

  const dashboardIcon = (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
      />
    </svg>
  );

  const usersIcon = (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );

  const settingsIcon = (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );

  const analyticsIcon = (
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );

  const menuItems: (SidenavItem | SidenavItemGroup)[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      href: "#dashboard",
      icon: dashboardIcon,
      active: selectedId() === "dashboard",
      onClick: () => setSelectedId("dashboard"),
    },
    {
      label: "Management",
      items: [
        {
          id: "users",
          label: "Users",
          href: "#users",
          icon: usersIcon,
          active: selectedId() === "users",
          onClick: () => setSelectedId("users"),
        },
        {
          id: "analytics",
          label: "Analytics",
          href: "#analytics",
          icon: analyticsIcon,
          active: selectedId() === "analytics",
          onClick: () => setSelectedId("analytics"),
        },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          id: "settings",
          label: "Settings",
          icon: settingsIcon,
          active: selectedId() === "settings",
          onClick: () => setSelectedId("settings"),
        },
      ],
    },
  ];

  const getContent = () => {
    switch (selectedId()) {
      case "dashboard":
        return (
          <div>
            <h3 class="text-2xl font-bold mb-4">Dashboard</h3>
            <p>
              Welcome to your dashboard! Here you can see an overview of your
              system.
            </p>
          </div>
        );
      case "users":
        return (
          <div>
            <h3 class="text-2xl font-bold mb-4">Users Management</h3>
            <p>Manage your users, roles and permissions here.</p>
          </div>
        );
      case "analytics":
        return (
          <div>
            <h3 class="text-2xl font-bold mb-4">Analytics</h3>
            <p>View detailed analytics and reports about your system.</p>
          </div>
        );
      case "settings":
        return (
          <div>
            <h3 class="text-2xl font-bold mb-4">Settings</h3>
            <p>Configure your application settings and preferences.</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div class="space-y-8">
      <div class="flex items-center gap-4 mb-8">
        <h2 class="text-2xl font-semibold">Sidenav Demo</h2>
        <div class="flex items-center gap-2">
          <span class="text-sm">Desktop</span>
          <input
            type="checkbox"
            class="toggle toggle-primary"
            checked={isMobile()}
            onChange={(e) => setIsMobile(e.currentTarget.checked)}
          />
          <span class="text-sm">Mobile</span>
        </div>
        <Show when={isMobile()}>
          <button
            class="btn btn-primary btn-sm"
            onClick={() => setIsOpen(true)}
          >
            Open Menu
          </button>
        </Show>
      </div>

      <div class="flex min-h-[600px] border rounded-lg overflow-hidden bg-base-100">
        <Sidenav
          title="My Dashboard"
          items={menuItems}
          desktop={!isMobile()}
          isOpen={isOpen()}
          onClose={() => setIsOpen(false)}
          footer={<div class="text-sm text-base-content/70">Version 1.0.0</div>}
        />
        <div class="flex-1 p-8">{getContent()}</div>
      </div>
    </div>
  );
};

export default SidenavShowcase;

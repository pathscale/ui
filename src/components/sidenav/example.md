```tsx
  const routes = [
    { path: "/dashboard", name: "Dashboard" },
    { path: "/users", name: "Users" },
    { path: "/settings", name: "Settings" },
  ];

    <Sidenav title="Navigation" isOpen={true}>
      <SidenavMenu>
        <For each={routes}>
          {(route) => (
            <SidenavItem active={location.pathname === route.path}>
              <A href={route.path} class="sidenav-item-link">
                {route.name}
              </A>
            </SidenavItem>
          )}
        </For>
      </SidenavMenu>
    </Sidenav>
```
- `Sidenav` - Main container
- `SidenavMenu` - Menu wrapper
- `SidenavItem` - Individual items
- `SidenavGroup` - Grouped items (optional)
- `SidenavButton` - Button actions (optional)

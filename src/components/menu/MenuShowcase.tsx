import { type Component } from "solid-js";
import Menu from "../../components/menu/Menu";
import Tooltip from "../../components/tooltip/Tooltip";
import Badge from "../../components/badge/Badge";

const MenuShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8 bg-base-100">
      {/* Default */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default Menu</h2>
        <Menu class="bg-base-200 w-56 rounded-box shadow-xl">
          <Menu.Item>
            <a>Item 1</a>
          </Menu.Item>
          <Menu.Item>
            <a>Item 2</a>
          </Menu.Item>
          <Menu.Item>
            <a>Item 3</a>
          </Menu.Item>
        </Menu>
      </section>

      {/* Responsive */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Responsive Menu</h2>
        <Menu class="bg-base-200 rounded-box shadow-xl" responsive>
          <Menu.Item>
            <a>Item 1</a>
          </Menu.Item>
          <Menu.Item>
            <a>Item 2</a>
          </Menu.Item>
          <Menu.Item>
            <a>Item 3</a>
          </Menu.Item>
        </Menu>
      </section>

      {/* Icon Only */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Icon‑Only Menu</h2>
        <Menu class="bg-base-200 rounded-box shadow-xl">
          <Menu.Item>
            <a>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </a>
          </Menu.Item>
          <Menu.Item>
            <a>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </a>
          </Menu.Item>
          <Menu.Item>
            <a>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </a>
          </Menu.Item>
        </Menu>
      </section>

      {/* With Tooltip */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Icon Only with Tooltip</h2>
        <Menu class="bg-base-200 rounded-box shadow-xl">
          <Menu.Item>
            <Tooltip message="Home" position="right">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </Tooltip>
          </Menu.Item>
          <Menu.Item>
            <Tooltip message="Stats" position="right">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </Tooltip>
          </Menu.Item>
        </Menu>
      </section>

      {/* With Badges */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Icons & Badges</h2>
        <Menu class="bg-base-200 rounded-box shadow-xl" responsive>
          <Menu.Item>
            <a class="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Inbox
              <Badge size="sm">99+</Badge>
            </a>
          </Menu.Item>
          <Menu.Item>
            <a class="flex items-center gap-2">
              Updates
              <Badge color="warning" size="sm">NEW</Badge>
            </a>
          </Menu.Item>
          <Menu.Item>
            <a class="flex items-center gap-2">
              Stats
              <Badge color="info" size="xs" />
            </a>
          </Menu.Item>
        </Menu>
      </section>
    </div>
  );
};

export default MenuShowcase;

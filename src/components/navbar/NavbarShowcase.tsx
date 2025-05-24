import { type Component } from "solid-js";
import Navbar from "./Navbar";
import Button from "../button";
import Dropdown from "../dropdown";

const NavbarShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      {/* Default Navbar */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Navbar class="bg-base-100 shadow-xl rounded-box">
          <Button class="text-xl normal-case" color="ghost">
            daisyUI
          </Button>
        </Navbar>
      </section>

      {/* Title and Icon */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Title & Icon</h2>
        <Navbar class="bg-base-100 shadow-xl rounded-box">
          <div class="flex-1">
            <Button class="text-xl normal-case" color="ghost">
              daisyUI
            </Button>
          </div>
          <div class="flex-none">
            <Button shape="square" color="ghost">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-5 h-5 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0z"
                />
              </svg>
            </Button>
          </div>
        </Navbar>
      </section>

      {/* Dropdown in Navbar */}
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Dropdown in Navbar
        </h2>
        <Navbar class="bg-base-100 shadow-xl rounded-box">
          <div class="flex-1">
            <Button  class="text-xl normal-case" color="ghost">
              daisyUI
            </Button>
          </div>
          <div class="flex-none">
            <Dropdown end>
              <Dropdown.Toggle color="ghost">
                <div class="w-8 rounded-full">
                  <img
                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp"
                    alt="Avatar"
                  />
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu class="w-52 p-2 shadow bg-base-100 rounded-box">
                <Dropdown.Item>Profile</Dropdown.Item>
                <Dropdown.Item>Settings</Dropdown.Item>
                <Dropdown.Item>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </Navbar>
      </section>
    </div>
  );
};

export default NavbarShowcase;

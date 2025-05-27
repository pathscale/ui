import Badge from "../badge";
import Button from "../button";
import Dropdown from "../dropdown";
import Input from "../input";
import { Menu } from "../menu";
import Navbar from "./Navbar";

const NavbarShowcase = () => {
  return (
    <div class="space-y-10">
      <Navbar class="bg-base-100 shadow-xl rounded-box">
        <Button class="text-xl normal-case" color="ghost">
          daisyUI
        </Button>
      </Navbar>

      <Navbar class="bg-base-100 shadow-xl rounded-box">
        <div class="flex-1">
          <Button as="a" class="text-xl normal-case" color="ghost">
            daisyUI
          </Button>
        </div>
        <div class="flex-none">
          <Button color="ghost" shape="square">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </Button>
        </div>
      </Navbar>

      <Navbar class="bg-base-100 shadow-xl rounded-box">
        <div class="flex-none">
          <Button color="ghost" shape="square">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </Button>
        </div>
        <div class="flex-1">
          <Button color="ghost" class="normal-case text-xl">
            daisyUI
          </Button>
        </div>
        <div class="flex-none">
          <Button color="ghost" shape="square">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-5 h-5 stroke-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              />
            </svg>
          </Button>
        </div>
      </Navbar>

      <Navbar class="bg-base-100 mb-32 shadow-xl rounded-box">
        <div class="flex-1">
          <Button color="ghost" class="normal-case text-xl">
            daisyUI
          </Button>
        </div>
        <div class="flex-none">
          <Menu horizontal class="px-1">
            <Menu.Item>
              <a>Link</a>
            </Menu.Item>
            <Menu.Item>
              <details>
                <summary>Parent</summary>
                <ul class="p-2 bg-base-100">
                  <li>
                    <a>Link 1</a>
                  </li>
                  <li>
                    <a>Link 2</a>
                  </li>
                </ul>
              </details>
            </Menu.Item>
          </Menu>
        </div>
      </Navbar>

      <Navbar class="bg-base-100 mb-32 shadow-xl rounded-box">
        <div class="flex-1">
          <Button class="text-xl normal-case" color="ghost">
            daisyUI
          </Button>
        </div>
        <div class="flex-none gap-2 flex items-center">
          <Input placeholder="Search" class="w-24 md:w-auto" />
          <Dropdown>
            <Dropdown.Toggle>
              <Button color="ghost" class="avatar" shape="circle">
                <div class="w-10 rounded-full">
                  <img src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                </div>
              </Button>
            </Dropdown.Toggle>
            <Dropdown.Menu class="w-52 menu-sm mt-3 z-[1] p-2">
              <li>
                <a class="justify-between">
                  Profile
                  <Badge>New</Badge>
                </a>
              </li>
              <Dropdown.Item>Settings</Dropdown.Item>
              <Dropdown.Item>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Navbar>

      <Navbar class="rounded-box bg-neutral text-neutral-content">
        <Button class="text-xl normal-case" color="ghost">
          daisyUI
        </Button>
      </Navbar>

      <Navbar class="rounded-box bg-base-300">
        <Button class="text-xl normal-case" color="ghost">
          daisyUI
        </Button>
      </Navbar>

      <Navbar class="rounded-box bg-primary text-primary-content">
        <Button class="text-xl normal-case" color="ghost">
          daisyUI
        </Button>
      </Navbar>
    </div>
  );
};

export default NavbarShowcase;

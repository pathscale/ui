import { type Component } from "solid-js";
import Button from "../button/Button";
import Indicator from "./Indicator";

const IndicatorShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Status Indicator
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item class="status status-success" />
            <div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
              content
            </div>
          </Indicator>
          <Indicator>
            <Indicator.Item class="status status-error" />
            <div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
              content
            </div>
          </Indicator>
          <Indicator>
            <Indicator.Item class="status status-warning" />
            <div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
              content
            </div>
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Badge as Indicator
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item class="badge badge-primary">New</Indicator.Item>
            <div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
              content
            </div>
          </Indicator>
          <Indicator>
            <Indicator.Item class="badge badge-secondary">Hot</Indicator.Item>
            <div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
              content
            </div>
          </Indicator>
          <Indicator>
            <Indicator.Item class="badge badge-accent">Sale</Indicator.Item>
            <div class="bg-base-300 grid h-32 w-32 place-items-center rounded-box">
              content
            </div>
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">For Button</h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item class="badge badge-secondary">12</Indicator.Item>
            <Button>inbox</Button>
          </Indicator>
          <Indicator>
            <Indicator.Item class="badge badge-error">99+</Indicator.Item>
            <Button color="primary">notifications</Button>
          </Indicator>
          <Indicator>
            <Indicator.Item class="badge badge-success">3</Indicator.Item>
            <Button variant="outline">messages</Button>
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">For Avatar</h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator class="avatar">
            <Indicator.Item class="badge badge-secondary">
              online
            </Indicator.Item>
            <div class="h-20 w-20 rounded-box">
              <img
                alt="Avatar example"
                src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                class="rounded-box"
              />
            </div>
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">For Input</h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item class="badge">Required</Indicator.Item>
            <input
              type="text"
              placeholder="Your email address"
              class="input input-bordered"
            />
          </Indicator>
          <Indicator>
            <Indicator.Item class="badge badge-error">Error</Indicator.Item>
            <input
              type="text"
              placeholder="Invalid input"
              class="input input-bordered input-error"
            />
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Button as Indicator for Card
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item vertical="bottom">
              <Button color="primary">Apply</Button>
            </Indicator.Item>
            <div class="card border-base-300 border shadow-sm">
              <div class="card-body">
                <h2 class="card-title">Job Title</h2>
                <p>Rerum reiciendis beatae tenetur excepturi</p>
              </div>
            </div>
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          In Center of Image
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item
              horizontal="center"
              vertical="middle"
              class="badge badge-neutral"
            >
              Pro Only
            </Indicator.Item>
            <img
              alt="Example image"
              src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
              class="w-64 h-40 object-cover rounded-box"
            />
          </Indicator>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Position Examples
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="space-y-4">
            <h3 class="font-medium">Top Positions</h3>
            <div class="space-y-2 flex gap-5">
              <Indicator>
                <Indicator.Item
                  horizontal="start"
                  vertical="top"
                  class="badge badge-secondary"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  top-start
                </div>
              </Indicator>
              <Indicator>
                <Indicator.Item
                  horizontal="center"
                  vertical="top"
                  class="badge badge-secondary"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  top-center
                </div>
              </Indicator>
              <Indicator>
                <Indicator.Item
                  horizontal="end"
                  vertical="top"
                  class="badge badge-secondary"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  top-end
                </div>
              </Indicator>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="font-medium">Middle Positions</h3>
            <div class="space-y-2 flex gap-5">
              <Indicator>
                <Indicator.Item
                  horizontal="start"
                  vertical="middle"
                  class="badge badge-accent"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  middle-start
                </div>
              </Indicator>
              <Indicator>
                <Indicator.Item
                  horizontal="center"
                  vertical="middle"
                  class="badge badge-accent"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  middle-center
                </div>
              </Indicator>
              <Indicator>
                <Indicator.Item
                  horizontal="end"
                  vertical="middle"
                  class="badge badge-accent"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  middle-end
                </div>
              </Indicator>
            </div>
          </div>

          <div class="space-y-4">
            <h3 class="font-medium">Bottom Positions</h3>
            <div class="space-y-2 flex gap-5">
              <Indicator>
                <Indicator.Item
                  horizontal="start"
                  vertical="bottom"
                  class="badge badge-warning"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  bottom-start
                </div>
              </Indicator>
              <Indicator>
                <Indicator.Item
                  horizontal="center"
                  vertical="bottom"
                  class="badge badge-warning"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  bottom-center
                </div>
              </Indicator>
              <Indicator>
                <Indicator.Item
                  horizontal="end"
                  vertical="bottom"
                  class="badge badge-warning"
                />
                <div class="bg-base-300 grid h-24 w-32 place-items-center rounded-box text-sm">
                  bottom-end
                </div>
              </Indicator>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Multiple Indicators
        </h2>
        <div class="flex flex-wrap items-center gap-4">
          <Indicator>
            <Indicator.Item horizontal="start" vertical="top" class="badge">
              ↖︎
            </Indicator.Item>
            <Indicator.Item horizontal="center" vertical="top" class="badge">
              ↑
            </Indicator.Item>
            <Indicator.Item horizontal="end" vertical="top" class="badge">
              ↗︎
            </Indicator.Item>
            <Indicator.Item horizontal="start" vertical="middle" class="badge">
              ←
            </Indicator.Item>
            <Indicator.Item horizontal="center" vertical="middle" class="badge">
              ●
            </Indicator.Item>
            <Indicator.Item horizontal="end" vertical="middle" class="badge">
              →
            </Indicator.Item>
            <Indicator.Item horizontal="start" vertical="bottom" class="badge">
              ↙︎
            </Indicator.Item>
            <Indicator.Item horizontal="center" vertical="bottom" class="badge">
              ↓
            </Indicator.Item>
            <Indicator.Item horizontal="end" vertical="bottom" class="badge">
              ↘︎
            </Indicator.Item>
            <div class="bg-base-300 grid h-32 w-60 place-items-center rounded-box" />
          </Indicator>
        </div>
      </section>
    </div>
  );
};

export default IndicatorShowcase;

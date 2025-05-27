import Stats from "./Stats";
import Stat from "./Stat";
import Button from "../button";

const StatsShowcase = () => {
  return (
    <div class="space-y-12 p-8 font-sans">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Stats class="shadow">
          <Stat>
            <Stat.Title>Total Page Views</Stat.Title>
            <Stat.Value>89,400</Stat.Value>
            <Stat.Desc>21% more than last month</Stat.Desc>
          </Stat>
        </Stats>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Icons or Image</h2>
        <Stats class="shadow">
          <Stat>
            <Stat.Figure class="text-primary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-8 h-8 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </Stat.Figure>
            <Stat.Title>Total Likes</Stat.Title>
            <Stat.Value class="text-primary">25.6K</Stat.Value>
            <Stat.Desc>21% more than last month</Stat.Desc>
          </Stat>

          <Stat>
            <Stat.Figure class="text-secondary">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                class="inline-block w-8 h-8 stroke-current"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </Stat.Figure>
            <Stat.Title>Page Views</Stat.Title>
            <Stat.Value class="text-secondary">2.6M</Stat.Value>
            <Stat.Desc>21% more than last month</Stat.Desc>
          </Stat>
        </Stats>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Centered Items</h2>
        <Stats class="shadow">
          <Stat class="place-items-center">
            <Stat.Title>Downloads</Stat.Title>
            <Stat.Value>31K</Stat.Value>
            <Stat.Desc>From January 1st to February 1st</Stat.Desc>
          </Stat>

          <Stat class="place-items-center">
            <Stat.Title>Users</Stat.Title>
            <Stat.Value class="text-secondary">4,200</Stat.Value>
            <Stat.Desc class="text-secondary">↗︎ 40 (2%)</Stat.Desc>
          </Stat>

          <Stat class="place-items-center">
            <Stat.Title>New Registers</Stat.Title>
            <Stat.Value>1,200</Stat.Value>
            <Stat.Desc>↘︎ 90 (14%)</Stat.Desc>
          </Stat>
        </Stats>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Vertical</h2>
        <Stats direction="vertical" class="shadow">
          <Stat>
            <Stat.Title>Downloads</Stat.Title>
            <Stat.Value>31K</Stat.Value>
            <Stat.Desc>Jan 1st - Feb 1st</Stat.Desc>
          </Stat>
          <Stat>
            <Stat.Title>New Users</Stat.Title>
            <Stat.Value>4,200</Stat.Value>
            <Stat.Desc>↗︎ 400 (22%)</Stat.Desc>
          </Stat>
          <Stat>
            <Stat.Title>New Registers</Stat.Title>
            <Stat.Value>1,200</Stat.Value>
            <Stat.Desc>↘︎ 90 (14%)</Stat.Desc>
          </Stat>
        </Stats>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          Custom Colors and Button
        </h2>
        <Stats class="bg-primary text-primary-content">
          <Stat>
            <Stat.Title>Account balance</Stat.Title>
            <Stat.Value>$89,400</Stat.Value>
            <Stat.Actions>
              <Button size="sm" color="success">
                Add funds
              </Button>
            </Stat.Actions>
          </Stat>
          <Stat>
            <Stat.Title>Current balance</Stat.Title>
            <Stat.Value>$89,400</Stat.Value>
            <Stat.Actions class="gap-1 flex">
              <Button size="sm">Withdrawal</Button>
              <Button size="sm">Deposit</Button>
            </Stat.Actions>
          </Stat>
        </Stats>
      </section>
    </div>
  );
};

export default StatsShowcase;

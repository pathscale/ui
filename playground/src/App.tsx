import Background from "../../src/components/background";
import Flex from "../../src/components/flex/Flex";
import Table from "../../src/components/table";
import Checkbox from "../../src/components/checkbox";
import Mask from "../../src/components/mask";
import Badge from "../../src/components/badge";
import Button from "../../src/components/button";

export default function App() {
  return (
    <Background>
      <Flex class="min-h-screen">
        <main class="flex-1 p-8 space-y-16 scroll-smooth">
          <div class="space-y-12">
            <section class="overflow-x-auto">
              <h2 class="text-xl font-bold mb-2">Default</h2>
              <Table>
                <Table.Head>
                  <span />
                  <span>Name</span>
                  <span>Job</span>
                  <span>Favorite Color</span>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <span>1</span>
                    <span>Cy Ganderton</span>
                    <span>Quality Control Specialist</span>
                    <span>Blue</span>
                  </Table.Row>
                  <Table.Row>
                    <span>2</span>
                    <span>Hart Hagerty</span>
                    <span>Desktop Support Technician</span>
                    <span>Purple</span>
                  </Table.Row>
                  <Table.Row>
                    <span>3</span>
                    <span>Brice Swyre</span>
                    <span>Tax Accountant</span>
                    <span>Red</span>
                  </Table.Row>
                </Table.Body>
              </Table>
            </section>

            <section class="overflow-x-auto">
              <h2 class="text-xl font-bold mb-2">Active Row</h2>
              <Table>
                <Table.Head>
                  <span />
                  <span>Name</span>
                  <span>Job</span>
                  <span>Favorite Color</span>
                </Table.Head>
                <Table.Body>
                  <Table.Row active>
                    <span>1</span>
                    <span>Cy Ganderton</span>
                    <span>Quality Control Specialist</span>
                    <span>Blue</span>
                  </Table.Row>
                  <Table.Row>
                    <span>2</span>
                    <span>Hart Hagerty</span>
                    <span>Desktop Support Technician</span>
                    <span>Purple</span>
                  </Table.Row>
                  <Table.Row>
                    <span>3</span>
                    <span>Brice Swyre</span>
                    <span>Tax Accountant</span>
                    <span>Red</span>
                  </Table.Row>
                </Table.Body>
              </Table>
            </section>

            <section class="overflow-x-auto">
              <h2 class="text-xl font-bold mb-2">Zebra</h2>
              <Table zebra>
                <Table.Head>
                  <span />
                  <span>Name</span>
                  <span>Job</span>
                  <span>Favorite Color</span>
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <span>1</span>
                    <span>Cy Ganderton</span>
                    <span>Quality Control Specialist</span>
                    <span>Blue</span>
                  </Table.Row>
                  <Table.Row>
                    <span>2</span>
                    <span>Hart Hagerty</span>
                    <span>Desktop Support Technician</span>
                    <span>Purple</span>
                  </Table.Row>
                  <Table.Row>
                    <span>3</span>
                    <span>Brice Swyre</span>
                    <span>Tax Accountant</span>
                    <span>Red</span>
                  </Table.Row>
                </Table.Body>
              </Table>
            </section>

            <section class="overflow-x-auto">
              <h2 class="text-xl font-bold mb-2">With Visual Elements</h2>
              <Table class="rounded-box">
                <Table.Head>
                  <Checkbox />
                  <span>Name</span>
                  <span>Job</span>
                  <span>Favorite Color</span>
                  <span />
                </Table.Head>
                <Table.Body>
                  <Table.Row>
                    <Checkbox />
                    <div class="flex items-center space-x-3">
                      <Mask
                        variant="squircle"
                        src="https://img.daisyui.com/images/profile/demo/2@94.webp"
                      />
                      <div>
                        <div class="font-bold">Hart Hagerty</div>
                        <div class="text-sm opacity-50">United States</div>
                      </div>
                    </div>
                    <div>
                      Zemlak, Daniel and Leannon
                      <br />
                      <Badge color="ghost" size="sm">
                        Desktop Support Technician
                      </Badge>
                    </div>
                    <div>Purple</div>
                    <Button color="ghost" size="xs">
                      details
                    </Button>
                  </Table.Row>
                </Table.Body>
                <Table.Footer>
                  <span />
                  <span>Name</span>
                  <span>Job</span>
                  <span>Favorite Color</span>
                  <span />
                </Table.Footer>
              </Table>
            </section>
          </div>
        </main>
      </Flex>
    </Background>
  );
}

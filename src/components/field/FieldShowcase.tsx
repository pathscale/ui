import { type Component, createSignal } from "solid-js";
import { Field } from "../../";
import { Input } from "../../";
import { Button } from "../../";

const FieldShowcase: Component = () => {
  const [msg, setMsg] = createSignal("");
  const [name, setName] = createSignal("");
  const [email, setEmail] = createSignal("");

  const handleMsgSearch = () => {
    // e.g. perform search or validation
    if (!msg()) alert("Please enter a message");
  };

  const handleNameSearch = () => {
    if (!name()) alert("Please enter a sender");
  };

  const handleEmailSearch = () => {
    if (!email()) alert("Please enter a recipient");
  };

  return (
    <div class="shadow-sm p-6 space-y-8">
      <section>
        <h2 class="text-xl font-semibold text-white-800 border-b pb-2 mb-4">
          Field
        </h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <Field
            horizontal
            size="md"
            label="Message"
            type={msg() ? "default" : "danger"}
            message={msg() ? "" : "This field cannot be empty"}
          >
            <Input
              placeholder="Enter a message…"
              value={msg()}
              onInput={(e) => setMsg(e.currentTarget.value)}
              size="md"
            />
            <Button onClick={handleMsgSearch} color="primary">
              Search
            </Button>
          </Field>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Search From To</h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <Field horizontal size="sm" label="From">
            <Input
              placeholder="Sender…"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
              size="sm"
            />
            <Button onClick={handleNameSearch} color="secondary">
              Go
            </Button>
          </Field>
        </div>
      </section>

      <section>
        <h2 class="text-2xl font-bold mb-4">Search Different Sizes</h2>
        <div class="grid grid-cols-2 gap-3 mb-4">
          <Field horizontal size="lg" label="To">
            <Input
              placeholder="Recipient…"
              value={email()}
              onInput={(e) => setEmail(e.currentTarget.value)}
              size="lg"
            />
            <Button onClick={handleEmailSearch} color="primary">
              Send
            </Button>
          </Field>
        </div>
      </section>
    </div>
  );
};

export default FieldShowcase;

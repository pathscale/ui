import { type Component } from "solid-js";
import ChatBubble from "./ChatBubble";

const ChatBubbleShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <ChatBubble>
          <ChatBubble.Message>You were my brother, Anakin.</ChatBubble.Message>
        </ChatBubble>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Side</h2>
        <ChatBubble>
          <ChatBubble.Message>
            It's over Anakin, <br />I have the high ground.
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Message>You underestimate my power!</ChatBubble.Message>
        </ChatBubble>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Image</h2>
        <ChatBubble>
          <ChatBubble.Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <ChatBubble.Message>
            It was said that you would, destroy the Sith, not join them.
          </ChatBubble.Message>
        </ChatBubble>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Header</h2>
        <ChatBubble>
          <ChatBubble.Header>
            Obi-Wan Kenobi <ChatBubble.Time>12:45</ChatBubble.Time>
          </ChatBubble.Header>
          <ChatBubble.Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <ChatBubble.Message>You were the Chosen One!</ChatBubble.Message>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Header>
            Anakin <ChatBubble.Time>12:46</ChatBubble.Time>
          </ChatBubble.Header>
          <ChatBubble.Avatar src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
          <ChatBubble.Message>I hate you!</ChatBubble.Message>
        </ChatBubble>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">With Footer</h2>
        <ChatBubble>
          <ChatBubble.Message>You were the Chosen One!</ChatBubble.Message>
          <ChatBubble.Footer>Delivered</ChatBubble.Footer>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Message>I hate you!</ChatBubble.Message>
          <ChatBubble.Footer>Seen at 12:46</ChatBubble.Footer>
        </ChatBubble>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">
          With Header and Footer
        </h2>
        <ChatBubble>
          <ChatBubble.Header>
            Obi-Wan Kenobi <ChatBubble.Time>12:45</ChatBubble.Time>
          </ChatBubble.Header>
          <ChatBubble.Message>You were the Chosen One!</ChatBubble.Message>
          <ChatBubble.Footer>Delivered</ChatBubble.Footer>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Header>
            Anakin <ChatBubble.Time>12:46</ChatBubble.Time>
          </ChatBubble.Header>
          <ChatBubble.Message>I hate you!</ChatBubble.Message>
          <ChatBubble.Footer>Seen at 12:46</ChatBubble.Footer>
        </ChatBubble>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Colors</h2>
        <ChatBubble>
          <ChatBubble.Message color="primary">
            What kind of nonsense is this
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble>
          <ChatBubble.Message color="secondary">
            Put me on the Council and not make me a Master!??
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble>
          <ChatBubble.Message color="accent">
            That's never been done in the history of the Jedi. It's insulting!
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Message color="info">
            Calm down, Anakin.
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Message color="success">
            You have been given a great honor.
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Message color="warning">
            To be on the Council at your age.
          </ChatBubble.Message>
        </ChatBubble>
        <ChatBubble end>
          <ChatBubble.Message color="error">
            It's never happened before.
          </ChatBubble.Message>
        </ChatBubble>
      </section>
    </div>
  );
};

export default ChatBubbleShowcase;

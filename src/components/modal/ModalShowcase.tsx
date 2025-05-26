import { type Component, createSignal, Show } from "solid-js";
import Modal from "./Modal";
import Button from "../button/Button";
import ModalLegacy from "./ModalLegacy";

const ModalShowcase: Component = () => {
  const [showModal, setShowModal] = createSignal(false);
  const [showLegacyModal, setShowLegacyModal] = createSignal(false);

  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Modal</h2>
        <Button onClick={() => setShowModal(true)}>Open Modal</Button>
        <Modal open={showModal()} backdrop position="middle">
          <Modal.Header>Welcome!</Modal.Header>
          <Modal.Body>
            <p>This is a standard modal example.</p>
          </Modal.Body>
          <Modal.Actions>
            <Button onClick={() => setShowModal(false)}>Close</Button>
          </Modal.Actions>
        </Modal>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Modal Legacy</h2>
        <Button onClick={() => setShowLegacyModal(true)}>
          Open Legacy Modal
        </Button>
        <Show when={showLegacyModal()}>
          <ModalLegacy open onClickBackdrop={() => setShowLegacyModal(false)}>
            <h3 class="text-lg font-bold mb-2">Legacy Modal</h3>
            <p>
              This modal uses a div-based implementation with backdrop click
              detection.
            </p>
            <div class="modal-action mt-4">
              <Button onClick={() => setShowLegacyModal(false)}>Close</Button>
            </div>
          </ModalLegacy>
        </Show>
      </section>
    </div>
  );
};

export default ModalShowcase;

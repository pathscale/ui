import { Component } from "solid-js";
import Card from "./Card";
import Button from "../button";

const CardShowcase: Component = () => {
  return (
    <div class="space-y-12 p-8">
      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Default</h2>
        <Card>
          <Card.Image
            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
          <Card.Body>
            <Card.Title tag="h2">Shoes!</Card.Title>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <Card.Actions class="justify-end">
              <Button color="primary">Buy Now</Button>
            </Card.Actions>
          </Card.Body>
        </Card>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Responsive</h2>
        <div class="mb-3 text-sm text-gray-500">
          (vertical on small screen, horizontal on large screen)
        </div>
        <Card side="lg">
          <Card.Image
            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
          <Card.Body>
            <Card.Title tag="h2">Shoes!</Card.Title>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <Card.Actions class="justify-end">
              <Button color="primary">Buy Now</Button>
            </Card.Actions>
          </Card.Body>
        </Card>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Centered</h2>
        <Card>
          <Card.Image
            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
          <Card.Body class="items-center text-center">
            <Card.Title tag="h2">Shoes!</Card.Title>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <Card.Actions class="justify-end">
              <Button color="primary">Buy Now</Button>
            </Card.Actions>
          </Card.Body>
        </Card>
      </section>

      <section>
        <h2 class="text-xl font-semibold border-b pb-2 mb-4">Image Overlay</h2>
        <Card imageFull>
          <Card.Image
            src="https://img.daisyui.com/images/stock/photo-1606107557195-0e29a4b5b4aa.webp"
            alt="Shoes"
          />
          <Card.Body>
            <Card.Title tag="h2">Shoes!</Card.Title>
            <p>If a dog chews shoes whose shoes does he choose?</p>
            <Card.Actions class="justify-end">
              <Button color="primary">Buy Now</Button>
            </Card.Actions>
          </Card.Body>
        </Card>
      </section>
    </div>
  );
};

export default CardShowcase;

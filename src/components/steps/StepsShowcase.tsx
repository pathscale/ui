import { type Component } from "solid-js";
import Steps from "./Steps";
import Step from "./Step";

const StepsShowcase: Component = () => {
  return (
    <div class="p-8">
      <Steps>
        <Step color="primary">Register</Step>
        <Step color="primary">Choose plan</Step>
        <Step>Purchase</Step>
        <Step>Receive Product</Step>
      </Steps>
    </div>
  );
};

export default StepsShowcase;

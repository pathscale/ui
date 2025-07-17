import { splitProps, type JSX } from "solid-js";
import { twMerge } from "tailwind-merge";
import Card from "../card/Card";
import StatCardSection from "./StatCardSection";
import Flex from "../flex/Flex";

export type StatCardProps = JSX.HTMLAttributes<HTMLDivElement> & {
  dataTheme?: string;
};

const StatCard = (props: StatCardProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "dataTheme",
    "style",
  ]);

  const normalizedStyle =
    typeof local.style === "object" || typeof local.style === "undefined"
      ? local.style
      : undefined;

  return (
    <Card
      {...rest}
      style={normalizedStyle}
      class={twMerge(
        "border border-base-300 bg-base-100 rounded-lg p-6",
        local.class
      )}
      data-theme={local.dataTheme}
    >
      <Flex align="center" gap="md">
        {local.children}
      </Flex>
    </Card>
  );
};

const StatCardFigure = StatCardSection("figure");
const StatCardTitle = StatCardSection("title");
const StatCardValue = StatCardSection("value");
const StatCardDesc = StatCardSection("desc");
const StatCardActions = StatCardSection("actions");

export default Object.assign(StatCard, {
  Figure: StatCardFigure,
  Title: StatCardTitle,
  Value: StatCardValue,
  Desc: StatCardDesc,
  Actions: StatCardActions,
});

import type { JSX } from "solid-js";

export type CardImageProps = JSX.ImgHTMLAttributes<HTMLImageElement>;

export default function CardImage(props: CardImageProps): JSX.Element {
  return (
    <figure>
      <img {...props} />
    </figure>
  );
}

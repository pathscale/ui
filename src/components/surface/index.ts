import { SurfaceRoot } from "./Surface";

const Surface = Object.assign(SurfaceRoot, {
  Root: SurfaceRoot,
});

export default Surface;

export { Surface };
export { SurfaceRoot, SurfaceContext, surfaceVariants } from "./Surface";

export type {
  SurfaceRootProps,
  SurfaceRootProps as SurfaceProps,
  SurfaceVariant,
  SurfaceVariants,
} from "./Surface";

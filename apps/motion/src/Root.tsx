import { Composition, Still } from "remotion";
import { ProductShowcase } from "./ProductShowcase";

const fps = 30;
const width = 1920;
const height = 1080;

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="ProductShowcase"
        component={ProductShowcase}
        durationInFrames={12 * fps}
        fps={fps}
        width={width}
        height={height}
      />
      <Still id="ProductShowcaseStill" component={ProductShowcase} width={width} height={height} />
    </>
  );
};

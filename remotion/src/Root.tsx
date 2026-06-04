import { Composition } from 'remotion'
import { PulsePromo } from './PulsePromo'

// Landscape only for now — the PulsePromo component is laid out with fixed
// paddings and font sizes intentionally tuned for 1920×1080. Adding square
// and vertical compositions back will require either responsive sizing via
// useVideoConfig() or dedicated layout components per aspect ratio.
export const Root = () => (
  <Composition
    id="pulse-promo"
    component={PulsePromo}
    durationInFrames={900}
    fps={30}
    width={1920}
    height={1080}
  />
)

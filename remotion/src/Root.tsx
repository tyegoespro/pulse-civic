import { Composition } from 'remotion'
import { PulsePromo } from './PulsePromo'

// All compositions share the same React tree and FPS — only the framing
// changes between landscape (landing embed, Twitter), square (IG feed),
// and vertical (Reels / TikTok / Stories).
export const Root = () => (
  <>
    <Composition
      id="pulse-promo"
      component={PulsePromo}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="pulse-promo-square"
      component={PulsePromo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1080}
    />
    <Composition
      id="pulse-promo-vertical"
      component={PulsePromo}
      durationInFrames={900}
      fps={30}
      width={1080}
      height={1920}
    />
  </>
)

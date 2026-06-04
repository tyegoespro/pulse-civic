import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring
} from 'remotion'
import { loadFont as loadSpaceMono } from '@remotion/google-fonts/SpaceMono'

const { fontFamily } = loadSpaceMono()

// Pulse editorial palette, identical to the landing page
const PAPER = '#FAFAF7'
const INK = '#09090B'
const INK_SOFT = '#27272A'
const INK_MUTE = '#52525B'
const PINK = '#FF3366'
const GREEN = '#22C55E'
const INDIGO = '#6366F1'
const AMBER = '#F59E0B'

// ─── PulsePromo: stitches scenes via Sequence boundaries ─────────────────
export const PulsePromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: PAPER, fontFamily }}>
      {/* Editorial top stripe, pink accent, persistent through whole video */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 8,
        background: PINK
      }} />

      {/* Scenes */}
      <Sequence from={0} durationInFrames={60}><Masthead /></Sequence>
      <Sequence from={60} durationInFrames={150}><HeroHeadline /></Sequence>
      <Sequence from={210} durationInFrames={90}><RestOfUs /></Sequence>
      <Sequence from={300} durationInFrames={150}><ForTheRestOfUs /></Sequence>
      <Sequence from={450} durationInFrames={210}><Planks /></Sequence>
      <Sequence from={660} durationInFrames={150}><VerifiedReal /></Sequence>
      <Sequence from={810} durationInFrames={90}><EndCard /></Sequence>

      {/* Persistent corner watermark after the opening masthead — layout="none"
          because CornerWatermark is itself absolutely positioned. */}
      <Sequence from={60} durationInFrames={780} layout="none"><CornerWatermark /></Sequence>
    </AbsoluteFill>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────

const useFadeIn = (durationFrames = 18) => {
  const frame = useCurrentFrame()
  return interpolate(frame, [0, durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  })
}

const useSlideUp = (startFrame: number, durationFrames = 24) => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const t = spring({
    frame: frame - startFrame,
    fps,
    config: { damping: 18, stiffness: 80, mass: 0.6 }
  })
  return {
    opacity: interpolate(t, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(t, [0, 1], [40, 0])}px)`
  }
}

const Live = () => {
  const frame = useCurrentFrame()
  const scale = interpolate(
    frame % 36,
    [0, 18, 36],
    [1, 1.5, 1]
  )
  const opacity = interpolate(
    frame % 36,
    [0, 18, 36],
    [1, 0.5, 1]
  )
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 16,
        height: 16,
        borderRadius: 8,
        background: GREEN,
        transform: `scale(${scale})`,
        opacity
      }} />
      <span style={{
        fontSize: 22,
        fontWeight: 700,
        color: INK_MUTE,
        letterSpacing: '0.22em',
        textTransform: 'uppercase'
      }}>Live</span>
    </div>
  )
}

const BrandMark: React.FC<{ size?: number; color?: string }> = ({ size = 90, color = INK }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="7" fill={color} />
    <polyline
      points="4,18 9,18 12,10 16,22 20,14 23,18 28,18"
      fill="none"
      stroke={PINK}
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

// ─── Scene 1: Masthead reveal (0-2s) ─────────────────────────────────────
const Masthead: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const brandT = spring({ frame, fps, config: { damping: 18, stiffness: 90, mass: 0.7 } })
  const wordT = spring({ frame: frame - 8, fps, config: { damping: 18, stiffness: 90 } })
  const dateT = spring({ frame: frame - 18, fps, config: { damping: 18, stiffness: 80 } })
  return (
    <AbsoluteFill style={{ padding: '120px 140px', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
        <div style={{ opacity: brandT, transform: `scale(${interpolate(brandT, [0, 1], [0.85, 1])})` }}>
          <BrandMark size={96} />
        </div>
        <div style={{
          fontSize: 120,
          fontWeight: 700,
          color: INK,
          letterSpacing: '-0.045em',
          opacity: wordT,
          transform: `translateX(${interpolate(wordT, [0, 1], [-20, 0])}px)`
        }}>PULSE</div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        opacity: dateT,
        transform: `translateX(${interpolate(dateT, [0, 1], [20, 0])}px)`
      }}>
        <span style={{
          fontSize: 24,
          fontWeight: 700,
          color: INK_MUTE,
          letterSpacing: '0.22em',
          textTransform: 'uppercase'
        }}>Oshkosh, WI</span>
        <span style={{ fontSize: 24, color: INK_MUTE, opacity: 0.4 }}>·</span>
        <Live />
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 2: Hero headline (2-7s) ───────────────────────────────────────
const HERO_LINES = [
  'The same twelve',
  'people show up to',
  'every council meeting.'
]
// Single hoisted line component so the hook lives at the top level — the
// previous .map(useSlideUp(...)) inside the parent was a Rules of Hooks
// violation even when the array length was static.
const HeroLine: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const style = useSlideUp(startFrame, 30)
  return (
    <div style={{
      ...style,
      fontSize: 140,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.02,
      letterSpacing: '-0.045em',
      marginBottom: 8
    }}>{text}</div>
  )
}
const HeroHeadline: React.FC = () => (
  <AbsoluteFill style={{ padding: '180px 140px', justifyContent: 'center' }}>
    {HERO_LINES.map((line, i) => (
      <HeroLine key={i} text={line} startFrame={i * 8} />
    ))}
  </AbsoluteFill>
)

// ─── Scene 3: The rest of us stopped going (7-10s) ───────────────────────
const RestOfUs: React.FC = () => {
  const line1 = useSlideUp(0, 30)
  const line2 = useSlideUp(8, 30)
  return (
    <AbsoluteFill style={{ padding: '200px 140px', justifyContent: 'center' }}>
      <div style={{
        ...line1,
        fontSize: 140,
        fontWeight: 700,
        color: INK,
        lineHeight: 1.02,
        letterSpacing: '-0.045em'
      }}>
        The rest of us
      </div>
      <div style={{
        ...line2,
        fontSize: 140,
        fontWeight: 700,
        color: INK,
        lineHeight: 1.02,
        letterSpacing: '-0.045em',
        marginTop: 8
      }}>
        stopped going.
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 4: Pulse is for the rest of us (10-15s) ───────────────────────
const ForTheRestOfUs: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const line1 = useSlideUp(0, 30)
  const line2 = useSlideUp(10, 30)
  // Accent block sweeps under "us" after a beat
  const accentT = spring({
    frame: frame - 60,
    fps,
    config: { damping: 22, stiffness: 80, mass: 0.8 }
  })
  return (
    <AbsoluteFill style={{ padding: '200px 140px', justifyContent: 'center' }}>
      <div style={{
        ...line1,
        fontSize: 140,
        fontWeight: 700,
        color: INK,
        lineHeight: 1.02,
        letterSpacing: '-0.045em'
      }}>
        Pulse is for
      </div>
      <div style={{
        ...line2,
        fontSize: 140,
        fontWeight: 700,
        color: INK,
        lineHeight: 1.02,
        letterSpacing: '-0.045em',
        marginTop: 8,
        display: 'flex',
        alignItems: 'baseline'
      }}>
        <span>the rest of&nbsp;</span>
        <span style={{
          position: 'relative',
          display: 'inline-block',
          padding: '0 22px'
        }}>
          <span style={{
            position: 'absolute',
            inset: 0,
            background: PINK,
            transform: `scaleX(${accentT})`,
            transformOrigin: 'left center'
          }} />
          <span style={{ position: 'relative', color: accentT > 0.5 ? PAPER : INK }}>us.</span>
        </span>
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 5: Numbered planks (15-22s) ───────────────────────────────────
const PLANKS = [
  { n: '01', color: PINK, title: 'Residents only.' },
  { n: '02', color: INDIGO, title: 'One person, one vote.' },
  { n: '03', color: GREEN, title: 'Public consensus, in public.' },
  { n: '04', color: AMBER, title: 'No ads. Ever.' }
] as const

const Plank: React.FC<{ n: string; color: string; title: string; startFrame: number }> = ({
  n,
  color,
  title,
  startFrame
}) => {
  const style = useSlideUp(startFrame, 30)
  return (
    <div style={{
      ...style,
      display: 'flex',
      alignItems: 'center',
      gap: 40,
      marginBottom: 28,
      borderTop: `2px solid ${INK}22`,
      paddingTop: 24
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: 220 }}>
        <div style={{ width: 10, height: 70, background: color }} />
        <div style={{
          fontSize: 48,
          fontWeight: 700,
          color,
          letterSpacing: '0.04em'
        }}>{n}</div>
      </div>
      <div style={{
        fontSize: 84,
        fontWeight: 700,
        color: INK,
        letterSpacing: '-0.025em',
        lineHeight: 1
      }}>{title}</div>
    </div>
  )
}

const Planks: React.FC = () => (
  <AbsoluteFill style={{ padding: '160px 140px', justifyContent: 'center' }}>
    {PLANKS.map((p, i) => (
      <Plank key={p.n} n={p.n} color={p.color} title={p.title} startFrame={i * 14} />
    ))}
  </AbsoluteFill>
)

// ─── Scene 6: Verified residents / Real consensus / Live (22-27s) ───────
const VERIFIED_ITEMS = [
  { label: 'Verified residents.', color: GREEN },
  { label: 'Real consensus.', color: INDIGO },
  { label: 'In real time.', color: PINK }
] as const

const VerifiedItem: React.FC<{ label: string; color: string; startFrame: number }> = ({
  label,
  color,
  startFrame
}) => {
  const style = useSlideUp(startFrame, 30)
  return (
    <div style={{
      ...style,
      fontSize: 144,
      fontWeight: 700,
      color: INK,
      lineHeight: 1.02,
      letterSpacing: '-0.045em',
      marginBottom: 8,
      display: 'flex',
      alignItems: 'baseline',
      gap: 24
    }}>
      <span style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        background: color,
        display: 'inline-block'
      }} />
      <span>{label}</span>
    </div>
  )
}

const VerifiedReal: React.FC = () => (
  <AbsoluteFill style={{ padding: '200px 140px', justifyContent: 'center' }}>
    {VERIFIED_ITEMS.map((it, i) => (
      <VerifiedItem key={it.label} label={it.label} color={it.color} startFrame={i * 18} />
    ))}
  </AbsoluteFill>
)

// ─── Scene 7: End card (27-30s) ──────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const brandT = spring({ frame, fps, config: { damping: 18, stiffness: 90 } })
  const urlT = useSlideUp(14, 30)
  const ctaT = useSlideUp(26, 30)
  return (
    <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', padding: '120px 140px' }}>
      <div style={{
        opacity: brandT,
        transform: `scale(${interpolate(brandT, [0, 1], [0.85, 1])})`,
        marginBottom: 40
      }}>
        <BrandMark size={200} />
      </div>
      <div style={{
        ...urlT,
        fontSize: 84,
        fontWeight: 700,
        color: INK,
        letterSpacing: '-0.04em'
      }}>
        pulse-civic.vercel.app
      </div>
      <div style={{
        ...ctaT,
        marginTop: 36,
        background: INK,
        color: PAPER,
        padding: '24px 48px',
        fontSize: 32,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase'
      }}>
        Open Pulse →
      </div>
    </AbsoluteFill>
  )
}

// ─── Persistent corner watermark after opening (frames 60-840) ────────────
const CornerWatermark: React.FC = () => {
  const fade = useFadeIn(20)
  return (
    <div style={{
      position: 'absolute',
      bottom: 60,
      left: 140,
      display: 'flex',
      alignItems: 'center',
      gap: 14,
      opacity: fade
    }}>
      <BrandMark size={36} />
      <span style={{
        fontSize: 18,
        fontWeight: 700,
        color: INK_MUTE,
        letterSpacing: '0.22em',
        textTransform: 'uppercase'
      }}>Pulse · Oshkosh, WI</span>
    </div>
  )
}

import React from 'react'
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  Img,
  staticFile
} from 'remotion'
import { loadFont as loadInter } from '@remotion/google-fonts/Inter'
import {
  IconTrending,
  IconVerified,
  IconMegaphone,
  IconRefresh,
  IconCompliment,
  IconPothole,
  IconGlobe,
  IconComments,
  IconArrowUp,
  PulseLogo
} from './Icons'

const { fontFamily } = loadInter()

// Flip to `true` after running `node scripts/generate-photos.mjs` so the
// before/after scenes use the Gemini-generated photos instead of the
// stylized SVG fallbacks.
const HAS_PHOTOS = false

// ─── App palette (Pulse PWA) ─────────────────────────────────────────────
const BG = '#0F0F1A'
const BG_CARD = '#1A1A2E'
const BORDER = 'rgba(255, 255, 255, 0.08)'
const BORDER_STRONG = 'rgba(255, 255, 255, 0.16)'
const TEXT = '#F5F5FA'
const TEXT_DIM = '#C4B5FD'
const TEXT_MUTE = '#9CA3AF'
const PINK = '#FF3366'
const PINK_GLOW = 'rgba(255, 51, 102, 0.45)'
const GREEN = '#22C55E'
const PURPLE = '#A855F7'
const INDIGO = '#6366F1'
const AMBER = '#F59E0B'
const BLUE = '#3B82F6'
const ORANGE = '#FF6B35'

// ─── Easings (from the skill's timing rules) ─────────────────────────────
const ENTER = Easing.bezier(0.16, 1, 0.3, 1)
const SMOOTH = Easing.bezier(0.45, 0, 0.55, 1)
const SOFT_POP = Easing.bezier(0.34, 1.56, 0.64, 1)

// ─── Helpers ─────────────────────────────────────────────────────────────

const useEnter = (startFrame: number, durationFrames = 24) => {
  const frame = useCurrentFrame()
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER }
  )
  return {
    opacity: t,
    transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)`
  }
}

const usePop = (startFrame: number, durationFrames = 18) => {
  const frame = useCurrentFrame()
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SOFT_POP }
  )
  return {
    opacity: interpolate(t, [0, 0.5, 1], [0, 1, 1]),
    transform: `scale(${interpolate(t, [0, 1], [0.6, 1])})`
  }
}

const useTicker = (startFrame: number, fromValue: number, toValue: number, durationFrames = 30) => {
  const frame = useCurrentFrame()
  const t = interpolate(
    frame,
    [startFrame, startFrame + durationFrames],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER }
  )
  return Math.floor(fromValue + (toValue - fromValue) * t)
}

const fmtNum = (n: number) => n.toLocaleString('en-US')

// ─── Photo helpers ───────────────────────────────────────────────────────
// Renders a Gemini-generated street photo when available, falls back to a
// stylized SVG illustration so the video still runs end-to-end without it.

const BeforePhoto: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  if (HAS_PHOTOS) {
    return (
      <Img
        src={staticFile('photos/before.jpg')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      />
    )
  }
  return <PotholeFallback style={style} />
}

const AfterPhoto: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  if (HAS_PHOTOS) {
    return (
      <Img
        src={staticFile('photos/after.jpg')}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
      />
    )
  }
  return <RepavedFallback style={style} />
}

// SVG fallback illustrations (only used if HAS_PHOTOS = false)
const PotholeFallback: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%', display: 'block', ...style }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#4a5d76" /><stop offset="1" stopColor="#2e4055" /></linearGradient>
      <linearGradient id="pRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a3a" /><stop offset="1" stopColor="#1a1a1a" /></linearGradient>
      <radialGradient id="pHole" cx="0.5" cy="0.5"><stop offset="0" stopColor="#000" /><stop offset="1" stopColor="#1a1a1a" /></radialGradient>
    </defs>
    <rect width="800" height="170" fill="url(#pSky)" />
    <path d="M0,150 L120,150 L120,120 L210,120 L210,140 L290,140 L290,110 L370,110 L370,150 L450,150 L450,128 L540,128 L540,150 L800,150 L800,170 L0,170 Z" fill="#1e2a3a" />
    <rect x="0" y="170" width="800" height="330" fill="url(#pRoad)" />
    <ellipse cx="400" cy="370" rx="195" ry="92" fill="url(#pHole)" />
  </svg>
)
const RepavedFallback: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%', display: 'block', ...style }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="rSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7b9ab9" /><stop offset="1" stopColor="#5a7d9e" /></linearGradient>
      <linearGradient id="rRoad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3a3a40" /><stop offset="1" stopColor="#15151c" /></linearGradient>
    </defs>
    <rect width="800" height="170" fill="url(#rSky)" />
    <path d="M0,150 L120,150 L120,120 L210,120 L210,140 L290,140 L290,110 L370,110 L370,150 L450,150 L450,128 L540,128 L540,150 L800,150 L800,170 L0,170 Z" fill="#3a4a5e" />
    <rect x="0" y="170" width="800" height="330" fill="url(#rRoad)" />
  </svg>
)

// ─── App header (no Oshkosh, no emojis) ─────────────────────────────────
const AppHeader: React.FC = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: '28px 64px 22px',
    borderBottom: `1px solid ${BORDER}`,
    background: BG,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontFamily
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <PulseLogo size={36} />
      <span style={{ fontSize: 28, fontWeight: 800, color: TEXT, letterSpacing: '-0.02em' }}>Pulse</span>
    </div>
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      padding: '8px 16px',
      borderRadius: 24,
      background: `${GREEN}1A`,
      border: `1px solid ${GREEN}44`,
      color: GREEN,
      fontSize: 14,
      fontWeight: 700,
      letterSpacing: '0.04em'
    }}>
      <IconVerified size={14} />
      <span>Verified resident</span>
    </div>
  </div>
)

const Caption: React.FC<{ text: string; color?: string; startFrame: number }> = ({
  text,
  color = PINK,
  startFrame
}) => {
  const slide = useEnter(startFrame, 22)
  return (
    <div style={{
      ...slide,
      position: 'absolute',
      top: 122,
      left: 64,
      right: 64,
      fontFamily,
      fontSize: 14,
      fontWeight: 800,
      color,
      letterSpacing: '0.26em',
      textTransform: 'uppercase'
    }}>
      <span style={{
        display: 'inline-block',
        width: 36,
        height: 2,
        background: color,
        verticalAlign: 'middle',
        marginRight: 14
      }} />
      {text}
    </div>
  )
}

// Category chip used inside Pulse cards
const Chip: React.FC<{ color: string; label: string; icon?: React.ReactNode }> = ({ color, label, icon }) => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 14px',
    borderRadius: 8,
    background: `${color}22`,
    border: `1px solid ${color}55`,
    color,
    fontSize: 14,
    fontWeight: 800,
    letterSpacing: '0.04em',
    textTransform: 'uppercase'
  }}>
    {icon}
    {label}
  </span>
)

// ─── Scene 1: Photo reveal → Pulse card (0–6s) ───────────────────────────
const SceneOpen: React.FC = () => {
  const frame = useCurrentFrame()
  const photoFade = interpolate(frame, [0, 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER
  })
  const pullback = interpolate(frame, [40, 100], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER
  })
  const photoScale = interpolate(pullback, [0, 1], [1, 0.36])
  const photoTranslateX = interpolate(pullback, [0, 1], [0, -540])
  const photoTranslateY = interpolate(pullback, [0, 1], [0, 60])

  const headerFade = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const cardChromeFade = interpolate(frame, [80, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const tickerVotes = useTicker(118, 11, 12, 14)

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="Post what you see." startFrame={100} />

      {/* Photo: starts fullscreen, animates into card position */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: 1920,
        height: 1080,
        opacity: photoFade,
        transform: `translate(${photoTranslateX}px, ${photoTranslateY}px) scale(${photoScale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none'
      }}>
        <BeforePhoto />
      </div>

      {/* Card chrome appears around the photo */}
      <div style={{
        position: 'absolute',
        top: 240,
        left: 120,
        right: 120,
        background: BG_CARD,
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        padding: '32px 36px',
        boxShadow: '0 12px 50px rgba(0,0,0,0.4)',
        opacity: cardChromeFade,
        fontFamily
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Chip color={ORANGE} label="Pothole" icon={<IconPothole size={14} />} />
          <span style={{ fontSize: 16, color: TEXT_MUTE }}>· Main St &amp; 9th Ave</span>
        </div>

        <div style={{
          fontSize: 30,
          fontWeight: 800,
          color: TEXT,
          marginBottom: 22,
          letterSpacing: '-0.015em',
          lineHeight: 1.25
        }}>Massive potholes on Main &amp; 9th — bent my rim last week</div>

        {/* Photo slot inside the card — appears after the pullback completes */}
        <div style={{
          width: '100%',
          height: 480,
          borderRadius: 14,
          background: '#000',
          overflow: 'hidden',
          marginBottom: 22,
          opacity: cardChromeFade
        }}>
          {frame > 95 && <BeforePhoto />}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${BORDER_STRONG}`,
            color: TEXT,
            fontSize: 22,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums'
          }}>
            <IconArrowUp size={20} />
            {tickerVotes}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 16, color: TEXT_MUTE }}>
            posted just now · Marcus T.
            <IconVerified size={14} style={{ color: GREEN }} />
          </span>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 2: Leaderboard battle (6–13s) ─────────────────────────────────

const FEED_CARD_HEIGHT = 162
const FEED_CARD_GAP = 16
const FEED_START_Y = 220

const FEED_PULSES = [
  { id: 'a', title: 'Streetlight out on Elm for 3 weeks', cat: 'Safety', catColor: PINK, startVotes: 89, endVotes: 89, startRank: 0, endRank: 1 },
  { id: 'b', title: 'Crosswalk paint faded near the school', cat: 'Safety', catColor: PINK, startVotes: 67, endVotes: 67, startRank: 1, endRank: 2 },
  { id: 'c', title: 'Trash pickup missed for 3 weeks', cat: 'Other', catColor: TEXT_MUTE, startVotes: 45, endVotes: 45, startRank: 2, endRank: 3 },
  { id: 'd', title: 'Bus stop bench fell over', cat: 'Transit', catColor: BLUE, startVotes: 32, endVotes: 32, startRank: 3, endRank: 4 },
  { id: 'hero', title: 'Massive potholes on Main & 9th', cat: 'Pothole', catColor: ORANGE, startVotes: 12, endVotes: 742, startRank: 4, endRank: 0, hero: true }
]

const SceneClimb: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const climbProgress = interpolate(frame, [30, 170], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ENTER
  })

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="When neighbors agree." startFrame={0} />

      <div style={{ position: 'absolute', top: FEED_START_Y, left: 120, right: 120 }}>
        {FEED_PULSES.map(p => {
          const y = interpolate(
            climbProgress,
            [0, 1],
            [p.startRank * (FEED_CARD_HEIGHT + FEED_CARD_GAP), p.endRank * (FEED_CARD_HEIGHT + FEED_CARD_GAP)],
            { easing: ENTER }
          )
          const votes = p.hero ? Math.floor(p.startVotes + (p.endVotes - p.startVotes) * climbProgress) : p.startVotes
          const isOnTop = p.endRank === 0 && climbProgress > 0.6
          return (
            <FeedCard
              key={p.id}
              y={y}
              title={p.title}
              cat={p.cat}
              catColor={p.catColor}
              votes={votes}
              hero={!!p.hero}
              celebrate={!!p.hero && isOnTop}
            />
          )
        })}
      </div>
    </AbsoluteFill>
  )
}

const FeedCard: React.FC<{
  y: number
  title: string
  cat: string
  catColor: string
  votes: number
  hero: boolean
  celebrate: boolean
}> = ({ y, title, cat, catColor, votes, hero, celebrate }) => (
  <div style={{
    position: 'absolute',
    top: y,
    left: 0,
    right: 0,
    height: FEED_CARD_HEIGHT,
    background: BG_CARD,
    borderRadius: 18,
    border: hero
      ? `1.5px solid ${celebrate ? PINK : ORANGE}66`
      : `1px solid ${BORDER}`,
    padding: '20px 26px',
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    fontFamily,
    boxShadow: hero && celebrate ? `0 12px 50px ${PINK_GLOW}` : '0 4px 18px rgba(0,0,0,0.25)'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 4,
      width: 96,
      flexShrink: 0,
      padding: '10px 0',
      borderRadius: 14,
      background: hero && celebrate ? `${PINK}22` : 'rgba(255,255,255,0.04)',
      border: hero && celebrate ? `1px solid ${PINK}` : `1px solid ${BORDER_STRONG}`
    }}>
      <span style={{
        fontSize: 30,
        fontWeight: 800,
        color: hero && celebrate ? PINK : TEXT,
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '-0.02em'
      }}>{fmtNum(votes)}</span>
      <span style={{ fontSize: 11, color: TEXT_MUTE, fontWeight: 700, letterSpacing: '0.08em' }}>VOTES</span>
    </div>

    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <Chip color={catColor} label={cat} />
        {hero && celebrate && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 12px',
            borderRadius: 6,
            background: PINK,
            color: 'white',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.06em',
            textTransform: 'uppercase'
          }}>
            <IconTrending size={14} />
            #1 Trending
          </span>
        )}
      </div>
      <div style={{
        fontSize: 24,
        fontWeight: 700,
        color: TEXT,
        letterSpacing: '-0.01em',
        lineHeight: 1.25,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis'
      }}>{title}</div>
    </div>
  </div>
)

// ─── Scene 3: City response (13–17s) ─────────────────────────────────────
const SceneListens: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const cardEnter = useEnter(0, 22)
  const statusPop = usePop(28, 16)
  const notifSlide = useEnter(46, 22)
  const commentSlide = useEnter(72, 22)

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="The city listens." startFrame={0} color={AMBER} />

      {/* Pulse card with status badge */}
      <div style={{
        ...cardEnter,
        position: 'absolute',
        top: 220,
        left: 120,
        right: 120,
        background: BG_CARD,
        borderRadius: 20,
        border: `1px solid ${BORDER}`,
        padding: '30px 36px',
        fontFamily
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <Chip color={ORANGE} label="Pothole" icon={<IconPothole size={14} />} />
          <div style={{
            ...statusPop,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 14px',
            borderRadius: 8,
            background: AMBER,
            color: '#1a0e00',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <IconRefresh size={14} />
            In progress
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 18, fontSize: 14, color: TEXT_MUTE, marginLeft: 'auto' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconArrowUp size={14} />
              742
            </span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <IconComments size={14} />
              24
            </span>
          </span>
        </div>
        <div style={{
          fontSize: 28,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-0.015em'
        }}>Massive potholes on Main &amp; 9th — bent my rim last week</div>
      </div>

      {/* City Public Works notification */}
      <div style={{
        ...notifSlide,
        position: 'absolute',
        top: 480,
        left: 120,
        right: 120,
        background: `linear-gradient(135deg, ${BLUE}30, ${BG_CARD})`,
        borderRadius: 16,
        border: `1px solid ${BLUE}55`,
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: 18,
        fontFamily
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: BLUE,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <IconGlobe size={28} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 4 }}>City Public Works · Acknowledged</div>
          <div style={{ fontSize: 15, color: TEXT_MUTE }}>Scheduled for repaving this Friday.</div>
        </div>
      </div>

      {/* Public Works comment */}
      <div style={{
        ...commentSlide,
        position: 'absolute',
        top: 600,
        left: 120,
        right: 120,
        background: BG_CARD,
        borderRadius: 18,
        border: `1px solid ${BORDER}`,
        padding: '24px 28px',
        display: 'flex',
        gap: 18,
        fontFamily
      }}>
        <div style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          background: BLUE,
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          fontWeight: 800,
          flexShrink: 0
        }}>PW</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: TEXT }}>Public Works</span>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '2px 10px',
              borderRadius: 6,
              background: `${BLUE}22`,
              color: BLUE,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.04em'
            }}>
              <IconVerified size={11} />
              OFFICIAL
            </span>
          </div>
          <div style={{ fontSize: 17, color: TEXT_DIM, lineHeight: 1.5 }}>
            Thanks for flagging. Crew rolling out at 6am Friday. Avoid the area between 8th and 10th.
          </div>
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 4: Before/After wipe (17–23s) ─────────────────────────────────
const SceneFixed: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const photoEnter = useEnter(0, 26)
  const wipeProgress = interpolate(frame, [60, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: SMOOTH
  })
  const statusPop = usePop(132, 16)
  const labelBefore = interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const labelAfter = interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="Problems get fixed." startFrame={0} color={GREEN} />

      <div style={{
        ...photoEnter,
        position: 'absolute',
        top: 220,
        left: 120,
        right: 120,
        height: 640,
        borderRadius: 22,
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
        boxShadow: '0 16px 60px rgba(0,0,0,0.45)'
      }}>
        {/* BEFORE layer */}
        <div style={{ position: 'absolute', inset: 0 }}>
          <BeforePhoto style={{ width: '100%', height: '100%' }} />
        </div>
        {/* AFTER layer — clipped from the left by wipeProgress */}
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 0 ${(1 - wipeProgress) * 100}%)`
        }}>
          <AfterPhoto style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Wipe line */}
        {wipeProgress > 0 && wipeProgress < 1 && (
          <div style={{
            position: 'absolute',
            left: `${wipeProgress * 100}%`,
            top: 0,
            bottom: 0,
            width: 4,
            background: 'white',
            boxShadow: `0 0 24px white, 0 0 48px ${GREEN}aa`,
            transform: 'translateX(-2px)'
          }} />
        )}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 24,
          opacity: labelBefore,
          padding: '8px 16px',
          borderRadius: 8,
          background: 'rgba(0,0,0,0.7)',
          color: TEXT,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily
        }}>Before</div>
        <div style={{
          position: 'absolute',
          top: 24,
          right: 24,
          opacity: labelAfter,
          padding: '8px 16px',
          borderRadius: 8,
          background: GREEN,
          color: '#04210d',
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          fontFamily
        }}>After</div>
        <div style={{
          ...statusPop,
          position: 'absolute',
          bottom: 24,
          right: 24,
          padding: '10px 18px',
          borderRadius: 12,
          background: GREEN,
          color: '#04210d',
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily,
          boxShadow: `0 8px 28px ${GREEN}66`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10
        }}>
          <IconVerified size={16} />
          Resolved
        </div>
      </div>
    </AbsoluteFill>
  )
}

// ─── Scene 5: Compliment Pulse (23–27s) ──────────────────────────────────
const SceneCelebrate: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const cardEnter = useEnter(0, 22)
  const heartT1 = interpolate(frame, [40, 110], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SMOOTH })
  const heartT2 = interpolate(frame, [50, 120], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SMOOTH })
  const heartT3 = interpolate(frame, [60, 115], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SMOOTH })
  const heartT4 = interpolate(frame, [45, 105], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SMOOTH })
  const votes = useTicker(20, 47, 218, 80)

  const heartStyle = (t: number, dx: number): React.CSSProperties => ({
    position: 'absolute',
    bottom: 140 + t * 280,
    left: 960 + dx,
    opacity: interpolate(t, [0, 0.2, 0.85, 1], [0, 1, 1, 0]),
    transform: `translateX(${Math.sin(t * Math.PI) * 16}px)`,
    color: GREEN
  })

  return (
    <AbsoluteFill style={{ background: BG }}>
      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="And neighbors notice." startFrame={0} color={GREEN} />

      <div style={{
        ...cardEnter,
        position: 'absolute',
        top: 260,
        left: 240,
        right: 240,
        background: `linear-gradient(135deg, ${GREEN}10, ${BG_CARD})`,
        borderRadius: 22,
        border: `1.5px solid ${GREEN}55`,
        padding: '36px 40px',
        fontFamily,
        boxShadow: `0 16px 60px ${GREEN}22`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 22 }}>
          <Chip color={GREEN} label="Compliment" icon={<IconCompliment size={14} />} />
          <span style={{ fontSize: 14, color: TEXT_MUTE }}>· Main St &amp; 9th Ave</span>
        </div>

        <div style={{
          fontSize: 38,
          fontWeight: 800,
          color: TEXT,
          letterSpacing: '-0.02em',
          lineHeight: 1.2,
          marginBottom: 24
        }}>Public Works fixed Main &amp; 9th. Smooth as butter now.</div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 22px',
            borderRadius: 14,
            background: `${GREEN}22`,
            border: `1px solid ${GREEN}`,
            color: GREEN,
            fontSize: 24,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums'
          }}>
            <IconCompliment size={22} />
            {votes}
          </div>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 17, color: TEXT_MUTE }}>
            by Desiree W.
            <IconVerified size={15} style={{ color: GREEN }} />
            <span style={{ color: GREEN, fontWeight: 700 }}>Verified</span>
          </span>
        </div>
      </div>

      {/* Floating verified-check hearts (using compliment thumb icon for variety) */}
      <div style={heartStyle(heartT1, -260)}><IconCompliment size={64} /></div>
      <div style={heartStyle(heartT2, -80)}><IconCompliment size={56} /></div>
      <div style={heartStyle(heartT3, 140)}><IconCompliment size={60} /></div>
      <div style={heartStyle(heartT4, 280)}><IconCompliment size={52} /></div>
    </AbsoluteFill>
  )
}

// ─── End card (27–30s) ───────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame()
  const brandPop = usePop(0, 22)
  const titleSlide = useEnter(14, 22)
  const urlSlide = useEnter(24, 20)
  const ctaSlide = useEnter(36, 20)
  const pulseScale = interpolate(
    frame % 60,
    [0, 30, 60],
    [1, 1.06, 1],
    { easing: Easing.inOut(Easing.cubic) }
  )

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      padding: '120px 140px',
      fontFamily,
      background: BG
    }}>
      <div style={{ ...brandPop, marginBottom: 36 }}>
        <div style={{ transform: `scale(${pulseScale})` }}>
          <PulseLogo size={220} />
        </div>
      </div>
      <div style={{
        ...titleSlide,
        fontSize: 84,
        fontWeight: 800,
        color: TEXT,
        letterSpacing: '-0.03em',
        textAlign: 'center'
      }}>Your city.<br />Your voice.</div>
      <div style={{
        ...urlSlide,
        marginTop: 28,
        fontSize: 30,
        fontWeight: 700,
        color: TEXT_DIM,
        letterSpacing: '0.04em'
      }}>pulse-civic.vercel.app</div>
      <div style={{
        ...ctaSlide,
        marginTop: 32,
        background: PINK,
        color: 'white',
        padding: '22px 44px',
        borderRadius: 18,
        fontSize: 24,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        boxShadow: `0 12px 40px ${PINK_GLOW}`
      }}>Open Pulse →</div>
    </AbsoluteFill>
  )
}

// ─── Main ────────────────────────────────────────────────────────────────
export const PulsePromo: React.FC = () => (
  <AbsoluteFill style={{ background: BG, fontFamily }}>
    <Sequence from={0}   durationInFrames={180}><SceneOpen /></Sequence>
    <Sequence from={180} durationInFrames={210}><SceneClimb /></Sequence>
    <Sequence from={390} durationInFrames={120}><SceneListens /></Sequence>
    <Sequence from={510} durationInFrames={180}><SceneFixed /></Sequence>
    <Sequence from={690} durationInFrames={120}><SceneCelebrate /></Sequence>
    <Sequence from={810} durationInFrames={90}><EndCard /></Sequence>
  </AbsoluteFill>
)

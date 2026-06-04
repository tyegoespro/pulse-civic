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
const HAS_PHOTOS = true

// ─── App palette ─────────────────────────────────────────────────────────
const BG = '#0F0F1A'
const BG_CARD = '#1A1A2E'
const BG_DEEP = '#080812'
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

const ENTER = Easing.bezier(0.16, 1, 0.3, 1)
const SMOOTH = Easing.bezier(0.45, 0, 0.55, 1)
const SOFT_POP = Easing.bezier(0.34, 1.56, 0.64, 1)

// ─── Helpers ─────────────────────────────────────────────────────────────

const useEnter = (startFrame: number, durationFrames = 24) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER
  })
  return { opacity: t, transform: `translateY(${interpolate(t, [0, 1], [22, 0])}px)` }
}

const usePop = (startFrame: number, durationFrames = 18) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SOFT_POP
  })
  return {
    opacity: interpolate(t, [0, 0.5, 1], [0, 1, 1]),
    transform: `scale(${interpolate(t, [0, 1], [0.6, 1])})`
  }
}

const useTicker = (startFrame: number, fromValue: number, toValue: number, durationFrames = 30) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER
  })
  return Math.floor(fromValue + (toValue - fromValue) * t)
}

const fmtNum = (n: number) => n.toLocaleString('en-US')

// ─── Atmosphere atoms — present on every scene ──────────────────────────

const Vignette: React.FC<{ strength?: number }> = ({ strength = 0.55 }) => (
  <div style={{
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,${strength}) 100%)`,
    zIndex: 100
  }} />
)

// Floating dust particles — subtle background life
const Particles: React.FC<{ count?: number; opacity?: number }> = ({ count = 18, opacity = 0.18 }) => {
  const frame = useCurrentFrame()
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
      {Array.from({ length: count }).map((_, i) => {
        const seed = i * 137.5
        const baseX = (Math.sin(seed) * 0.5 + 0.5) * 1920
        const driftX = Math.sin((frame + seed) / 80) * 60
        const baseY = 1080 - ((frame * 0.4 + seed * 30) % 1200)
        const size = 2 + (i % 4)
        const alpha = opacity * (0.4 + 0.6 * Math.sin((frame + seed) / 40))
        return (
          <div key={i} style={{
            position: 'absolute',
            left: baseX + driftX,
            top: baseY,
            width: size,
            height: size,
            borderRadius: size,
            background: 'white',
            opacity: alpha,
            boxShadow: `0 0 ${size * 4}px rgba(255,255,255,${alpha})`
          }} />
        )
      })}
    </div>
  )
}

// Confetti burst — used at the "Resolved" celebration
const Confetti: React.FC<{ startFrame: number; x?: number; y?: number; color?: string }> = ({
  startFrame,
  x = 960,
  y = 540,
  color = GREEN
}) => {
  const frame = useCurrentFrame()
  const localFrame = frame - startFrame
  if (localFrame < 0 || localFrame > 100) return null
  const pieces = 24
  const colors = [color, PINK, AMBER, INDIGO, BLUE]
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 200 }}>
      {Array.from({ length: pieces }).map((_, i) => {
        const angle = (i / pieces) * Math.PI * 2
        const distance = interpolate(localFrame, [0, 60], [0, 400 + (i % 4) * 80], {
          extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)
        })
        const dropY = interpolate(localFrame, [0, 100], [0, 200], { extrapolateRight: 'clamp' })
        const rotate = (localFrame * 6 + i * 30) % 360
        const opacity = interpolate(localFrame, [0, 12, 80, 100], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
        return (
          <div key={i} style={{
            position: 'absolute',
            left: x + Math.cos(angle) * distance - 6,
            top: y + Math.sin(angle) * distance + dropY - 4,
            width: 12,
            height: 8,
            background: colors[i % colors.length],
            transform: `rotate(${rotate}deg)`,
            opacity,
            borderRadius: 1
          }} />
        )
      })}
    </div>
  )
}

// ─── Photos (Imagen-generated, falls back to SVG when HAS_PHOTOS = false) ─

const BeforePhoto: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  if (HAS_PHOTOS) {
    return <Img src={staticFile('photos/before.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }} />
  }
  return <SvgFallback color="#3a3a3a" hasHole style={style} />
}
const AfterPhoto: React.FC<{ style?: React.CSSProperties }> = ({ style }) => {
  if (HAS_PHOTOS) {
    return <Img src={staticFile('photos/after.jpg')} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }} />
  }
  return <SvgFallback color="#2a2a30" style={style} />
}
const SvgFallback: React.FC<{ color: string; hasHole?: boolean; style?: React.CSSProperties }> = ({ color, hasHole, style }) => (
  <svg viewBox="0 0 800 500" style={{ width: '100%', height: '100%', display: 'block', ...style }}>
    <rect width="800" height="170" fill="#3a4a5e" />
    <rect x="0" y="170" width="800" height="330" fill={color} />
    {hasHole && <ellipse cx="400" cy="370" rx="195" ry="92" fill="#000" />}
  </svg>
)

// Camera drift on a photo — slow pan + zoom (Ken Burns)
const KenBurns: React.FC<{ children: React.ReactNode; startFrame: number; durationFrames: number; intensity?: number }> = ({
  children, startFrame, durationFrames, intensity = 1
}) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SMOOTH
  })
  const scale = 1 + 0.08 * t * intensity
  const x = -8 * t * intensity
  const y = -4 * t * intensity
  return (
    <div style={{ width: '100%', height: '100%', overflow: 'hidden', transform: `translate(${x}px, ${y}px) scale(${scale})` }}>
      {children}
    </div>
  )
}

// Per-word reveal — splits a string into words, staggers entrance
const WordReveal: React.FC<{ text: string; startFrame: number; perWordStaggerFrames?: number; style?: React.CSSProperties }> = ({
  text, startFrame, perWordStaggerFrames = 4, style
}) => {
  const words = text.split(' ')
  return (
    <span style={{ display: 'inline-block', ...style }}>
      {words.map((w, i) => (
        <WordPiece key={i} text={w + (i < words.length - 1 ? ' ' : '')} startFrame={startFrame + i * perWordStaggerFrames} />
      ))}
    </span>
  )
}
const WordPiece: React.FC<{ text: string; startFrame: number }> = ({ text, startFrame }) => {
  const frame = useCurrentFrame()
  const t = interpolate(frame, [startFrame, startFrame + 18], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER
  })
  return (
    <span style={{
      display: 'inline-block',
      opacity: t,
      transform: `translateY(${interpolate(t, [0, 1], [16, 0])}px)`,
      filter: `blur(${interpolate(t, [0, 1], [6, 0])}px)`,
      whiteSpace: 'pre'
    }}>{text}</span>
  )
}

// Number with glow halo when changing
const GlowNumber: React.FC<{ value: number; color: string; size: number; weight?: number }> = ({ value, color, size, weight = 800 }) => {
  return (
    <span style={{
      fontSize: size,
      fontWeight: weight,
      color,
      fontVariantNumeric: 'tabular-nums',
      letterSpacing: '-0.02em',
      textShadow: `0 0 ${size * 0.5}px ${color}66, 0 0 ${size * 1.2}px ${color}33`
    }}>{fmtNum(value)}</span>
  )
}

// "+N" floating indicator
const VotePop: React.FC<{ value: number; startFrame: number; x: number; y: number; color?: string }> = ({
  value, startFrame, x, y, color = PINK
}) => {
  const frame = useCurrentFrame()
  const local = frame - startFrame
  if (local < 0 || local > 50) return null
  const t = interpolate(local, [0, 50], [0, 1], { extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic) })
  const opacity = interpolate(local, [0, 6, 40, 50], [0, 1, 1, 0], { extrapolateRight: 'clamp' })
  return (
    <div style={{
      position: 'absolute',
      left: x,
      top: y - t * 80,
      fontSize: 22,
      fontWeight: 800,
      color,
      opacity,
      letterSpacing: '-0.01em',
      pointerEvents: 'none',
      textShadow: `0 0 12px ${color}aa`,
      fontFamily,
      transform: `scale(${interpolate(t, [0, 0.3, 1], [0.5, 1.1, 1])})`
    }}>+{value}</div>
  )
}

// ─── App header ──────────────────────────────────────────────────────────
const AppHeader: React.FC = () => {
  const frame = useCurrentFrame()
  const dotPulse = interpolate(frame % 60, [0, 30, 60], [1, 1.3, 1], { easing: Easing.inOut(Easing.cubic) })
  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      padding: '28px 64px 22px',
      borderBottom: `1px solid ${BORDER}`,
      background: `linear-gradient(180deg, ${BG} 0%, rgba(15,15,26,0.96) 100%)`,
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontFamily,
      zIndex: 80
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ transform: `scale(${dotPulse})` }}>
          <PulseLogo size={36} />
        </div>
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
        letterSpacing: '0.04em',
        boxShadow: `0 0 24px ${GREEN}22`
      }}>
        <IconVerified size={14} />
        <span>Verified resident</span>
      </div>
    </div>
  )
}

const Caption: React.FC<{ text: string; color?: string; startFrame: number }> = ({
  text, color = PINK, startFrame
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
      textTransform: 'uppercase',
      zIndex: 70,
      textShadow: `0 0 16px ${color}66`
    }}>
      <span style={{ display: 'inline-block', width: 36, height: 2, background: color, verticalAlign: 'middle', marginRight: 14, boxShadow: `0 0 12px ${color}` }} />
      {text}
    </div>
  )
}

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
  // Fullscreen photo fully gone by frame 90 — no lingering behind the card.
  const fullscreenFade = interpolate(frame, [72, 90], [1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: SMOOTH
  })
  const photoScale = interpolate(pullback, [0, 1], [1, 0.36])
  const photoTranslateX = interpolate(pullback, [0, 1], [0, -540])
  const photoTranslateY = interpolate(pullback, [0, 1], [0, 60])

  const headerFade = interpolate(frame, [60, 90], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const cardChromeFade = interpolate(frame, [70, 100], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const tickerVotes = useTicker(118, 11, 12, 14)

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Particles count={14} opacity={0.12} />

      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="Post what you see." startFrame={100} />

      {/* Fullscreen photo — fades out as it lands in the card */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0,
        width: 1920, height: 1080,
        opacity: photoFade * fullscreenFade,
        transform: `translate(${photoTranslateX}px, ${photoTranslateY}px) scale(${photoScale})`,
        transformOrigin: 'center center',
        pointerEvents: 'none'
      }}>
        <KenBurns startFrame={0} durationFrames={90} intensity={0.6}>
          <BeforePhoto />
        </KenBurns>
        {/* Photo-specific vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)',
          pointerEvents: 'none'
        }} />
      </div>

      {/* Card chrome */}
      <div style={{
        position: 'absolute',
        top: 240,
        left: 120,
        right: 120,
        background: BG_CARD,
        borderRadius: 22,
        border: `1px solid ${BORDER}`,
        padding: '32px 36px',
        boxShadow: `0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px ${BORDER}, inset 0 1px 0 rgba(255,255,255,0.04)`,
        opacity: cardChromeFade,
        fontFamily
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <Chip color={ORANGE} label="Pothole" icon={<IconPothole size={14} />} />
          <span style={{ fontSize: 16, color: TEXT_MUTE }}>· Main St &amp; 9th Ave</span>
        </div>

        <div style={{
          fontSize: 30, fontWeight: 800, color: TEXT,
          marginBottom: 22, letterSpacing: '-0.015em', lineHeight: 1.25
        }}>Massive potholes on Main &amp; 9th — bent my rim last week</div>

        <div style={{
          width: '100%',
          height: 480,
          borderRadius: 14,
          background: '#000',
          overflow: 'hidden',
          marginBottom: 22,
          opacity: cardChromeFade,
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.04)'
        }}>
          {frame > 95 && <KenBurns startFrame={95} durationFrames={90} intensity={0.4}><BeforePhoto /></KenBurns>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 18px',
            borderRadius: 12,
            background: `${PINK}1A`,
            border: `1px solid ${PINK}55`,
            color: PINK,
            fontSize: 22,
            fontWeight: 800,
            fontVariantNumeric: 'tabular-nums',
            boxShadow: `0 0 24px ${PINK}33`
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

      <Vignette strength={0.45} />
    </AbsoluteFill>
  )
}

// ─── Scene 2: Real leaderboard battle (6–13s) ───────────────────────────
// All Pulses get votes — the hero just gets MORE. Each Pulse has a series
// of "vote moments" — frame where it ticks up by N. Position is derived
// from current votes, so cards physically reshuffle as the battle plays out.

const FEED_CARD_HEIGHT = 162
const FEED_CARD_GAP = 16
const SCENE_CLIMB_LENGTH = 210

// Each Pulse: timeline of [frame, deltaVotes] pairs. Frames are scene-local.
type Vote = [number, number]
const FEED_TIMELINE: Array<{
  id: string; title: string; cat: string; catColor: string; start: number; votes: Vote[]; hero?: boolean
}> = [
  { id: 'a', title: 'Streetlight out on Elm for 3 weeks', cat: 'Safety', catColor: PINK, start: 89, votes: [[35,4],[60,3],[95,5],[130,3]] },
  { id: 'b', title: 'Crosswalk paint faded near the school', cat: 'Safety', catColor: PINK, start: 67, votes: [[40,3],[80,4],[125,3]] },
  { id: 'c', title: 'Trash pickup missed for 3 weeks', cat: 'Other', catColor: TEXT_MUTE, start: 45, votes: [[50,2],[110,3]] },
  { id: 'd', title: 'Bus stop bench fell over', cat: 'Transit', catColor: BLUE, start: 32, votes: [[55,2],[140,4]] },
  { id: 'hero', title: 'Massive potholes on Main & 9th', cat: 'Pothole', catColor: ORANGE, start: 12, votes: [
    [25,18], [45,42], [65,78], [85,128], [105,165], [125,140], [150,120], [170,55]
  ], hero: true }
]

const votesAt = (timeline: typeof FEED_TIMELINE[number], frame: number): number => {
  let total = timeline.start
  for (const [voteFrame, delta] of timeline.votes) {
    if (frame >= voteFrame) {
      const t = Math.min(1, (frame - voteFrame) / 8)
      total += Math.floor(delta * t)
    }
  }
  return total
}

// Precompute rank for every Pulse at every frame — used by FeedCard to lerp
// position smoothly when ranks change (CSS transitions don't render).
const rankHistory: Record<string, number[]> = {}
for (const t of FEED_TIMELINE) rankHistory[t.id] = new Array(SCENE_CLIMB_LENGTH)
for (let f = 0; f < SCENE_CLIMB_LENGTH; f++) {
  const live = FEED_TIMELINE.map(t => ({ ...t, _v: votesAt(t, f) }))
  const ranked = [...live].sort((a, b) => b._v - a._v)
  ranked.forEach((p, i) => { rankHistory[p.id][f] = i })
}

const SMOOTH_FRAMES = 14
const smoothedRank = (id: string, frame: number): number => {
  const f = Math.max(0, Math.min(SCENE_CLIMB_LENGTH - 1, frame))
  const current = rankHistory[id][f]
  // Walk back to find the frame where the current rank was first reached
  let changeFrame = f
  for (let i = f; i > Math.max(0, f - SMOOTH_FRAMES); i--) {
    if (rankHistory[id][i - 1] !== current) { changeFrame = i; break }
    if (i === 1) changeFrame = 0
  }
  if (f - changeFrame >= SMOOTH_FRAMES - 1) return current
  const oldRank = changeFrame > 0 ? rankHistory[id][changeFrame - 1] : current
  if (oldRank === current) return current
  const t = (f - changeFrame + 1) / SMOOTH_FRAMES
  const eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
  return oldRank * (1 - eased) + current * eased
}

const SceneClimb: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = interpolate(frame, [0, 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })

  const live = FEED_TIMELINE.map(t => ({
    ...t,
    currentVotes: votesAt(t, frame),
    smoothRank: smoothedRank(t.id, frame)
  }))
  const intRankById: Record<string, number> = {}
  const rankedNow = [...live].sort((a, b) => b.currentVotes - a.currentVotes)
  rankedNow.forEach((p, i) => { intRankById[p.id] = i })

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Particles count={16} opacity={0.14} />

      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="When neighbors agree." startFrame={0} />

      <div style={{ position: 'absolute', top: 220, left: 120, right: 120 }}>
        {live.map(p => (
          <FeedCard
            key={p.id}
            smoothRank={p.smoothRank}
            intRank={intRankById[p.id]}
            title={p.title}
            cat={p.cat}
            catColor={p.catColor}
            votes={p.currentVotes}
            hero={!!p.hero}
            celebrate={p.hero && intRankById[p.id] === 0 && frame > 110}
          />
        ))}
        {/* Floating "+N" indicators — anchored to each card's CURRENT position
            so they ride along when the card reshuffles. */}
        {live.flatMap((p) =>
          p.votes.map(([voteFrame, delta], i) => (
            <VotePop
              key={`${p.id}-${i}`}
              value={delta}
              startFrame={voteFrame}
              x={130}
              y={20 + p.smoothRank * (FEED_CARD_HEIGHT + FEED_CARD_GAP)}
              color={p.hero ? PINK : p.catColor}
            />
          ))
        )}
      </div>

      <Vignette strength={0.4} />
    </AbsoluteFill>
  )
}

const FeedCard: React.FC<{
  smoothRank: number
  intRank: number
  title: string
  cat: string
  catColor: string
  votes: number
  hero: boolean
  celebrate: boolean
}> = ({ smoothRank, intRank, title, cat, catColor, votes, hero, celebrate }) => {
  const targetY = smoothRank * (FEED_CARD_HEIGHT + FEED_CARD_GAP)
  return (
    <div style={{
      position: 'absolute',
      top: targetY,
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
      boxShadow: hero && celebrate
        ? `0 16px 60px ${PINK_GLOW}, 0 0 0 1px ${PINK}55, inset 0 1px 0 rgba(255,255,255,0.06)`
        : '0 6px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.03)'
    }}>
      {/* Rank pill */}
      <div style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        background: hero && celebrate ? PINK : 'rgba(255,255,255,0.05)',
        border: hero && celebrate ? `1px solid ${PINK}` : `1px solid ${BORDER_STRONG}`,
        color: hero && celebrate ? 'white' : TEXT_MUTE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 18,
        fontWeight: 800,
        flexShrink: 0
      }}>{intRank + 1}</div>

      {/* Vote pill */}
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
        border: hero && celebrate ? `1px solid ${PINK}` : `1px solid ${BORDER_STRONG}`,
        boxShadow: hero && celebrate ? `inset 0 0 16px ${PINK}22` : 'none'
      }}>
        <GlowNumber value={votes} color={hero && celebrate ? PINK : TEXT} size={30} />
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
              textTransform: 'uppercase',
              boxShadow: `0 0 24px ${PINK}88`
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
}

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
      <Particles count={14} opacity={0.12} />

      <div style={{ opacity: headerFade }}>
        <AppHeader />
      </div>
      <Caption text="The city listens." startFrame={0} color={AMBER} />

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
        fontFamily,
        boxShadow: '0 16px 60px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.04)'
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
            textTransform: 'uppercase',
            boxShadow: `0 0 24px ${AMBER}55`
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
        fontFamily,
        boxShadow: `0 12px 40px ${BLUE}22`
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
          flexShrink: 0,
          boxShadow: `0 0 24px ${BLUE}66`
        }}>
          <IconGlobe size={28} />
        </div>
        <div>
          <div style={{ fontSize: 18, fontWeight: 800, color: TEXT, marginBottom: 4 }}>City Public Works · Acknowledged</div>
          <div style={{ fontSize: 15, color: TEXT_MUTE }}>Scheduled for repaving this Friday.</div>
        </div>
      </div>

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
        fontFamily,
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)'
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
          flexShrink: 0,
          boxShadow: `0 0 18px ${BLUE}66`
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

      <Vignette strength={0.42} />
    </AbsoluteFill>
  )
}

// ─── Scene 4: Before/After wipe (17–23s) ────────────────────────────────
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
      <Particles count={14} opacity={0.12} />

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
        boxShadow: '0 24px 80px rgba(0,0,0,0.55), inset 0 0 0 1px rgba(255,255,255,0.06)'
      }}>
        <div style={{ position: 'absolute', inset: 0 }}>
          <KenBurns startFrame={0} durationFrames={180} intensity={0.4}>
            <BeforePhoto style={{ width: '100%', height: '100%' }} />
          </KenBurns>
        </div>
        <div style={{
          position: 'absolute',
          inset: 0,
          clipPath: `inset(0 0 0 ${(1 - wipeProgress) * 100}%)`
        }}>
          <KenBurns startFrame={0} durationFrames={180} intensity={0.4}>
            <AfterPhoto style={{ width: '100%', height: '100%' }} />
          </KenBurns>
        </div>
        {wipeProgress > 0 && wipeProgress < 1 && (
          <>
            <div style={{
              position: 'absolute',
              left: `${wipeProgress * 100}%`,
              top: 0,
              bottom: 0,
              width: 6,
              background: 'white',
              boxShadow: `0 0 32px white, 0 0 64px ${GREEN}, 0 0 96px ${GREEN}aa`,
              transform: 'translateX(-3px)'
            }} />
            {/* Sparkle particles trailing the wipe line */}
            {Array.from({ length: 8 }).map((_, i) => {
              const py = 60 + (i / 7) * 520 + Math.sin((frame + i * 12) / 10) * 8
              return (
                <div key={i} style={{
                  position: 'absolute',
                  left: `calc(${wipeProgress * 100}% - 3px)`,
                  top: py,
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  background: 'white',
                  boxShadow: `0 0 8px white, 0 0 16px ${GREEN}`,
                  opacity: 0.9
                }} />
              )
            })}
          </>
        )}
        <div style={{
          position: 'absolute',
          top: 24,
          left: 24,
          opacity: labelBefore,
          padding: '10px 18px',
          borderRadius: 10,
          background: 'rgba(0,0,0,0.78)',
          backdropFilter: 'blur(8px)',
          color: TEXT,
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontFamily,
          border: '1px solid rgba(255,255,255,0.12)'
        }}>Before</div>
        <div style={{
          position: 'absolute',
          top: 24,
          right: 24,
          opacity: labelAfter,
          padding: '10px 18px',
          borderRadius: 10,
          background: GREEN,
          color: '#04210d',
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontFamily,
          boxShadow: `0 8px 32px ${GREEN}77`
        }}>After</div>
        <div style={{
          ...statusPop,
          position: 'absolute',
          bottom: 24,
          right: 24,
          padding: '12px 22px',
          borderRadius: 14,
          background: GREEN,
          color: '#04210d',
          fontSize: 16,
          fontWeight: 800,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          fontFamily,
          boxShadow: `0 12px 40px ${GREEN}88`,
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10
        }}>
          <IconVerified size={16} />
          Resolved
        </div>
      </div>

      {/* Celebration confetti when Resolved pops */}
      <Confetti startFrame={132} x={1660} y={760} color={GREEN} />

      <Vignette strength={0.4} />
    </AbsoluteFill>
  )
}

// ─── Scene 5: Compliment Pulse (23–27s) ──────────────────────────────────
const SceneCelebrate: React.FC = () => {
  const frame = useCurrentFrame()
  const headerFade = interpolate(frame, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ENTER })
  const cardEnter = useEnter(0, 22)
  const votes = useTicker(20, 47, 218, 80)

  // Multiple floating reactions with varied sizes, speeds, drifts
  const reactions = [
    { startX: -260, startFrame: 22, size: 64, speed: 1.0 },
    { startX: -80, startFrame: 30, size: 52, speed: 1.3 },
    { startX: 100, startFrame: 26, size: 60, speed: 0.9 },
    { startX: 240, startFrame: 38, size: 48, speed: 1.2 },
    { startX: -180, startFrame: 50, size: 56, speed: 1.1 },
    { startX: 180, startFrame: 60, size: 44, speed: 1.4 },
    { startX: 0, startFrame: 70, size: 50, speed: 1.0 }
  ]

  return (
    <AbsoluteFill style={{ background: BG }}>
      <Particles count={14} opacity={0.12} />

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
        background: `linear-gradient(135deg, ${GREEN}15, ${BG_CARD})`,
        borderRadius: 22,
        border: `1.5px solid ${GREEN}66`,
        padding: '36px 40px',
        fontFamily,
        boxShadow: `0 24px 80px ${GREEN}33, 0 0 0 1px ${GREEN}22, inset 0 1px 0 rgba(255,255,255,0.06)`
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
        }}>
          <WordReveal text="Public Works fixed Main & 9th. Smooth as butter now." startFrame={20} perWordStaggerFrames={3} />
        </div>

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
            fontVariantNumeric: 'tabular-nums',
            boxShadow: `0 0 28px ${GREEN}55`
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

      {/* Floating compliment icons — varied sizes, drift paths, rotations */}
      {reactions.map((r, i) => {
        const local = frame - r.startFrame
        if (local < 0) return null
        const t = Math.min(1, local / (60 * r.speed))
        const bottom = 140 + t * 320 * r.speed
        const sideways = Math.sin((local + i * 25) / 22) * 22
        const rot = Math.sin((local + i * 17) / 20) * 12
        const opacity = interpolate(t, [0, 0.18, 0.82, 1], [0, 1, 1, 0])
        return (
          <div key={i} style={{
            position: 'absolute',
            bottom,
            left: 960 + r.startX + sideways,
            color: GREEN,
            opacity,
            filter: `drop-shadow(0 0 12px ${GREEN}88)`,
            transform: `rotate(${rot}deg)`
          }}>
            <IconCompliment size={r.size} />
          </div>
        )
      })}

      <Vignette strength={0.38} />
    </AbsoluteFill>
  )
}

// ─── End card (27–30s) ───────────────────────────────────────────────────
const EndCard: React.FC = () => {
  const frame = useCurrentFrame()
  const brandPop = usePop(0, 22)
  const urlSlide = useEnter(24, 20)
  const ctaSlide = useEnter(36, 20)
  // Continuous breathing on the logo + subtle scan shimmer on the CTA
  const pulseScale = interpolate(frame % 60, [0, 30, 60], [1, 1.06, 1], { easing: Easing.inOut(Easing.cubic) })
  const haloOpacity = interpolate(frame % 60, [0, 30, 60], [0.4, 0.8, 0.4], { easing: Easing.inOut(Easing.cubic) })
  const shimmerX = interpolate(frame % 90, [0, 90], [-200, 600], { easing: Easing.linear })

  return (
    <AbsoluteFill style={{
      justifyContent: 'center',
      alignItems: 'center',
      padding: '120px 140px',
      fontFamily,
      background: `radial-gradient(ellipse at center, ${BG} 0%, ${BG_DEEP} 100%)`
    }}>
      <Particles count={24} opacity={0.18} />

      <div style={{ ...brandPop, marginBottom: 36, position: 'relative' }}>
        {/* Halo behind the logo */}
        <div style={{
          position: 'absolute',
          inset: -60,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${PINK}33 0%, transparent 70%)`,
          opacity: haloOpacity
        }} />
        <div style={{ transform: `scale(${pulseScale})`, position: 'relative' }}>
          <PulseLogo size={220} />
        </div>
      </div>

      {/* Headline — per-word reveal */}
      <div style={{
        fontSize: 96,
        fontWeight: 800,
        color: TEXT,
        letterSpacing: '-0.035em',
        textAlign: 'center',
        lineHeight: 1.05
      }}>
        <div><WordReveal text="Your city." startFrame={14} perWordStaggerFrames={4} /></div>
        <div><WordReveal text="Your voice." startFrame={22} perWordStaggerFrames={4} /></div>
      </div>

      <div style={{
        ...urlSlide,
        marginTop: 32,
        fontSize: 30,
        fontWeight: 700,
        color: TEXT_DIM,
        letterSpacing: '0.04em',
        textShadow: `0 0 24px ${PINK}33`
      }}>pulse-civic.vercel.app</div>

      <div style={{
        ...ctaSlide,
        marginTop: 36,
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 18,
        background: PINK,
        color: 'white',
        padding: '24px 48px',
        fontSize: 26,
        fontWeight: 800,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        boxShadow: `0 16px 50px ${PINK}aa, inset 0 1px 0 rgba(255,255,255,0.25)`
      }}>
        Open Pulse →
        {/* Shimmer sweep */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: shimmerX,
          width: 100,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
          transform: 'skewX(-20deg)'
        }} />
      </div>

      <Vignette strength={0.55} />
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

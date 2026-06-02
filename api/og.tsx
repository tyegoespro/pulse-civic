// =============================================================================
// /api/og?id=<post-id>
// Generates a 1200×630 social card for a single Pulse on the fly.
// Renders via @vercel/og (uses Satori under the hood — JSX-like syntax).
// =============================================================================

import { ImageResponse } from '@vercel/og'

export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const CATEGORY_LABELS = {
  pothole: 'Potholes', safety: 'Safety', noise: 'Noise', parks: 'Parks',
  transit: 'Transit', housing: 'Housing', business: 'Business', compliment: 'Compliment',
  other: 'Other', education: 'Education', healthcare: 'Healthcare',
  infrastructure: 'Infrastructure', environment: 'Environment',
  'state-budget': 'State Budget', legislation: 'Legislation', elections: 'Elections',
  'housing-policy': 'Housing Policy', 'other-state': 'Other'
}

const CATEGORY_COLORS = {
  pothole: '#FF6B35', safety: '#FF3366', noise: '#A855F7', parks: '#22C55E',
  transit: '#3B82F6', housing: '#F59E0B', business: '#EC4899', compliment: '#10B981',
  other: '#6B7280', education: '#6366F1', healthcare: '#EF4444',
  infrastructure: '#F59E0B', environment: '#22C55E', 'state-budget': '#D97706',
  legislation: '#8B5CF6', elections: '#3B82F6', 'housing-policy': '#EC4899',
  'other-state': '#6B7280'
}

const formatVotes = (n) => {
  if (n == null) return '0'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

// ─── Editorial landing card ────────────────────────────────────────────
// Used for the root domain, /?landing=1, and any link that doesn't carry a
// Pulse id. Matches the Space Mono / paper / Pulse-pink design language of
// the actual landing page so the share preview feels like the same product.
const renderLandingCard = () => (
  <div
    style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#FAFAF7',
      padding: '52px 64px',
      fontFamily: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, Consolas, monospace',
      color: '#09090B',
      position: 'relative',
      borderTop: '6px solid #FF3366'
    }}
  >
    {/* Top row — brand + dateline */}
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <svg width="48" height="48" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="7" fill="#09090B" />
          <polyline
            points="4,18 9,18 12,10 16,22 20,14 23,18 28,18"
            fill="none"
            stroke="#FF3366"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div style={{
          display: 'flex',
          fontSize: 38,
          fontWeight: 700,
          color: '#09090B',
          letterSpacing: '-0.04em'
        }}>PULSE</div>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 15,
        fontWeight: 700,
        color: '#52525B',
        textTransform: 'uppercase',
        letterSpacing: '0.22em'
      }}>
        <span>Oshkosh, WI</span>
        <span style={{ opacity: 0.4 }}>·</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: 5, background: '#22C55E' }} />
          <span>Live</span>
        </div>
      </div>
    </div>

    {/* Headline — the same one used on the landing hero */}
    <div style={{
      display: 'flex',
      marginTop: 64,
      fontSize: 76,
      fontWeight: 700,
      color: '#09090B',
      lineHeight: 0.96,
      letterSpacing: '-0.04em',
      maxWidth: 1040
    }}>
      The same twelve people show up to every council meeting.
    </div>

    {/* Footer row */}
    <div style={{
      display: 'flex',
      marginTop: 'auto',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      paddingTop: 28,
      borderTop: '1px solid #09090B33'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        fontSize: 15,
        color: '#52525B',
        textTransform: 'uppercase',
        letterSpacing: '0.18em',
        fontWeight: 700,
        gap: 6
      }}>
        <span>Verified residents only.</span>
        <span>No bots. No ads. Ever.</span>
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: '#FF3366',
        color: '#FAFAF7',
        padding: '16px 26px',
        fontSize: 17,
        fontWeight: 700,
        letterSpacing: '0.06em',
        textTransform: 'uppercase'
      }}>
        Make sure it's being heard →
      </div>
    </div>
  </div>
)

// ─── Per-Pulse card (existing) ─────────────────────────────────────────
const renderPostCard = (post) => {
  const title = post?.title || 'Pulse — The Voice of Your City'
  const category = post?.category
  const catLabel = CATEGORY_LABELS[category] || (post?.scope === 'state' ? 'Wisconsin' : 'Oshkosh, WI')
  const catColor = CATEGORY_COLORS[category] || '#FF3366'
  const votes = formatVotes(post?.vote_count)
  const comments = formatVotes(post?.comment_count)
  const author = post?.is_incognito ? 'Anonymous' : (post?.seed_author || 'Verified resident')
  const location = post?.location_label || (post?.scope === 'state' ? 'Statewide' : 'Local')
  const isQuestion = post?.type === 'question'

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #0F0F1A 0%, #1A0F24 50%, #2A0F30 100%)',
        padding: '64px 72px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#E5E7EB',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{
          width: 56, height: 56, borderRadius: 28, background: '#FF3366',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 32, fontWeight: 800, color: 'white'
        }}>P</div>
        <div style={{ display: 'flex', fontSize: 36, fontWeight: 800, color: 'white', letterSpacing: -1 }}>
          Pulse
        </div>
        <div style={{
          display: 'flex', marginLeft: 'auto', padding: '10px 18px', borderRadius: 14,
          background: `${catColor}22`, border: `2px solid ${catColor}66`,
          color: catColor, fontSize: 22, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1
        }}>
          {isQuestion ? `Question · ${catLabel}` : catLabel}
        </div>
      </div>

      <div style={{
        display: 'flex', marginTop: 56, fontSize: 64, fontWeight: 800,
        color: 'white', lineHeight: 1.1, letterSpacing: -1.5
      }}>
        {title.length > 110 ? title.slice(0, 107) + '…' : title}
      </div>

      <div style={{
        display: 'flex', marginTop: 'auto', alignItems: 'center', gap: 32,
        paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px',
          borderRadius: 16, background: 'rgba(255,51,102,0.12)',
          border: '2px solid rgba(255,51,102,0.4)', color: '#FF3366',
          fontSize: 28, fontWeight: 800
        }}>
          <span>▲</span>
          <span>{votes}</span>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '14px 22px',
          borderRadius: 16, background: 'rgba(255,255,255,0.05)',
          border: '2px solid rgba(255,255,255,0.15)', color: '#E5E7EB',
          fontSize: 26, fontWeight: 700
        }}>
          <span>{isQuestion ? 'Answers' : 'Replies'}</span>
          <span>{comments}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', marginLeft: 'auto', alignItems: 'flex-end' }}>
          <div style={{ display: 'flex', fontSize: 24, fontWeight: 700, color: 'white' }}>{author}</div>
          <div style={{ display: 'flex', fontSize: 20, color: '#9CA3AF', marginTop: 4 }}>{location}</div>
        </div>
      </div>
    </div>
  )
}

export default async function handler(req) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')

  let post = null
  if (id && SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}&select=title,description,category,scope,vote_count,comment_count,location_label,seed_author,is_incognito,type`,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            authorization: `Bearer ${SUPABASE_ANON_KEY}`
          }
        }
      )
      if (res.ok) {
        const rows = await res.json()
        post = Array.isArray(rows) && rows.length ? rows[0] : null
      }
    } catch {
      // fall through to landing variant
    }
  }

  return new ImageResponse(
    post ? renderPostCard(post) : renderLandingCard(),
    {
      width: 1200,
      height: 630,
      headers: {
        'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400'
      }
    }
  )
}

// =============================================================================
// /api/preview?id=<post-id>
// Vercel rewrites /p/:id → /api/preview?id=:id.
// Returns HTML containing Open Graph tags so iMessage/Slack/Twitter/etc. show a
// rich preview card. Human visitors immediately redirect into the SPA.
// =============================================================================

export const config = { runtime: 'edge' }

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY

const escapeHtml = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

const fallbackHtml = (origin) => `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8" />
<meta property="og:title" content="Pulse — The Voice of Your City" />
<meta property="og:description" content="Verified civic engagement. Real citizens. Real issues. Real change." />
<meta property="og:image" content="${origin}/og-image.png" />
<meta property="og:url" content="${origin}" />
<meta name="twitter:card" content="summary_large_image" />
<title>Pulse</title>
<meta http-equiv="refresh" content="0; url=${origin}" />
</head><body><a href="${origin}">Open Pulse</a></body></html>`

export default async function handler(req) {
  const url = new URL(req.url)
  const id = url.searchParams.get('id')
  const origin = `${url.protocol}//${url.host}`

  if (!id || !SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return new Response(fallbackHtml(origin), {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
  }

  // Fetch the post via Supabase REST. Posts are public per RLS.
  let post = null
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/posts?id=eq.${encodeURIComponent(id)}&select=id,title,description,category,scope,vote_count,comment_count,location_label,seed_author,is_incognito,type`,
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
  } catch (err) {
    // Fall through to fallback.
  }

  if (!post) {
    return new Response(fallbackHtml(origin), {
      headers: { 'content-type': 'text/html; charset=utf-8' }
    })
  }

  const title = post.title || 'Pulse'
  const description = (post.description || '').slice(0, 200)
  const ogImage = `${origin}/api/og?id=${encodeURIComponent(id)}`
  const canonical = `${origin}/p/${encodeURIComponent(id)}`
  const appUrl = `${origin}/?post=${encodeURIComponent(id)}`

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${escapeHtml(title)} · Pulse</title>
<meta name="description" content="${escapeHtml(description)}" />

<!-- Open Graph -->
<meta property="og:type" content="article" />
<meta property="og:title" content="${escapeHtml(title)}" />
<meta property="og:description" content="${escapeHtml(description)}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:url" content="${canonical}" />
<meta property="og:site_name" content="Pulse" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(title)}" />
<meta name="twitter:description" content="${escapeHtml(description)}" />
<meta name="twitter:image" content="${ogImage}" />

<!-- Auto-redirect humans into the SPA -->
<meta http-equiv="refresh" content="0; url=${appUrl}" />
<link rel="canonical" href="${canonical}" />

<style>
  html,body { margin:0; background:#0F0F1A; color:#E5E7EB; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; }
  .center { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; text-align:center; }
  a { color:#FF3366; text-decoration:none; font-weight:700; }
</style>
</head>
<body>
<div class="center">
  <div>
    <p>Opening Pulse…</p>
    <p><a href="${appUrl}">Tap here if it doesn't load</a></p>
  </div>
</div>
<script>window.location.replace(${JSON.stringify(appUrl)});</script>
</body>
</html>`

  return new Response(html, {
    headers: {
      'content-type': 'text/html; charset=utf-8',
      // Cache shareable previews on the CDN for 10 min — fresh enough, fast enough.
      'cache-control': 'public, s-maxage=600, stale-while-revalidate=86400'
    }
  })
}

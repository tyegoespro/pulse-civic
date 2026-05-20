// ============================================================================
// Pulse — service worker
// Handles Web Push notifications and a minimal app-shell cache so the PWA
// still renders something useful when the device is briefly offline.
// ============================================================================

const VERSION = 'pulse-sw-v1'
const SHELL_CACHE = `${VERSION}-shell`

const APP_SHELL = [
  '/',
  '/manifest.json',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
]

// ---------- Install: prime the shell cache ---------------------------------
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE).then(cache => cache.addAll(APP_SHELL)).catch(() => {})
  )
  self.skipWaiting()
})

// ---------- Activate: drop old versions ------------------------------------
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== SHELL_CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

// ---------- Fetch: network-first for navigation, cache fallback ------------
self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  // Only intercept same-origin navigation requests — leave API calls,
  // Supabase, the OG endpoints, etc. completely alone.
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then(res => {
          caches.open(SHELL_CACHE).then(cache => cache.put(req, res.clone())).catch(() => {})
          return res
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/')))
    )
  }
})

// ---------- Push: render an OS notification --------------------------------
self.addEventListener('push', (event) => {
  let payload = {}
  try {
    payload = event.data?.json() || {}
  } catch {
    payload = { title: 'Pulse', body: event.data?.text() || '' }
  }
  const title = payload.title || 'Pulse'
  const options = {
    body: payload.body || '',
    icon: '/icon-192.svg',
    badge: '/favicon.svg',
    tag: payload.tag || payload.notification_id || 'pulse',
    data: {
      url: payload.url || '/',
      post_id: payload.post_id || null,
      notification_id: payload.notification_id || null
    },
    requireInteraction: false
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// ---------- Click: focus or open the right tab -----------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const data = event.notification.data || {}
  const url = data.post_id ? `/?post=${data.post_id}` : (data.url || '/')
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const client of all) {
      try {
        const u = new URL(client.url)
        if (u.origin === self.location.origin) {
          await client.focus()
          // Hand off the URL via postMessage so the SPA can react immediately
          // (open the post detail) without a hard navigation.
          client.postMessage({ type: 'pulse:notification-click', data })
          return
        }
      } catch {}
    }
    await self.clients.openWindow(url)
  })())
})

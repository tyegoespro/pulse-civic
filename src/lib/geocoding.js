// Geocoding via OpenStreetMap Nominatim. Free, keyless, ~1 req/sec policy.
// Reverse (pin → address) fires on drag-end. Forward (address → pin) fires on
// debounced text input. Both are best-effort; if the request fails we leave
// the UI alone.

const ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'
const SEARCH_ENDPOINT = 'https://nominatim.openstreetmap.org/search'

export async function reverseGeocode(lat, lng) {
  try {
    const url = `${ENDPOINT}?lat=${lat}&lon=${lng}&format=json&zoom=18&addressdetails=1`
    const r = await fetch(url, { headers: { 'Accept-Language': 'en' } })
    if (!r.ok) return null
    const data = await r.json()
    return formatAddress(data)
  } catch {
    return null
  }
}

function formatAddress(data) {
  const a = data?.address || {}
  const road = a.road || a.pedestrian || a.path || a.cycleway
  const number = a.house_number
  const area = a.neighbourhood || a.suburb || a.hamlet || a.village || a.town || a.city
  const street = [number, road].filter(Boolean).join(' ')
  const parts = [street, area].filter(Boolean)
  if (parts.length) return parts.join(', ')
  return data?.display_name?.split(',').slice(0, 2).join(',').trim() || ''
}

// Forward-geocode a free-text address or cross-street. `bias` is an optional
// { lat, lng } center to nudge results toward — without it Nominatim will
// happily return "Main St" for a city on the other side of the planet. We
// pass a viewbox around the bias point so local queries actually land local.
export async function forwardGeocode(query, bias) {
  const q = (query || '').trim()
  if (q.length < 3) return null
  try {
    const params = new URLSearchParams({
      q,
      format: 'json',
      limit: '1',
      addressdetails: '1'
    })
    if (bias && Number.isFinite(bias.lat) && Number.isFinite(bias.lng)) {
      // ~30km viewbox around the bias point — biases without hard-restricting.
      const dLat = 0.27
      const dLng = 0.35
      const left = bias.lng - dLng
      const right = bias.lng + dLng
      const top = bias.lat + dLat
      const bottom = bias.lat - dLat
      params.set('viewbox', `${left},${top},${right},${bottom}`)
      params.set('bounded', '0')
    }
    const r = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
      headers: { 'Accept-Language': 'en' }
    })
    if (!r.ok) return null
    const arr = await r.json()
    const hit = Array.isArray(arr) && arr.length ? arr[0] : null
    if (!hit) return null
    const lat = parseFloat(hit.lat)
    const lng = parseFloat(hit.lon)
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null
    return { lat, lng, label: hit.display_name || '' }
  } catch {
    return null
  }
}

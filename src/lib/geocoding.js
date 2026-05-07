// Reverse geocoding via OpenStreetMap Nominatim. Free, keyless, ~1 req/sec policy.
// We debounce calls upstream and only fire on pin drop / drag-end.

const ENDPOINT = 'https://nominatim.openstreetmap.org/reverse'

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

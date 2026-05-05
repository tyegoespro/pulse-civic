// Proximity-based voting for Pulse
// Simple model: verified resident within radius = can vote. Outside = blocked.
// Every verified resident's vote counts equally.

// Simulated user home location (Oshkosh, WI — center of city)
const USER_HOME = { lat: 44.0247, lng: -88.5426 }

// Voting radius — any verified resident within this radius can vote
export const VOTING_RADIUS_MILES = 15 // City + surrounding commuter area

// Haversine formula — distance between two lat/lng points in miles
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Get the user's distance to a post
export function getDistanceToPost(postLat, postLng, userLat = USER_HOME.lat, userLng = USER_HOME.lng) {
  if (!postLat || !postLng) return 0
  return haversineDistance(userLat, userLng, postLat, postLng)
}

// Check if user can vote on a post (within radius)
export function canVoteOnPost(postLat, postLng) {
  const distance = getDistanceToPost(postLat, postLng)
  return distance <= VOTING_RADIUS_MILES
}

// Check if user can vote on a state post (always true for verified residents)
export function canVoteOnStatePost() {
  return true // State residency = verified. No radius check needed.
}

// Format distance for display
export function formatDistance(miles) {
  if (miles < 0.1) return 'Nearby'
  if (miles < 1) return `${(miles * 5280).toFixed(0)} ft`
  return `${miles.toFixed(1)} mi`
}

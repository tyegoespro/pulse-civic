import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default marker icon path issue with bundlers
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'

function createPinIcon(color = '#6366F1', size = 28) {
  return L.divIcon({
    className: 'pulse-map-pin',
    html: `
      <div class="pulse-pin" style="--pin-color: ${color}">
        <div class="pulse-pin-head"></div>
        <div class="pulse-pin-ring"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  })
}

function createSelectedPinIcon(color = '#6366F1', size = 36) {
  return L.divIcon({
    className: 'pulse-map-pin selected',
    html: `
      <div class="pulse-pin selected" style="--pin-color: ${color}">
        <div class="pulse-pin-head"></div>
        <div class="pulse-pin-ring"></div>
        <div class="pulse-pin-pulse"></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size]
  })
}

/**
 * LeafletMap — shared map component for Pulse
 *
 * @param {Object} props
 * @param {{ lat: number, lng: number }} props.center - Map center
 * @param {number} props.zoom - Zoom level (1-18)
 * @param {Array} props.pins - Array of { id, lat, lng, color, label, selected }
 * @param {Function} props.onPinClick - Called with pin id when a pin is clicked
 * @param {Function} props.onMapClick - Called with { lat, lng } when map is clicked
 * @param {boolean} props.interactive - Enable pan/zoom (default true)
 * @param {string} props.className - Additional CSS class
 * @param {Object} props.style - Additional inline styles
 * @param {{ lat: number, lng: number }} props.dropPin - Single draggable drop-pin position
 * @param {Function} props.onDropPinMove - Called with { lat, lng } when drop pin is dragged
 */
export default function LeafletMap({
  center,
  zoom = 13,
  pins = [],
  onPinClick,
  onMapClick,
  interactive = true,
  className = '',
  style = {},
  dropPin,
  onDropPinMove
}) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])
  const dropMarkerRef = useRef(null)

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: interactive,
      dragging: interactive,
      touchZoom: interactive,
      scrollWheelZoom: interactive,
      doubleClickZoom: interactive,
      boxZoom: interactive,
      keyboard: interactive,
      attributionControl: true
    })

    L.tileLayer(DARK_TILES, {
      attribution: ATTRIBUTION,
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map)

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng })
      })
    }

    mapInstanceRef.current = map

    // Force a resize after mount to fix grey tiles
    setTimeout(() => map.invalidateSize(), 100)

    return () => {
      map.remove()
      mapInstanceRef.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Update center/zoom when props change
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return
    map.setView([center.lat, center.lng], zoom, { animate: true, duration: 0.5 })
  }, [center.lat, center.lng, zoom])

  // Update pins
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach(m => map.removeLayer(m))
    markersRef.current = []

    // Add new markers
    pins.forEach(pin => {
      if (!pin.lat || !pin.lng) return

      const icon = pin.selected
        ? createSelectedPinIcon(pin.color, 36)
        : createPinIcon(pin.color, 28)

      const marker = L.marker([pin.lat, pin.lng], { icon })
        .addTo(map)

      if (pin.label) {
        marker.bindTooltip(pin.label, {
          className: 'pulse-map-tooltip',
          direction: 'top',
          offset: [0, -30]
        })
      }

      if (onPinClick) {
        marker.on('click', () => onPinClick(pin.id))
      }

      markersRef.current.push(marker)
    })
  }, [pins, onPinClick])

  // Handle drop pin (for CreatePostModal)
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    if (dropPin) {
      if (dropMarkerRef.current) {
        dropMarkerRef.current.setLatLng([dropPin.lat, dropPin.lng])
      } else {
        const marker = L.marker([dropPin.lat, dropPin.lng], {
          icon: createSelectedPinIcon('#FF3366', 36),
          draggable: true
        }).addTo(map)

        marker.on('dragend', () => {
          const pos = marker.getLatLng()
          onDropPinMove && onDropPinMove({ lat: pos.lat, lng: pos.lng })
        })

        dropMarkerRef.current = marker
      }
    } else if (dropMarkerRef.current) {
      map.removeLayer(dropMarkerRef.current)
      dropMarkerRef.current = null
    }
  }, [dropPin, onDropPinMove])

  return (
    <div
      ref={mapRef}
      className={`pulse-leaflet-map ${className}`}
      style={{
        width: '100%',
        height: '100%',
        borderRadius: 'inherit',
        ...style
      }}
    />
  )
}

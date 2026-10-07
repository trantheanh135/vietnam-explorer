import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { CircleMarker, MapContainer, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { placeTitle, VIETNAM_CENTER } from '../lib/places'

const COLORS = { travel: '#0f766e', food: '#ea580c' }

// On phones the map is hidden (0×0) while the list is shown; Leaflet can't fly
// inside a zero-size container, so wait until it is visible, then catch up.
function FlyToSelected({ place }) {
  const map = useMap()
  useEffect(() => {
    const go = () => {
      const size = map.getSize()
      if (!place || !size.x || !size.y) return
      map.flyTo([place.lat, place.lng], Math.max(map.getZoom(), 12), { duration: 0.8 })
    }
    go()
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
      go()
    })
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map, place])
  return null
}

// Fallback map used when no Google Maps API key is configured.
export default function LeafletMapView({ places, category, lang, selected, onSelect }) {
  const color = COLORS[category]
  return (
    <MapContainer center={[VIETNAM_CENTER.lat, VIETNAM_CENTER.lng]} zoom={5} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {places.map((p) => {
        const isSel = selected?.id === p.id
        return (
          <CircleMarker
            key={p.id}
            center={[p.lat, p.lng]}
            radius={isSel ? 11 : 7}
            pathOptions={{ color: '#fff', weight: 2, fillColor: color, fillOpacity: 0.95 }}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip direction="top" offset={[0, -6]} permanent={isSel}>{placeTitle(p, lang)}</Tooltip>
          </CircleMarker>
        )
      })}
      <FlyToSelected place={selected} />
    </MapContainer>
  )
}

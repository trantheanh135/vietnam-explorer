import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { title, VIETNAM_CENTER } from '../lib/places'

// Lucide "mountain" / "utensils" glyphs (ISC licence), drawn inside the pin.
const GLYPH = {
  travel: '<path d="m8 3 4 8 5-5 5 15H2L8 3z"/>',
  food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
}

function pinIcon(category, selected) {
  const size = selected ? 46 : 36
  return L.divIcon({
    className: '',
    iconSize: [size, size + 8],
    iconAnchor: [size / 2, size + 6],
    tooltipAnchor: [0, -size],
    html: `<div class="pin ${category}${selected ? ' is-selected' : ''}" style="width:${size}px;height:${size}px">
      <svg viewBox="0 0 24 24" width="${size * 0.46}" height="${size * 0.46}" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${GLYPH[category]}</svg>
    </div>`,
  })
}

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

export default function LeafletMapView({ places, category, lang, selected, onSelect }) {
  const icons = useMemo(() => ({ normal: pinIcon(category, false), selected: pinIcon(category, true) }), [category])
  return (
    <MapContainer center={[VIETNAM_CENTER.lat, VIETNAM_CENTER.lng]} zoom={5} zoomControl={false} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      {places.map((p) => {
        const isSel = selected?.id === p.id
        return (
          <Marker
            key={p.id}
            position={[p.lat, p.lng]}
            icon={isSel ? icons.selected : icons.normal}
            zIndexOffset={isSel ? 1000 : 0}
            eventHandlers={{ click: () => onSelect(p.id) }}
          >
            <Tooltip direction="top" permanent={isSel} className="pin-tip">{title(p, lang)}</Tooltip>
          </Marker>
        )
      })}
      <FlyToSelected place={selected} />
    </MapContainer>
  )
}

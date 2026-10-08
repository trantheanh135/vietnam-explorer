import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, Tooltip, useMap, useMapEvents, ZoomControl } from 'react-leaflet'
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

function clusterIcon(category, count) {
  const size = count < 5 ? 40 : count < 15 ? 48 : 56
  return L.divIcon({
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="cluster ${category}" style="width:${size}px;height:${size}px"><span>${count}</span></div>`,
  })
}

const CLUSTER_PX = 46

/** Pins closer than CLUSTER_PX on screen merge into one numbered bubble (recomputed on zoom). */
function Pins({ places, category, lang, selected, onSelect }) {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())
  useMapEvents({ zoomend: () => setZoom(map.getZoom()) })
  const icons = useMemo(() => ({ travel: pinIcon('travel', false), food: pinIcon('food', false) }), [])
  const selectedIcon = useMemo(() => pinIcon(selected?.category || category, true), [selected?.category, category])

  const groups = useMemo(() => {
    const out = []
    for (const p of places) {
      if (p.id === selected?.id) continue
      const pt = map.project([p.lat, p.lng], zoom)
      const near = out.find((g) => g.pt.distanceTo(pt) < CLUSTER_PX)
      if (near) near.items.push(p)
      else out.push({ pt, items: [p] })
    }
    return out
  }, [places, selected?.id, zoom, map])

  const expand = (items) => {
    const bounds = L.latLngBounds(items.map((p) => [p.lat, p.lng]))
    if (map.getZoom() >= 17) return
    map.flyToBounds(bounds, { padding: [70, 70], maxZoom: Math.min(18, map.getZoom() + 4), duration: 0.6 })
  }

  return (
    <>
      {groups.map((g) => {
        if (g.items.length === 1) {
          const p = g.items[0]
          return (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={icons[p.category]} eventHandlers={{ click: () => onSelect(p.id) }}>
              <Tooltip direction="top" className="pin-tip">{title(p, lang)}</Tooltip>
            </Marker>
          )
        }
        const c = g.items.reduce((a, p) => ({ lat: a.lat + p.lat / g.items.length, lng: a.lng + p.lng / g.items.length }), { lat: 0, lng: 0 })
        return (
          <Marker key={`c-${g.items[0].id}-${g.items.length}`} position={[c.lat, c.lng]} icon={clusterIcon(category, g.items.length)}
            eventHandlers={{ click: () => expand(g.items) }}>
            <Tooltip direction="top" className="pin-tip">{g.items.slice(0, 3).map((p) => title(p, lang)).join(' · ')}{g.items.length > 3 ? ' …' : ''}</Tooltip>
          </Marker>
        )
      })}
      {selected && (
        <Marker position={[selected.lat, selected.lng]} icon={selectedIcon} zIndexOffset={1000}>
          <Tooltip direction="top" permanent className="pin-tip">{title(selected, lang)}</Tooltip>
        </Marker>
      )}
    </>
  )
}

/**
 * Keeps the view on what matters: the selected place, or else all listed places.
 * On phones the map is hidden (0×0) while the list is shown, so wait until it is visible.
 */
function Viewport({ places, selected }) {
  const map = useMap()
  const key = selected ? `s:${selected.id}` : `l:${places.map((p) => p.id).join(',')}`
  useEffect(() => {
    let done = false
    const go = () => {
      const size = map.getSize()
      if (done || !size.x || !size.y) return
      done = true
      if (selected) {
        map.flyTo([selected.lat, selected.lng], Math.max(map.getZoom(), selected.category === 'food' ? 16 : 11), { duration: 0.8 })
      } else if (places.length) {
        const bounds = L.latLngBounds(places.map((p) => [p.lat, p.lng]))
        map.flyToBounds(bounds, { padding: [48, 48], maxZoom: 16, duration: 0.8 })
      }
    }
    go()
    const observer = new ResizeObserver(() => {
      map.invalidateSize()
      go()
    })
    observer.observe(map.getContainer())
    return () => observer.disconnect()
  }, [map, key]) // eslint-disable-line react-hooks/exhaustive-deps
  return null
}

export default function LeafletMapView({ places, category, lang, selected, onSelect }) {
  return (
    <MapContainer center={[VIETNAM_CENTER.lat, VIETNAM_CENTER.lng]} zoom={5} zoomControl={false} style={{ width: '100%', height: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        className="soft-tiles"
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />
      <Pins places={places} category={category} lang={lang} selected={selected} onSelect={onSelect} />
      <Viewport places={places} selected={selected} />
    </MapContainer>
  )
}

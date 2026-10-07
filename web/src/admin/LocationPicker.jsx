import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useMemo, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import { VIETNAM_CENTER } from '../lib/places'

const icon = L.divIcon({
  className: '',
  iconSize: [34, 42],
  iconAnchor: [17, 40],
  html: '<div class="pin picker" style="width:34px;height:34px"></div>',
})

function ClickToSet({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) })
  return null
}

function Recenter({ lat, lng }) {
  const map = useMap()
  useEffect(() => {
    if (lat != null && lng != null) map.setView([lat, lng], Math.max(map.getZoom(), 12))
  }, [map, lat, lng])
  return null
}

const round = (v) => Math.round(v * 1e6) / 1e6

/** Click the map (or drag the pin, or paste "lat, lng" from Google Maps) to set the location. */
export default function LocationPicker({ lat, lng, onChange, error }) {
  const [paste, setPaste] = useState('')
  const [pasteError, setPasteError] = useState('')
  const has = lat != null && lng != null && !Number.isNaN(lat) && !Number.isNaN(lng)
  const pick = (a, b) => onChange(round(a), round(b))
  const handlers = useMemo(() => ({ dragend: (e) => { const p = e.target.getLatLng(); pick(p.lat, p.lng) } }), []) // eslint-disable-line react-hooks/exhaustive-deps

  const applyPaste = () => {
    const m = paste.match(/(-?\d{1,2}\.\d+)\s*[, ]\s*(-?\d{2,3}\.\d+)/)
    if (!m) return setPasteError('Không đọc được toạ độ. Ví dụ: 21.0285, 105.8542')
    setPasteError('')
    setPaste('')
    pick(parseFloat(m[1]), parseFloat(m[2]))
  }

  return (
    <div className="picker-wrap">
      <div className={`picker-map ${error ? 'has-error' : ''}`}>
        <MapContainer center={has ? [lat, lng] : [VIETNAM_CENTER.lat, VIETNAM_CENTER.lng]} zoom={has ? 12 : 5} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <ClickToSet onPick={pick} />
          {has && <Marker position={[lat, lng]} icon={icon} draggable eventHandlers={handlers} />}
          {has && <Recenter lat={lat} lng={lng} />}
        </MapContainer>
        {!has && <div className="picker-hint">Bấm vào bản đồ để đặt vị trí</div>}
      </div>
      <div className="picker-row">
        <span className="coords">{has ? `${lat}, ${lng}` : 'Chưa chọn vị trí'}</span>
        <input
          value={paste}
          onChange={(e) => setPaste(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyPaste())}
          placeholder="…hoặc dán toạ độ từ Google Maps"
        />
        <button type="button" className="btn small" onClick={applyPaste} disabled={!paste.trim()}>Áp dụng</button>
      </div>
      {(pasteError || error) && <p className="form-error small">{pasteError || error}</p>}
      <p className="admin-muted small">Mẹo: trên Google Maps, nhấp chuột phải vào địa điểm → bấm dòng toạ độ đầu tiên để sao chép.</p>
    </div>
  )
}

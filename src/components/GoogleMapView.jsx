import { AdvancedMarker, APIProvider, InfoWindow, Map, Pin, useMap } from '@vis.gl/react-google-maps'
import { useEffect } from 'react'
import { placeTitle, VIETNAM_CENTER } from '../lib/places'

const COLORS = { travel: '#0f766e', food: '#ea580c' }

function FlyToSelected({ place }) {
  const map = useMap()
  useEffect(() => {
    if (!map || !place) return
    map.panTo({ lat: place.lat, lng: place.lng })
    if ((map.getZoom() ?? 0) < 11) map.setZoom(12)
  }, [map, place])
  return null
}

export default function GoogleMapView({ apiKey, places, category, lang, selected, onSelect }) {
  const color = COLORS[category]
  return (
    <APIProvider apiKey={apiKey} language={lang} region="VN">
      <Map
        defaultCenter={VIETNAM_CENTER}
        defaultZoom={5.6}
        mapId={import.meta.env.VITE_GOOGLE_MAP_ID || 'DEMO_MAP_ID'}
        gestureHandling="greedy"
        disableDefaultUI={false}
        clickableIcons={false}
        style={{ width: '100%', height: '100%' }}
      >
        {places.map((p) => (
          <AdvancedMarker
            key={p.id}
            position={{ lat: p.lat, lng: p.lng }}
            title={placeTitle(p, lang)}
            onClick={() => onSelect(p.id)}
            zIndex={selected?.id === p.id ? 1000 : undefined}
          >
            <Pin
              background={color}
              borderColor="#ffffff"
              glyphColor="#ffffff"
              scale={selected?.id === p.id ? 1.4 : 1}
            />
          </AdvancedMarker>
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            pixelOffset={[0, -40]}
            onCloseClick={() => onSelect(null)}
            headerDisabled
          >
            <strong>{placeTitle(selected, lang)}</strong>
          </InfoWindow>
        )}
        <FlyToSelected place={selected} />
      </Map>
    </APIProvider>
  )
}

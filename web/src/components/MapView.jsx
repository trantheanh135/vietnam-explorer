import { Component, lazy, Suspense } from 'react'
import { t } from '../i18n'

const GoogleMapView = lazy(() => import('./GoogleMapView'))
const LeafletMapView = lazy(() => import('./LeafletMapView'))

const GOOGLE_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// A map failure (bad key, network, library error) must never take down the list.
class MapErrorBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error) {
    console.error('Map failed:', error)
  }
  render() {
    if (this.state.failed) {
      return (
        <div className="map-placeholder">
          ⚠️ {this.props.lang === 'vi' ? 'Không tải được bản đồ.' : 'The map could not be loaded.'}
          <button type="button" className="btn small" onClick={() => this.setState({ failed: false })}>↻</button>
        </div>
      )
    }
    return this.props.children
  }
}

export default function MapView({ online, lang, ...props }) {
  if (!online) return <div className="map-placeholder">📡 {t('offline', lang)}</div>
  return (
    <MapErrorBoundary lang={lang}>
      <Suspense fallback={<div className="map-placeholder">…</div>}>
        {GOOGLE_KEY ? (
          <GoogleMapView apiKey={GOOGLE_KEY} lang={lang} {...props} />
        ) : (
          <LeafletMapView lang={lang} {...props} />
        )}
      </Suspense>
    </MapErrorBoundary>
  )
}

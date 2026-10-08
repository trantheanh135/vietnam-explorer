import { ChevronRight, MapPin, Star, X } from 'lucide-react'
import { t } from '../i18n'
import { title } from '../lib/places'
import PlaceImage from './PlaceImage'

/** Phone map view: a card for the tapped pin, so the map stays in view until the person chooses to open it. */
export default function MapPreview({ place, lang, onOpen, onClose }) {
  return (
    <div className="map-preview" role="dialog" aria-label={title(place, lang)}>
      <button type="button" className="map-preview-main" onClick={onOpen}>
        <PlaceImage place={place} />
        <span className="map-preview-text">
          <b>{title(place, lang)}</b>
          <small>{place.category === 'food' ? place.venue : (lang === 'vi' ? place.nameEn : place.nameVi)}</small>
          <small className="meta">
            {place.category === 'food' && <><Star size={12} fill="currentColor" strokeWidth={0} className="star-ico" /> {place.rating.toFixed(1)} · </>}
            <MapPin size={11} /> {place.area}
          </small>
          <span className="map-preview-cta">{t('viewDetails', lang)} <ChevronRight size={15} /></span>
        </span>
      </button>
      <button type="button" className="map-preview-close" onClick={onClose} aria-label="Close"><X size={16} /></button>
    </div>
  )
}

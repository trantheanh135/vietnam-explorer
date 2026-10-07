import { Check, Heart, MapPin, Star } from 'lucide-react'
import { REGIONS, title } from '../lib/places'
import PlaceImage from './PlaceImage'

export default function PlaceCard({ place, lang, mine, selected, onSelect, onToggleFavourite }) {
  const fav = !!mine?.favourite
  const sub = place.category === 'food' ? place.venue : (lang === 'vi' ? place.nameEn : place.nameVi)
  return (
    <article className={`card ${selected ? 'is-selected' : ''}`}>
      <button type="button" className="card-hit" onClick={() => onSelect(place.id)} aria-label={title(place, lang)} />
      <div className="card-media">
        <PlaceImage place={place} />
        <span className={`badge region-${place.region}`}>{REGIONS[place.region][lang]}</span>
        {place.category === 'food' && (
          <span className="badge rating"><Star size={12} fill="currentColor" strokeWidth={0} /> {place.rating.toFixed(1)}</span>
        )}
        <button
          type="button"
          className={`fav-btn ${fav ? 'on' : ''}`}
          aria-pressed={fav}
          aria-label="♥"
          onClick={() => onToggleFavourite(place.id, !fav)}
        >
          <Heart size={16} fill={fav ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="card-body">
        <h3>
          {title(place, lang)}
          {mine?.visited && <Check size={14} className="visited" aria-label="✓" />}
        </h3>
        <p className="card-sub">{sub}</p>
        <p className="card-area"><MapPin size={12} /> {place.area}</p>
      </div>
    </article>
  )
}

import { Check, Heart, ImagePlay, MapPin, Play, Star } from 'lucide-react'
import { REGIONS, title } from '../lib/places'
import PlaceImage from './PlaceImage'

export default function PlaceCard({ place, lang, index = 0, mine, onSelect, onToggleFavourite }) {
  const fav = !!mine?.favourite
  const food = place.category === 'food'
  const sub = food ? place.venue : (lang === 'vi' ? place.nameEn : place.nameVi)
  return (
    <article className="card" style={{ '--i': Math.min(index, 12) }}>
      <button type="button" className="card-hit" onClick={() => onSelect(place.id)} aria-label={title(place, lang)} />
      <div className="card-media">
        <PlaceImage place={place} />
        <span className="card-shade" />
        <span className="badge glass">{REGIONS[place.region][lang]}</span>
        {(place.video?.url || place.animatedUrl) && (
          <span className="badge glass media">
            {place.video?.url ? <><Play size={10} fill="currentColor" strokeWidth={0} /> Video</> : <><ImagePlay size={11} /> GIF</>}
          </span>
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
        {food && (
          <span className="card-rating"><Star size={12} fill="currentColor" strokeWidth={0} /> {place.rating.toFixed(1)}</span>
        )}
      </div>
      <div className="card-body">
        <h3>
          {title(place, lang)}
          {mine?.visited && <Check size={14} className="visited" aria-label="✓" />}
        </h3>
        <p className="card-sub">{sub}</p>
        <p className="card-meta">
          <span><MapPin size={12} /> {place.area}</span>
          {food && place.price && <span className="card-price">{place.price}</span>}
        </p>
      </div>
    </article>
  )
}

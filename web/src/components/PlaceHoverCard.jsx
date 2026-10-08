import { ArrowUpRight, MapPin, Star, Wallet } from 'lucide-react'
import { t } from '../i18n'
import { desc, REGIONS, title } from '../lib/places'
import PlaceMedia from './PlaceMedia'

/** A compact preview of a place, shown when hovering it on a map. `others`: places at the same spot. */
export default function PlaceHoverCard({ place, lang, others = [], onOpen }) {
  const food = place.category === 'food'
  return (
    <div className={`hover-card ${place.category}`}>
      <div className="hover-card-media">
        <PlaceMedia place={place} eager />
        <span className="hover-card-region">{REGIONS[place.region][lang]}</span>
        {food && <span className="hover-card-rating"><Star size={12} fill="currentColor" strokeWidth={0} /> {place.rating.toFixed(1)}</span>}
      </div>
      <div className="hover-card-body">
        <b>{title(place, lang)}</b>
        <small><MapPin size={11} /> {food ? `${place.venue} · ${place.area}` : place.area}</small>
        <p>{desc(place, lang)}</p>
        {food && place.price && <small className="hover-card-price"><Wallet size={11} /> {place.price}</small>}
        {onOpen && (
          <button type="button" className="hover-card-open" onClick={() => onOpen(place.id)}>
            {t('viewDetails', lang)} <ArrowUpRight size={14} />
          </button>
        )}
        {others.length > 0 && (
          <div className="hover-card-others">
            <span>{lang === 'vi' ? `+${others.length} nơi khác ở đây` : `+${others.length} more here`}</span>
            {others.slice(0, 6).map((p) => (
              <button type="button" key={p.id} onClick={() => onOpen?.(p.id)}>
                {title(p, lang)}{p.category === 'food' ? <em> · {p.venue}</em> : null}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

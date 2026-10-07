import { t } from '../i18n'
import { REGIONS, placeTitle } from '../lib/places'
import Stars from './Stars'

export default function PlaceList({ places, category, lang, reviews, selectedId, onSelect }) {
  if (!places.length) return <p className="no-results">{t('noResults', lang)}</p>
  return (
    <ul className="place-list">
      {places.map((p) => {
        const mine = reviews[p.id]
        const subtitle = category === 'food'
          ? `${p.place} · ${p.city}`
          : `${lang === 'vi' ? p.name : p.nameVi} · ${p.province}`
        return (
          <li key={p.id}>
            <button
              type="button"
              className={`place-card ${category} ${selectedId === p.id ? 'selected' : ''}`}
              onClick={() => onSelect(p.id)}
            >
              <span className="card-icon" aria-hidden="true">{category === 'food' ? '🍜' : iconFor(p)}</span>
              <span className="card-body">
                <span className="card-title">
                  {placeTitle(p, lang)}
                  {mine?.favourite && <span className="fav" title={t('favourite', lang)}>♥</span>}
                  {mine?.visited && <span className="visited" title={t('visited', lang)}>✓</span>}
                </span>
                <span className="card-sub">{subtitle}</span>
                <span className="card-meta">
                  <span className={`region-chip ${p.region}`}>{REGIONS[p.region][lang]}</span>
                  {category === 'food' && <Stars value={p.rating} size={12} />}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function iconFor(place) {
  const tags = place.tags || []
  if (tags.includes('beach')) return '🏝️'
  if (tags.includes('mountain')) return '⛰️'
  if (tags.includes('heritage')) return '🏯'
  if (tags.includes('city')) return '🏙️'
  return '🌿'
}

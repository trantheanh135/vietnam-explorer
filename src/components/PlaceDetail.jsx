import { TRAVEL_TAGS } from '../data/travel'
import { t } from '../i18n'
import { REGIONS, directionsUrl, googleMapsUrl, placeTitle } from '../lib/places'
import Stars from './Stars'

export default function PlaceDetail({ place, category, lang, review, onReview, onBack }) {
  const mine = review || { rating: 0, note: '', favourite: false, visited: false }
  const otherName = category === 'food' ? (lang === 'vi' ? place.dish : place.dishVi) : (lang === 'vi' ? place.name : place.nameVi)

  return (
    <article className={`detail ${category}`}>
      <button type="button" className="back" onClick={onBack}>← {t('back', lang)}</button>
      <header>
        <h2>{placeTitle(place, lang)}</h2>
        <p className="other-name">{otherName}</p>
        <p className="where">
          <span className={`region-chip ${place.region}`}>{REGIONS[place.region][lang]}</span>
          {category === 'food' ? <> {place.place} · {place.address}</> : <> {place.province}</>}
        </p>
        {category === 'travel' && (
          <p className="tags">{place.tags.map((tag) => <span key={tag} className="tag">{TRAVEL_TAGS[tag][lang]}</span>)}</p>
        )}
      </header>

      {category === 'food' && (
        <div className="facts">
          <div><span className="fact-label">{t('ourRating', lang)}</span><Stars value={place.rating} size={18} /></div>
          <div><span className="fact-label">{t('price', lang)}</span><b>{place.price}</b></div>
        </div>
      )}

      <p className="desc">{place.desc[lang]}</p>

      {category === 'travel' ? (
        <p className="callout"><b>{t('bestTime', lang)}:</b> {place.bestTime[lang]}</p>
      ) : (
        <p className="callout"><b>{t('mustTry', lang)}:</b> {place.mustTry[lang]}</p>
      )}

      <div className="actions">
        <a className="btn primary" href={googleMapsUrl(place)} target="_blank" rel="noopener noreferrer">📍 {t('openMaps', lang)}</a>
        <a className="btn" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer">🧭 {t('directions', lang)}</a>
      </div>
      <p className="small-note">{t('approx', lang)}</p>

      <section className="my-review">
        <h3>{t('myReview', lang)}</h3>
        <Stars value={mine.rating} size={24} label={t('myReview', lang)} onChange={(rating) => onReview({ rating })} />
        <div className="toggles">
          <label><input type="checkbox" checked={mine.favourite} onChange={(e) => onReview({ favourite: e.target.checked })} /> ♥ {t('favourite', lang)}</label>
          <label><input type="checkbox" checked={mine.visited} onChange={(e) => onReview({ visited: e.target.checked })} /> ✓ {t('visited', lang)}</label>
        </div>
        <textarea
          rows={3}
          placeholder={t('myNote', lang)}
          value={mine.note}
          onChange={(e) => onReview({ note: e.target.value })}
        />
      </section>
    </article>
  )
}

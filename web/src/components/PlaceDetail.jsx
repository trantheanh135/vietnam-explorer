import { ArrowLeft, CalendarDays, Camera, Check, ExternalLink, Heart, Lightbulb, MapPin, Navigation, Wallet } from 'lucide-react'
import { t } from '../i18n'
import { desc, directionsUrl, googleMapsUrl, otherTitle, REGIONS, tip, title, TRAVEL_TAGS } from '../lib/places'
import PlaceImage from './PlaceImage'
import PlaceVideo from './PlaceVideo'
import Stars from './Stars'

export default function PlaceDetail({ place, lang, review, onReview, onBack }) {
  const mine = review || { rating: 0, note: '', favourite: false, visited: false }
  const food = place.category === 'food'
  const credit = place.image

  return (
    <article className={`detail ${place.category}`}>
      <div className="detail-hero">
        <PlaceImage place={place} eager />
        {place.video?.url && <PlaceVideo url={place.video.url} lang={lang} />}
        <button type="button" className="round-btn back" onClick={onBack} aria-label={t('back', lang)}>
          <ArrowLeft size={20} />
        </button>
        <button
          type="button"
          className={`round-btn fav ${mine.favourite ? 'on' : ''}`}
          aria-pressed={mine.favourite}
          aria-label={t('favourite', lang)}
          onClick={() => onReview({ favourite: !mine.favourite })}
        >
          <Heart size={18} fill={mine.favourite ? 'currentColor' : 'none'} />
        </button>
        <div className="detail-title">
          <span className={`badge region-${place.region}`}>{REGIONS[place.region][lang]}</span>
          <h2>{title(place, lang)}</h2>
          <p>{otherTitle(place, lang)}</p>
        </div>
      </div>

      <div className="detail-body">
        <p className="where"><MapPin size={16} /> {food ? <>{place.venue} · {place.address || place.area}</> : place.area}</p>

        {food ? (
          <div className="facts">
            <div><span className="fact-label">{t('ourRating', lang)}</span><Stars value={place.rating} size={18} /></div>
            {place.price && <div><span className="fact-label"><Wallet size={13} /> {t('price', lang)}</span><b>{place.price}</b></div>}
          </div>
        ) : (
          (place.tags || []).length > 0 && (
            <p className="tags">{place.tags.map((tag) => <span key={tag} className="tag">{TRAVEL_TAGS[tag]?.[lang] || tag}</span>)}</p>
          )
        )}

        <p className="desc">{desc(place, lang)}</p>

        {tip(place, lang) && (
          <div className="callout">
            {food ? <Lightbulb size={18} /> : <CalendarDays size={18} />}
            <div><b>{food ? t('mustTry', lang) : t('bestTime', lang)}</b><span>{tip(place, lang)}</span></div>
          </div>
        )}

        <div className="actions">
          <a className="btn primary" href={googleMapsUrl(place)} target="_blank" rel="noopener noreferrer"><MapPin size={17} /> {t('openMaps', lang)}</a>
          <a className="btn" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer"><Navigation size={17} /> {t('directions', lang)}</a>
        </div>
        <p className="small-note">{t('approx', lang)}</p>

        <section className="my-review">
          <h3>{t('myReview', lang)}</h3>
          <Stars value={mine.rating} size={26} label={t('myReview', lang)} onChange={(rating) => onReview({ rating })} />
          <div className="toggles">
            <label className={`toggle ${mine.visited ? 'on' : ''}`}>
              <input type="checkbox" checked={mine.visited} onChange={(e) => onReview({ visited: e.target.checked })} />
              <Check size={15} /> {t('visited', lang)}
            </label>
          </div>
          <textarea rows={3} placeholder={t('myNote', lang)} value={mine.note} onChange={(e) => onReview({ note: e.target.value })} />
        </section>

        {place.video?.url && <p className="credit"><Camera size={12} /> {t('aiVideo', lang)} (Google Veo)</p>}
        {credit?.author && (
          <p className="credit">
            <Camera size={12} /> {t('photo', lang)}: {credit.author}
            {credit.license && <> · {credit.license}</>}
            {credit.page && (
              <> · <a href={credit.page} target="_blank" rel="noopener noreferrer">
                {credit.page.includes('wikimedia.org') ? 'Wikimedia Commons' : (lang === 'vi' ? 'Nguồn' : 'Source')} <ExternalLink size={11} />
              </a></>
            )}
          </p>
        )}
      </div>
    </article>
  )
}

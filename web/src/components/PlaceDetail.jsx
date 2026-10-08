import { X, CalendarDays, Camera, Check, ExternalLink, Footprints, Heart, Lightbulb, MapPin, Navigation, Share2, Star, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { t } from '../i18n'
import { desc, directionsUrl, formatDistance, googleMapsUrl, nearby, otherTitle, REGIONS, tip, title, TRAVEL_TAGS } from '../lib/places'
import HeroMedia from './HeroMedia'
import PlaceImage from './PlaceImage'
import SMap from './SMap'
import Stars from './Stars'

export default function PlaceDetail({ place, all, lang, review, onReview, onBack, onOpen }) {
  const mine = review || { rating: 0, note: '', favourite: false, visited: false }
  const food = place.category === 'food'
  const credit = place.image
  const close = useMemo(() => nearby(all, place, { maxKm: food ? 1.5 : 25, limit: 10 }), [all, place, food])
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = `${window.location.origin}/#${encodeURIComponent(place.id)}`
    const text = `${title(place, lang)}${food ? ` — ${place.venue}` : ''}`
    try {
      if (navigator.share) return await navigator.share({ title: text, url })
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* cancelled */
    }
  }

  return (
    <article className={`detail ${place.category}`}>
      <div className="detail-hero">
        <HeroMedia place={place} lang={lang} />
        <div className="hero-btns">
          <button type="button" className="round-btn" onClick={onBack} aria-label={t('close', lang)}>
            <X size={20} />
          </button>
          <span className="spacer" />
          <button type="button" className="round-btn" onClick={share} aria-label={t('share', lang)}>
            <Share2 size={18} />
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
        </div>
        {copied && <span className="toast-pill">{t('copied', lang)}</span>}
        <div className="detail-title">
          <span className="eyebrow light">{food ? place.venue : REGIONS[place.region][lang]}</span>
          <h2>{title(place, lang)}</h2>
          <p>{otherTitle(place, lang)}</p>
        </div>
      </div>

      <div className="detail-body">
        <div className="stat-row">
          {food && (
            <div className="stat">
              <span className="stat-label"><Star size={13} /> {t('ourRating', lang)}</span>
              <span className="stat-value big">{place.rating.toFixed(1)}<small>/5</small></span>
              <Stars value={place.rating} size={13} />
            </div>
          )}
          {food && place.price && (
            <div className="stat">
              <span className="stat-label"><Wallet size={13} /> {t('price', lang)}</span>
              <span className="stat-value">{place.price}</span>
            </div>
          )}
          <div className="stat">
            <span className="stat-label"><MapPin size={13} /> {t('area', lang)}</span>
            <span className="stat-value">{place.area}</span>
            <span className="stat-sub">{REGIONS[place.region][lang]}</span>
          </div>
        </div>

        {food && place.address && <p className="where"><MapPin size={16} /> <span><b>{place.venue}</b> · {place.address}</span></p>}
        {!food && (place.tags || []).length > 0 && (
          <p className="tags">{place.tags.map((tag) => <span key={tag} className="tag">{TRAVEL_TAGS[tag]?.[lang] || tag}</span>)}</p>
        )}

        <p className="desc">{desc(place, lang)}</p>

        {tip(place, lang) && (
          <div className="callout">
            {food ? <Lightbulb size={19} /> : <CalendarDays size={19} />}
            <div><b>{food ? t('mustTry', lang) : t('bestTime', lang)}</b><span>{tip(place, lang)}</span></div>
          </div>
        )}

        <div className="actions">
          <a className="btn primary" href={googleMapsUrl(place)} target="_blank" rel="noopener noreferrer"><MapPin size={17} /> {t('openMaps', lang)}</a>
          <a className="btn" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer"><Navigation size={17} /> {t('directions', lang)}</a>
        </div>
        <p className="small-note">{t('approx', lang)}</p>

        {close.length > 0 && (
          <section className="nearby">
            <h3>{t('nearby', lang)} {food && <small><Footprints size={13} /> {t('nearbyHint', lang)}</small>}</h3>
            <div className="nearby-row">
              {close.map(({ place: p, km }) => (
                <button type="button" key={p.id} className="nearby-card" onClick={() => onOpen(p.id)}>
                  <PlaceImage place={p} />
                  <span className="nearby-text">
                    <b>{title(p, lang)}</b>
                    <small>{p.category === 'food' ? p.venue : p.area}</small>
                    <small className="nearby-dist">
                      {formatDistance(km, lang)}
                      {p.category === 'food' && <> · <Star size={11} fill="currentColor" strokeWidth={0} className="star-ico" /> {p.rating.toFixed(1)}</>}
                    </small>
                  </span>
                </button>
              ))}
            </div>
          </section>
        )}

        <section className="on-map">
          <SMap places={[place]} activeId={place.id} lang={lang} showRoute={false} className="mini" />
          <div>
            <h3>{t('onTheMap', lang)}</h3>
            <p>{food ? <>{place.venue}<br />{place.address || place.area}</> : <>{place.area} · {REGIONS[place.region][lang]}</>}</p>
            <p className="coords">{place.lat.toFixed(4)}° N, {place.lng.toFixed(4)}° E</p>
          </div>
        </section>

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

        {place.video?.credit?.author && (
          <p className="credit">
            <Camera size={12} /> Video: {place.video.credit.author}
            {place.video.credit.license && <> · {place.video.credit.license}</>}
            {place.video.credit.page && (
              <> · <a href={place.video.credit.page} target="_blank" rel="noopener noreferrer">
                {place.video.credit.page.includes('wikimedia.org') ? 'Wikimedia Commons' : (lang === 'vi' ? 'Nguồn' : 'Source')} <ExternalLink size={11} />
              </a>{lang === 'vi' ? ' (đã cắt ngắn)' : ' (trimmed)'}</>
            )}
          </p>
        )}
        {(place.video?.model || '').startsWith('veo') && <p className="credit"><Camera size={12} /> {t('aiVideo', lang)} (Google Veo)</p>}
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

import { ArrowDown, Map as MapIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { t } from '../i18n'
import { REGIONS, title } from '../lib/places'
import PlaceImage from './PlaceImage'

/** Full-screen opening: slow cross-fading photos, the title, and the way into the journey. */
export default function Intro({ category, lang, slides, counts, onStart, onMap }) {
  const food = category === 'food'
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 7000)
    return () => clearInterval(timer)
  }, [category, slides.length])

  const now = slides[index]
  return (
    <section className="intro">
      <div className="intro-media" aria-hidden="true">
        {slides.map((p, i) => (
          <div key={p.id} className={`intro-slide ${i === index ? 'on' : ''}`}>
            <PlaceImage place={p} eager={i < 2} animated />
          </div>
        ))}
      </div>
      <div className="intro-grain" aria-hidden="true" />
      <div className="intro-content">
        <p className="intro-kicker">{food ? t('introKickerFood', lang) : t('introKickerTravel', lang)}</p>
        <h1 className="intro-title">
          {food ? <>{t('introTitleFood1', lang)}<em>{t('introTitleFood2', lang)}</em></> : <>{t('introTitleTravel1', lang)}<em>{t('introTitleTravel2', lang)}</em></>}
        </h1>
        <p className="intro-lede">{food ? t('heroFood', lang) : t('heroTravel', lang)}</p>
        <div className="intro-actions">
          <button type="button" className="intro-cta" onClick={onStart}>
            {t('startJourney', lang)} <ArrowDown size={18} />
          </button>
          <button type="button" className="intro-ghost" onClick={onMap}>
            <MapIcon size={17} /> {t('showMap', lang)}
          </button>
        </div>
        <dl className="intro-stats">
          {['north', 'central', 'south'].map((r) => (
            <div key={r}>
              <dt>{REGIONS[r][lang]}</dt>
              <dd>{counts[r] || 0}</dd>
            </div>
          ))}
        </dl>
      </div>
      {now && (
        <p className="intro-caption">
          <span>{String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}</span>
          {title(now, lang)} · {now.area}
        </p>
      )}
    </section>
  )
}

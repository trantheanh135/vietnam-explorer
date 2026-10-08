import { useEffect, useState } from 'react'
import { t } from '../i18n'
import PlaceImage from './PlaceImage'

/** The top of the list: a slowly cross-fading photo from the highlights, the headline and the search box. */
export default function ListHero({ category, lang, places, highlights, areas, children }) {
  const food = category === 'food'
  const slides = highlights.slice(0, 5)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setIndex(0)
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6500)
    return () => clearInterval(timer)
  }, [category, slides.length])

  return (
    <div className="list-hero">
      <div className="list-hero-media" aria-hidden="true">
        {slides.map((p, i) => (
          <div key={p.id} className={`list-hero-slide ${i === index ? 'on' : ''}`}>
            <PlaceImage place={p} eager={i === 0} animated />
          </div>
        ))}
      </div>
      <div className="list-hero-text">
        <span className="eyebrow">{food ? t('eyebrowFood', lang) : t('eyebrowTravel', lang)}</span>
        <h1>{food ? t('foodIntro', lang) : t('travelIntro', lang)}</h1>
        <p>{food ? t('heroFood', lang) : t('heroTravel', lang)}</p>
        <div className="hero-stats">
          <span><b>{places.length}</b> {food ? t('dishes', lang) : t('results', lang)}</span>
          {areas > 0 && <span><b>{areas}</b> {lang === 'vi' ? 'khu vực' : 'areas'}</span>}
          {slides[index] && <span className="now-showing">{lang === 'vi' ? slides[index].nameVi : slides[index].nameEn}</span>}
        </div>
      </div>
      <div className="list-hero-search">{children}</div>
    </div>
  )
}

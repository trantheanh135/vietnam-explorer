import { ArrowUpRight, Check, Heart, ImagePlay, MapPin, Play, Star, Wallet } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../i18n'
import { desc, distanceKm, REGIONS, title, TRAVEL_TAGS } from '../lib/places'
import PlaceImage from './PlaceImage'
import SMap from './SMap'

const ORDER = ['north', 'central', 'south']
const NUMERALS = ['I', 'II', 'III']

const CHAPTER = {
  travel: {
    north: { vi: 'Núi đá vôi, ruộng bậc thang và nghìn năm Thăng Long.', en: 'Limestone peaks, rice terraces and a thousand years of Thăng Long.' },
    central: { vi: 'Kinh thành, phố cổ đèn lồng và những bờ biển dài bất tận.', en: 'Imperial citadels, lantern-lit old towns and endless coastline.' },
    south: { vi: 'Sông nước Cửu Long, đảo ngọc và một Sài Gòn không ngủ.', en: 'Mekong waterways, pearl islands and a Saigon that never sleeps.' },
  },
  food: {
    north: { vi: 'Thanh, trong, tinh tế — phở, bún chả và hương vị Hà thành.', en: 'Clean, clear, refined — pho, bún chả and the taste of old Hanoi.' },
    central: { vi: 'Đậm, cay, kiêu hãnh — bún bò Huế, mì Quảng, cao lầu.', en: 'Bold, spicy, proud — bún bò Huế, mì Quảng, cao lầu.' },
    south: { vi: 'Ngọt, hào phóng, rực rỡ — cơm tấm, hủ tiếu, trái cây miệt vườn.', en: 'Sweet, generous, vivid — broken rice, hủ tiếu and orchard fruit.' },
  },
}

/**
 * The order you'd travel the S: region by region from north to south; inside a region, start
 * nearest to where the last region ended (the northernmost place at first) and always go to the
 * closest place not yet visited.
 */
export function journeyOrder(places) {
  const out = []
  for (const region of ORDER) {
    const left = places.filter((p) => p.region === region)
    let here = out.length ? out[out.length - 1] : null
    while (left.length) {
      let best = 0
      for (let i = 1; i < left.length; i++) {
        const better = here ? distanceKm(here, left[i]) < distanceKm(here, left[best]) : left[i].lat > left[best].lat
        if (better) best = i
      }
      here = left.splice(best, 1)[0]
      out.push(here)
    }
  }
  return out
}

function Story({ place, index, lang, mine, onOpen, onFavourite }) {
  const food = place.category === 'food'
  const fav = !!mine?.favourite
  return (
    <article className={`story ${index % 2 ? 'flip' : ''}`} data-story={place.id}>
      <button type="button" className="story-media" onClick={() => onOpen(place.id)} aria-label={title(place, lang)}>
        <PlaceImage place={place} />
        {(place.video?.url || place.animatedUrl) && (
          <span className="story-badge">
            {place.video?.url ? <><Play size={11} fill="currentColor" strokeWidth={0} /> Video</> : <><ImagePlay size={12} /> GIF</>}
          </span>
        )}
      </button>
      <div className="story-text">
        <span className="story-num">{String(index + 1).padStart(2, '0')}</span>
        <p className="story-where"><MapPin size={13} /> {food ? `${place.venue} · ${place.area}` : place.area}</p>
        <h3>
          <button type="button" onClick={() => onOpen(place.id)}>{title(place, lang)}</button>
          {mine?.visited && <Check size={18} className="visited" aria-label="✓" />}
        </h3>
        <p className="story-alt">{lang === 'vi' ? place.nameEn : place.nameVi}</p>
        <p className="story-desc">{desc(place, lang)}</p>
        <div className="story-foot">
          {food ? (
            <>
              <span className="story-pill strong"><Star size={13} fill="currentColor" strokeWidth={0} /> {place.rating.toFixed(1)}</span>
              {place.price && <span className="story-pill"><Wallet size={13} /> {place.price}</span>}
            </>
          ) : (
            (place.tags || []).slice(0, 3).map((tg) => <span key={tg} className="story-pill">{TRAVEL_TAGS[tg]?.[lang] || tg}</span>)
          )}
          <span className="spacer" />
          <button type="button" className={`story-fav ${fav ? 'on' : ''}`} aria-pressed={fav} aria-label={t('favourite', lang)} onClick={() => onFavourite(place.id, !fav)}>
            <Heart size={17} fill={fav ? 'currentColor' : 'none'} />
          </button>
          <button type="button" className="story-more" onClick={() => onOpen(place.id)}>
            {t('readMore', lang)} <ArrowUpRight size={16} />
          </button>
        </div>
      </div>
    </article>
  )
}

/**
 * The journey: a sticky illustrated map beside chapters (one per region) of place stories.
 * The story in the middle of the screen is "active": its dot glows and the route is drawn up to it.
 */
export default function Journey({ category, places, lang, reviews, toolbar, onOpen, onFavourite, empty }) {
  const ordered = useMemo(() => journeyOrder(places), [places])
  const chapters = useMemo(() => ORDER.map((r) => ({ region: r, items: ordered.filter((p) => p.region === r) })).filter((c) => c.items.length), [ordered])
  const [activeId, setActiveId] = useState(null)
  const root = useRef(null)

  const ids = ordered.map((p) => p.id).join(',')
  useEffect(() => {
    setActiveId((cur) => (ordered.some((p) => p.id === cur) ? cur : ordered[0]?.id ?? null))
    const els = root.current?.querySelectorAll('[data-story]') || []
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveId(e.target.dataset.story)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids]) // eslint-disable-line react-hooks/exhaustive-deps

  const pick = (id) => root.current?.querySelector(`[data-story="${CSS.escape(id)}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  const activeIndex = ordered.findIndex((p) => p.id === activeId)
  const active = ordered[activeIndex]

  let n = -1
  return (
    <section className="journey" id="journey" ref={root}>
      <aside className="journey-map">
        <div className="journey-map-inner">
          <p className="journey-map-head">
            <span>{t('yourJourney', lang)}</span>
            <b>{activeIndex >= 0 ? String(activeIndex + 1).padStart(2, '0') : '00'}<small> / {String(ordered.length).padStart(2, '0')}</small></b>
          </p>
          <SMap places={ordered} activeId={activeId} lang={lang} onPick={pick} onOpen={onOpen} />
          {active && <p className="journey-map-now">{REGIONS[active.region][lang]} · {active.area}</p>}
        </div>
      </aside>

      <div className="journey-main">
        {toolbar}
        <div className="journey-progress" aria-hidden="true">
          <SMap places={ordered} activeId={activeId} lang={lang} compact showRoute={false} />
          <span>{active ? `${REGIONS[active.region][lang]} · ${active.area}` : ''}</span>
          <b>{activeIndex >= 0 ? activeIndex + 1 : 0}/{ordered.length}</b>
          <i style={{ '--p': ordered.length ? (activeIndex + 1) / ordered.length : 0 }} />
        </div>

        {!chapters.length && empty}
        {chapters.map((c) => {
          const cover = c.items.find((p) => p.image?.src) || c.items[0]
          const no = ORDER.indexOf(c.region)
          return (
            <section key={c.region} className={`chapter region-${c.region}`}>
              <header className="chapter-head">
                <PlaceImage place={cover} animated />
                <div className="chapter-text">
                  <span className="chapter-no">{lang === 'vi' ? 'Chương' : 'Chapter'} {NUMERALS[no]}</span>
                  <h2>{REGIONS[c.region][lang]}</h2>
                  <p>{CHAPTER[category][c.region][lang]}</p>
                  <span className="chapter-count">{c.items.length} {category === 'food' ? t('dishes', lang) : t('results', lang)}</span>
                </div>
              </header>
              {c.items.map((p) => {
                n += 1
                return <Story key={p.id} place={p} index={n} lang={lang} mine={reviews[p.id]} onOpen={onOpen} onFavourite={onFavourite} />
              })}
            </section>
          )
        })}
        {chapters.length > 0 && (
          <footer className="journey-end">
            <span>✦</span>
            <p>{t('journeyEnd', lang)}</p>
          </footer>
        )}
      </div>
    </section>
  )
}

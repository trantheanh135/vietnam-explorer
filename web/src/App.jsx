import { Download, Heart, List, Map as MapIcon, Mountain, Search, Utensils, WifiOff, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import MapView from './components/MapView'
import PlaceCard from './components/PlaceCard'
import PlaceDetail from './components/PlaceDetail'
import { useInstallPrompt, useOnline, usePersistentState, usePlaces } from './hooks'
import { t } from './i18n'
import { filterPlaces, REGIONS, TRAVEL_TAGS } from './lib/places'
import { loadReviews, saveReviews, setReview } from './lib/reviews'

export default function App() {
  const [lang, setLang] = usePersistentState('vietnam-explorer:lang', 'vi')
  const [category, setCategory] = usePersistentState('vietnam-explorer:category', 'travel')
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('all')
  const [tag, setTag] = useState('all')
  const [favOnly, setFavOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [reviews, setReviews] = useState(loadReviews)
  const { places: all, stale } = usePlaces()
  const online = useOnline()
  const { canInstall, install } = useInstallPrompt()

  const places = useMemo(() => {
    const list = filterPlaces(all, { category, query, region, tag: category === 'travel' ? tag : 'all' })
    return favOnly ? list.filter((p) => reviews[p.id]?.favourite) : list
  }, [all, category, query, region, tag, favOnly, reviews])

  const selected = all.find((p) => p.id === selectedId && p.category === category) || null

  const switchCategory = (c) => {
    setCategory(c)
    setSelectedId(null)
    setTag('all')
  }

  const updateReview = (id, patch) => {
    const next = setReview(reviews, id, patch)
    setReviews(next)
    saveReviews(next)
  }

  const select = (id) => {
    setSelectedId(id)
    if (id) setMobileView('list')
  }

  const food = category === 'food'

  return (
    <div className={`app theme-${category}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label={t('appName', lang)}>
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <span>
            <strong>{t('appName', lang)}</strong>
            <small>{t('tagline', lang)}</small>
          </span>
        </a>
        <nav className="tabs" aria-label="Category">
          <button type="button" className={!food ? 'active' : ''} onClick={() => switchCategory('travel')}>
            <Mountain size={17} /> {t('travel', lang)}
          </button>
          <button type="button" className={food ? 'active' : ''} onClick={() => switchCategory('food')}>
            <Utensils size={17} /> {t('food', lang)}
          </button>
        </nav>
        <div className="top-actions">
          {canInstall && (
            <button type="button" className="icon-btn" onClick={install} title={t('install', lang)}>
              <Download size={18} /><span className="install-label">{t('install', lang)}</span>
            </button>
          )}
          <button type="button" className="lang" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Language">
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
      </header>

      {(!online || stale) && (
        <div className="notice"><WifiOff size={15} /> {!online ? t('offline', lang) : t('serverDown', lang)}</div>
      )}

      <main className={`content show-${mobileView}`}>
        <section className="panel">
          {selected ? (
            <PlaceDetail
              place={selected}
              lang={lang}
              review={reviews[selected.id]}
              onReview={(patch) => updateReview(selected.id, patch)}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <>
              <div className="panel-head">
                <h1>{food ? t('foodIntro', lang) : t('travelIntro', lang)}</h1>
                <div className="search">
                  <Search size={18} />
                  <input
                    type="search"
                    value={query}
                    placeholder={t('search', lang)}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label={t('search', lang)}
                  />
                  {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear"><X size={16} /></button>}
                </div>
                <div className="chips">
                  {Object.entries(REGIONS).map(([key, label]) => (
                    <button type="button" key={key} className={region === key ? 'chip on' : 'chip'} onClick={() => setRegion(key)}>
                      {label[lang]}
                    </button>
                  ))}
                  <button type="button" className={favOnly ? 'chip on fav' : 'chip'} onClick={() => setFavOnly(!favOnly)}>
                    <Heart size={13} fill={favOnly ? 'currentColor' : 'none'} /> {t('favouritesOnly', lang)}
                  </button>
                </div>
                {!food && (
                  <div className="chips tags-row">
                    {[['all', { vi: 'Tất cả', en: 'All' }], ...Object.entries(TRAVEL_TAGS)].map(([key, label]) => (
                      <button type="button" key={key} className={tag === key ? 'chip small on' : 'chip small'} onClick={() => setTag(key)}>
                        {label[lang]}
                      </button>
                    ))}
                  </div>
                )}
                <p className="count">{places.length} {food ? t('dishes', lang) : t('results', lang)}</p>
              </div>
              {places.length ? (
                <div className="grid">
                  {places.map((p) => (
                    <PlaceCard
                      key={p.id}
                      place={p}
                      lang={lang}
                      mine={reviews[p.id]}
                      selected={p.id === selectedId}
                      onSelect={select}
                      onToggleFavourite={(id, favourite) => updateReview(id, { favourite })}
                    />
                  ))}
                </div>
              ) : (
                <p className="no-results">{t('noResults', lang)}</p>
              )}
            </>
          )}
        </section>
        <section className="map">
          <MapView online={online} places={places} category={category} lang={lang} selected={selected} onSelect={select} />
        </section>
      </main>

      <button type="button" className="view-toggle" onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}>
        {mobileView === 'list' ? <><MapIcon size={18} /> {t('showMap', lang)}</> : <><List size={18} /> {t('showList', lang)}</>}
      </button>
    </div>
  )
}

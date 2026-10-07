import { useMemo, useState } from 'react'
import MapView from './components/MapView'
import PlaceDetail from './components/PlaceDetail'
import PlaceList from './components/PlaceList'
import { FOOD } from './data/food'
import { TRAVEL, TRAVEL_TAGS } from './data/travel'
import { useInstallPrompt, useOnline, usePersistentState } from './hooks'
import { t } from './i18n'
import { filterPlaces, REGIONS } from './lib/places'
import { loadReviews, saveReviews, setReview } from './lib/reviews'

const DATA = { travel: TRAVEL, food: FOOD }

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
  const online = useOnline()
  const { canInstall, install } = useInstallPrompt()

  const places = useMemo(() => {
    const list = filterPlaces(DATA[category], { query, region, tag: category === 'travel' ? tag : 'all' })
    return favOnly ? list.filter((p) => reviews[p.id]?.favourite) : list
  }, [category, query, region, tag, favOnly, reviews])

  const selected = DATA[category].find((p) => p.id === selectedId) || null

  const switchCategory = (c) => {
    setCategory(c)
    setSelectedId(null)
    setTag('all')
  }

  const updateReview = (patch) => {
    const next = setReview(reviews, selectedId, patch)
    setReviews(next)
    saveReviews(next)
  }

  const select = (id) => {
    setSelectedId(id)
    if (id) setMobileView('list')
  }

  return (
    <div className={`app theme-${category}`}>
      <header className="topbar">
        <div className="brand">
          <span className="logo" aria-hidden="true">📍</span>
          <div>
            <h1>{t('appName', lang)}</h1>
            <p>{t('tagline', lang)}</p>
          </div>
        </div>
        <nav className="tabs" aria-label="Category">
          <button type="button" className={category === 'travel' ? 'active travel' : ''} onClick={() => switchCategory('travel')}>🏝️ {t('travel', lang)}</button>
          <button type="button" className={category === 'food' ? 'active food' : ''} onClick={() => switchCategory('food')}>🍜 {t('food', lang)}</button>
        </nav>
        <div className="top-actions">
          {canInstall && <button type="button" className="btn small" onClick={install} title={t('install', lang)}>⬇<span className="install-label"> {t('install', lang)}</span></button>}
          <button type="button" className="lang" onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')} aria-label="Language">
            {lang === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
      </header>

      {!online && <div className="offline-bar">📡 {t('offline', lang)}</div>}

      <div className="filters">
        <input type="search" value={query} placeholder={t('search', lang)} onChange={(e) => setQuery(e.target.value)} aria-label={t('search', lang)} />
        <div className="chips">
          {Object.entries(REGIONS).map(([key, label]) => (
            <button type="button" key={key} className={region === key ? 'chip on' : 'chip'} onClick={() => setRegion(key)}>{label[lang]}</button>
          ))}
          {category === 'travel' && (
            <select value={tag} onChange={(e) => setTag(e.target.value)} aria-label="Type">
              <option value="all">{t('allTypes', lang)}</option>
              {Object.entries(TRAVEL_TAGS).map(([key, label]) => <option key={key} value={key}>{label[lang]}</option>)}
            </select>
          )}
          <button type="button" className={favOnly ? 'chip on fav' : 'chip'} onClick={() => setFavOnly(!favOnly)}>♥ {t('favouritesOnly', lang)}</button>
        </div>
      </div>

      <main className={`content show-${mobileView}`}>
        <section className="panel">
          {selected ? (
            <PlaceDetail
              place={selected}
              category={category}
              lang={lang}
              review={reviews[selected.id]}
              onReview={updateReview}
              onBack={() => setSelectedId(null)}
            />
          ) : (
            <>
              <p className="count">{places.length} {t('results', lang)}</p>
              <PlaceList places={places} category={category} lang={lang} reviews={reviews} selectedId={selectedId} onSelect={select} />
            </>
          )}
        </section>
        <section className="map">
          <MapView online={online} places={places} category={category} lang={lang} selected={selected} onSelect={select} />
        </section>
      </main>

      <button type="button" className="view-toggle" onClick={() => setMobileView(mobileView === 'list' ? 'map' : 'list')}>
        {mobileView === 'list' ? `🗺️ ${t('showMap', lang)}` : `☰ ${t('showList', lang)}`}
      </button>
    </div>
  )
}

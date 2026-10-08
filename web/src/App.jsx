import { Download, Heart, Map as MapIcon, Mountain, Search, SlidersHorizontal, Utensils, WifiOff, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import FeaturedRow from './components/FeaturedRow'
import ListHero from './components/ListHero'
import MapPreview from './components/MapPreview'
import MapView from './components/MapView'
import PlaceCard from './components/PlaceCard'
import PlaceDetail from './components/PlaceDetail'
import { useInstallPrompt, useOnline, usePersistentState, usePlaces } from './hooks'
import { t } from './i18n'
import { areaCounts, featured, filterPlaces, REGIONS, TRAVEL_TAGS } from './lib/places'
import { loadReviews, saveReviews, setReview } from './lib/reviews'

const idFromHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, '')) || null

export default function App() {
  const [lang, setLang] = usePersistentState('vietnam-explorer:lang', 'vi')
  const [category, setCategory] = usePersistentState('vietnam-explorer:category', 'travel')
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('all')
  const [area, setArea] = useState('all')
  const [tag, setTag] = useState('all')
  const [favOnly, setFavOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(idFromHash)
  const [previewId, setPreviewId] = useState(null)
  const [mobileView, setMobileView] = useState('list')
  const [reviews, setReviews] = useState(loadReviews)
  const { places: all, stale } = usePlaces()
  const online = useOnline()
  const { canInstall, install } = useInstallPrompt()

  const selected = all.find((p) => p.id === selectedId) || null
  const food = category === 'food'

  // A shared link (#place-id) opens that place in its own category.
  useEffect(() => {
    if (selected && selected.category !== category) setCategory(selected.category)
  }, [selected]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const url = selectedId ? `#${encodeURIComponent(selectedId)}` : window.location.pathname + window.location.search
    if ((window.location.hash || '') !== (selectedId ? url : '')) window.history.replaceState(null, '', url)
  }, [selectedId])

  useEffect(() => {
    const onHash = () => setSelectedId(idFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const inCategory = useMemo(() => all.filter((p) => p.category === category), [all, category])
  const areas = useMemo(() => areaCounts(inCategory).filter(([, n]) => n > 1).slice(0, 8), [inCategory])

  const places = useMemo(() => {
    const list = filterPlaces(all, { category, query, region, area, tag: food ? 'all' : tag })
    return favOnly ? list.filter((p) => reviews[p.id]?.favourite) : list
  }, [all, category, query, region, area, tag, food, favOnly, reviews])

  const filtered = query || region !== 'all' || area !== 'all' || tag !== 'all' || favOnly
  const highlights = useMemo(() => featured(inCategory, 8), [inCategory])

  const clearFilters = () => {
    setQuery('')
    setRegion('all')
    setArea('all')
    setTag('all')
    setFavOnly(false)
  }

  const switchCategory = (c) => {
    if (c !== category) {
      setCategory(c)
      setTag('all')
      setArea('all')
    }
    setSelectedId(null)
    setPreviewId(null)
    setMobileView('list')
  }

  const updateReview = (id, patch) => {
    const next = setReview(reviews, id, patch)
    setReviews(next)
    saveReviews(next)
  }

  const open = (id) => {
    setSelectedId(id)
    setPreviewId(null)
    setMobileView('list')
    document.querySelector('.panel')?.scrollTo({ top: 0 })
  }

  // On a phone's map view a tapped pin shows a preview card; elsewhere it opens the place.
  const pinTapped = (id) => {
    if (mobileView === 'map' && window.matchMedia('(max-width: 760px)').matches) setPreviewId(id)
    else open(id)
  }

  const preview = previewId && all.find((p) => p.id === previewId)
  const favCount = Object.values(reviews).filter((r) => r.favourite).length

  return (
    <div className={`app theme-${category} ${selected ? 'has-detail' : ''}`}>
      <header className="topbar">
        <a className="brand" href="/" aria-label={t('appName', lang)}>
          <img src="/favicon.svg" alt="" width="36" height="36" />
          <span>
            <strong>{t('appName', lang)}</strong>
            <small>{t('tagline', lang)}</small>
          </span>
        </a>
        <nav className="tabs" aria-label="Category">
          <button type="button" className={!food ? 'active travel' : ''} onClick={() => switchCategory('travel')}>
            <Mountain size={17} /> {t('travel', lang)}
          </button>
          <button type="button" className={food ? 'active food' : ''} onClick={() => switchCategory('food')}>
            <Utensils size={17} /> {t('food', lang)}
          </button>
        </nav>
        <div className="top-actions">
          {canInstall && (
            <button type="button" className="icon-btn" onClick={install} title={t('install', lang)}>
              <Download size={17} /><span className="install-label">{t('install', lang)}</span>
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
              key={selected.id}
              place={selected}
              all={all}
              lang={lang}
              review={reviews[selected.id]}
              onReview={(patch) => updateReview(selected.id, patch)}
              onBack={() => setSelectedId(null)}
              onOpen={open}
            />
          ) : (
            <>
              <ListHero category={category} lang={lang} places={inCategory} highlights={highlights} areas={areas.length}>
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
              </ListHero>

              <div className="filters">
                <div className="chips">
                  {Object.entries(REGIONS).map(([key, label]) => (
                    <button type="button" key={key} className={region === key ? 'chip on' : 'chip'} onClick={() => setRegion(key)}>
                      {label[lang]}
                    </button>
                  ))}
                  <button type="button" className={favOnly ? 'chip on fav' : 'chip'} onClick={() => setFavOnly(!favOnly)}>
                    <Heart size={13} fill={favOnly ? 'currentColor' : 'none'} /> {t('favouritesOnly', lang)}
                    {favCount > 0 && <span className="chip-count">{favCount}</span>}
                  </button>
                </div>
                <div className="chips sub">
                  {food ? (
                    <>
                      <button type="button" className={area === 'all' ? 'chip small on' : 'chip small'} onClick={() => setArea('all')}>{t('allAreas', lang)}</button>
                      {areas.map(([name, n]) => (
                        <button type="button" key={name} className={area === name ? 'chip small on' : 'chip small'} onClick={() => setArea(area === name ? 'all' : name)}>
                          {name} <span className="chip-count">{n}</span>
                        </button>
                      ))}
                    </>
                  ) : (
                    [['all', { vi: 'Tất cả', en: 'All' }], ...Object.entries(TRAVEL_TAGS)].map(([key, label]) => (
                      <button type="button" key={key} className={tag === key ? 'chip small on' : 'chip small'} onClick={() => setTag(key)}>
                        {label[lang]}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {!filtered && highlights.length > 2 && (
                <FeaturedRow title={food ? t('topRated', lang) : t('highlights', lang)} places={highlights} lang={lang} reviews={reviews} onOpen={open} />
              )}

              <div className="section-head">
                <h2>{filtered ? <><SlidersHorizontal size={17} /> {places.length} {food ? t('dishes', lang) : t('results', lang)}</> : (food ? t('allDishes', lang) : t('allPlaces', lang))}</h2>
                {filtered ? (
                  <button type="button" className="link-btn" onClick={clearFilters}>{t('clearFilters', lang)}</button>
                ) : (
                  <span className="section-count">{places.length}</span>
                )}
              </div>

              {places.length ? (
                <div className="grid">
                  {places.map((p, i) => (
                    <PlaceCard
                      key={p.id}
                      place={p}
                      lang={lang}
                      index={i}
                      mine={reviews[p.id]}
                      onSelect={open}
                      onToggleFavourite={(id, favourite) => updateReview(id, { favourite })}
                    />
                  ))}
                </div>
              ) : (
                <div className="no-results">
                  <p>{t('noResults', lang)}</p>
                  <button type="button" className="btn" onClick={clearFilters}>{t('clearFilters', lang)}</button>
                </div>
              )}
            </>
          )}
        </section>
        <section className="map">
          <MapView online={online} places={selected ? [selected, ...places.filter((p) => p.id !== selected.id)] : places}
            category={category} lang={lang} selected={selected || preview || null} onSelect={pinTapped} />
          {preview && mobileView === 'map' && (
            <MapPreview place={preview} lang={lang} onOpen={() => open(preview.id)} onClose={() => setPreviewId(null)} />
          )}
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Navigation">
        <button type="button" className={!food && mobileView === 'list' && !favOnly ? 'on' : ''} onClick={() => { switchCategory('travel'); setFavOnly(false) }}>
          <Mountain size={21} /><span>{t('travel', lang)}</span>
        </button>
        <button type="button" className={food && mobileView === 'list' && !favOnly ? 'on' : ''} onClick={() => { switchCategory('food'); setFavOnly(false) }}>
          <Utensils size={21} /><span>{t('food', lang)}</span>
        </button>
        <button type="button" className={mobileView === 'map' ? 'on' : ''} onClick={() => { setMobileView('map'); setSelectedId(null) }}>
          <MapIcon size={21} /><span>{t('showMap', lang)}</span>
        </button>
        <button type="button" className={favOnly && mobileView === 'list' ? 'on' : ''} onClick={() => { setSelectedId(null); setMobileView('list'); setFavOnly(true) }}>
          <Heart size={21} /><span>{t('favouritesOnly', lang)}</span>
          {favCount > 0 && <i className="dot">{favCount}</i>}
        </button>
      </nav>
    </div>
  )
}

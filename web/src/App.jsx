import { BookOpen, Download, Heart, Map as MapIcon, Mountain, Search, Utensils, WifiOff, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Intro from './components/Intro'
import Journey from './components/Journey'
import MapPreview from './components/MapPreview'
import MapView from './components/MapView'
import PlaceDetail from './components/PlaceDetail'
import { useInstallPrompt, useOnline, usePersistentState, usePlaces } from './hooks'
import { t } from './i18n'
import { areaCounts, featured, filterPlaces, TRAVEL_TAGS } from './lib/places'
import { loadReviews, saveReviews, setReview } from './lib/reviews'

const idFromHash = () => decodeURIComponent(window.location.hash.replace(/^#\/?/, '')) || null

export default function App() {
  const [lang, setLang] = usePersistentState('vietnam-explorer:lang', 'vi')
  const [category, setCategory] = usePersistentState('vietnam-explorer:category', 'travel')
  const [mode, setMode] = useState('journey') // journey | map
  const [query, setQuery] = useState('')
  const [area, setArea] = useState('all')
  const [tag, setTag] = useState('all')
  const [favOnly, setFavOnly] = useState(false)
  const [selectedId, setSelectedId] = useState(idFromHash)
  const [previewId, setPreviewId] = useState(null)
  const [solidBar, setSolidBar] = useState(false)
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
    document.body.classList.toggle('sheet-open', !!selectedId)
  }, [selectedId])

  useEffect(() => {
    const onHash = () => setSelectedId(idFromHash())
    const onKey = (e) => e.key === 'Escape' && setSelectedId(null)
    window.addEventListener('hashchange', onHash)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  // The top bar is see-through over the opening photo and turns solid once the journey starts.
  useEffect(() => {
    const onScroll = () => setSolidBar(window.scrollY > window.innerHeight * 0.75)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const inCategory = useMemo(() => all.filter((p) => p.category === category), [all, category])
  const areas = useMemo(() => areaCounts(inCategory).filter(([, n]) => n > 1).slice(0, 7), [inCategory])
  const slides = useMemo(() => featured(inCategory, 6), [inCategory])
  const counts = useMemo(() => inCategory.reduce((c, p) => ({ ...c, [p.region]: (c[p.region] || 0) + 1 }), {}), [inCategory])

  const places = useMemo(() => {
    const list = filterPlaces(all, { category, query, area, tag: food ? 'all' : tag })
    return favOnly ? list.filter((p) => reviews[p.id]?.favourite) : list
  }, [all, category, query, area, tag, food, favOnly, reviews])

  const filtered = query || area !== 'all' || tag !== 'all' || favOnly
  const clearFilters = () => {
    setQuery('')
    setArea('all')
    setTag('all')
    setFavOnly(false)
  }

  const switchCategory = (c) => {
    if (c !== category) {
      setCategory(c)
      setTag('all')
      setArea('all')
      window.scrollTo({ top: 0 })
    }
    setSelectedId(null)
    setPreviewId(null)
  }

  const updateReview = (id, patch) => {
    const next = setReview(reviews, id, patch)
    setReviews(next)
    saveReviews(next)
  }

  const open = (id) => {
    setSelectedId(id)
    setPreviewId(null)
  }
  const startJourney = () => {
    setMode('journey')
    setTimeout(() => document.getElementById('journey')?.scrollIntoView({ behavior: 'smooth' }), 30)
  }
  const showMap = () => {
    setMode('map')
    setSelectedId(null)
  }
  const showFavourites = () => {
    setMode('journey')
    setFavOnly(true)
    setTimeout(() => document.getElementById('journey')?.scrollIntoView(), 30)
  }

  const preview = previewId && all.find((p) => p.id === previewId)
  const favCount = Object.values(reviews).filter((r) => r.favourite).length

  const toolbar = (
    <div className="toolbar">
      <div className="search">
        <Search size={18} />
        <input type="search" value={query} placeholder={t('search', lang)} onChange={(e) => setQuery(e.target.value)} aria-label={t('search', lang)} />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Clear"><X size={16} /></button>}
      </div>
      <div className="chips">
        <button type="button" className={favOnly ? 'chip on fav' : 'chip'} onClick={() => setFavOnly(!favOnly)}>
          <Heart size={13} fill={favOnly ? 'currentColor' : 'none'} /> {t('favouritesOnly', lang)}
          {favCount > 0 && <span className="chip-count">{favCount}</span>}
        </button>
        {food
          ? areas.map(([name, n]) => (
            <button type="button" key={name} className={area === name ? 'chip on' : 'chip'} onClick={() => setArea(area === name ? 'all' : name)}>
              {name} <span className="chip-count">{n}</span>
            </button>
          ))
          : Object.entries(TRAVEL_TAGS).map(([key, label]) => (
            <button type="button" key={key} className={tag === key ? 'chip on' : 'chip'} onClick={() => setTag(tag === key ? 'all' : key)}>
              {label[lang]}
            </button>
          ))}
        {filtered && <button type="button" className="link-btn" onClick={clearFilters}>{t('clearFilters', lang)}</button>}
      </div>
    </div>
  )

  return (
    <div className={`app theme-${category} mode-${mode}`}>
      <header className={`topbar ${solidBar || mode === 'map' ? 'solid' : ''}`}>
        <a className="brand" href="/" aria-label={t('appName', lang)}>
          <img src="/favicon.svg" alt="" width="34" height="34" />
          <span>
            <strong>{t('appName', lang)}</strong>
            <small>{t('tagline', lang)}</small>
          </span>
        </a>
        <nav className="tabs" aria-label="Category">
          <button type="button" className={!food ? 'active travel' : ''} onClick={() => switchCategory('travel')}>
            <Mountain size={16} /> {t('travel', lang)}
          </button>
          <button type="button" className={food ? 'active food' : ''} onClick={() => switchCategory('food')}>
            <Utensils size={16} /> {t('food', lang)}
          </button>
        </nav>
        <div className="top-actions">
          <button type="button" className="icon-btn mode-btn" onClick={mode === 'map' ? startJourney : showMap}>
            {mode === 'map' ? <><BookOpen size={16} /> {t('journey', lang)}</> : <><MapIcon size={16} /> {t('showMap', lang)}</>}
          </button>
          {canInstall && (
            <button type="button" className="icon-btn" onClick={install} title={t('install', lang)}>
              <Download size={16} /><span className="install-label">{t('install', lang)}</span>
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

      {mode === 'journey' ? (
        <main>
          <Intro category={category} lang={lang} slides={slides} counts={counts} onStart={startJourney} onMap={showMap} />
          <Journey
            category={category}
            places={places}
            lang={lang}
            reviews={reviews}
            toolbar={toolbar}
            onOpen={open}
            onFavourite={(id, favourite) => updateReview(id, { favourite })}
            empty={(
              <div className="no-results">
                <p>{t('noResults', lang)}</p>
                <button type="button" className="btn" onClick={clearFilters}>{t('clearFilters', lang)}</button>
              </div>
            )}
          />
        </main>
      ) : (
        <main className="map-mode">
          <MapView online={online} places={places} category={category} lang={lang} selected={preview || null} onSelect={setPreviewId} />
          {preview && <MapPreview place={preview} lang={lang} onOpen={() => open(preview.id)} onClose={() => setPreviewId(null)} />}
        </main>
      )}

      {selected && (
        <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && setSelectedId(null)}>
          <div className="sheet" role="dialog" aria-modal="true" aria-label={selected.nameVi}>
            <PlaceDetail
              key={selected.id}
              place={selected}
              all={all}
              lang={lang}
              review={reviews[selected.id]}
              onReview={(patch) => updateReview(selected.id, patch)}
              onBack={() => setSelectedId(null)}
              onOpen={(id) => {
                open(id)
                document.querySelector('.sheet')?.scrollTo({ top: 0 })
              }}
            />
          </div>
        </div>
      )}

      <nav className="bottom-nav" aria-label="Navigation">
        <button type="button" className={!food && mode === 'journey' && !favOnly ? 'on' : ''} onClick={() => { switchCategory('travel'); setMode('journey'); setFavOnly(false) }}>
          <Mountain size={21} /><span>{t('travel', lang)}</span>
        </button>
        <button type="button" className={food && mode === 'journey' && !favOnly ? 'on' : ''} onClick={() => { switchCategory('food'); setMode('journey'); setFavOnly(false) }}>
          <Utensils size={21} /><span>{t('food', lang)}</span>
        </button>
        <button type="button" className={mode === 'map' ? 'on' : ''} onClick={showMap}>
          <MapIcon size={21} /><span>{t('showMap', lang)}</span>
        </button>
        <button type="button" className={favOnly && mode === 'journey' ? 'on' : ''} onClick={showFavourites}>
          <Heart size={21} /><span>{t('favouritesOnly', lang)}</span>
          {favCount > 0 && <i className="dot">{favCount}</i>}
        </button>
      </nav>
    </div>
  )
}

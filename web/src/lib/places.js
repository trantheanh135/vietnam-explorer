// Pure helpers: labels, search, filtering and Google Maps URLs.
// A place has the API shape: { id, category, region, nameEn, nameVi, venue, address, area, lat, lng,
//   tags, descEn, descVi, tipEn, tipVi, rating, price, image: { src, page, author, license } }

export const REGIONS = {
  all: { en: 'All Vietnam', vi: 'Cả nước' },
  north: { en: 'North', vi: 'Miền Bắc' },
  central: { en: 'Central', vi: 'Miền Trung' },
  south: { en: 'South', vi: 'Miền Nam' },
}

export const TRAVEL_TAGS = {
  nature: { en: 'Nature', vi: 'Thiên nhiên' },
  beach: { en: 'Beach & island', vi: 'Biển đảo' },
  mountain: { en: 'Mountains', vi: 'Núi rừng' },
  heritage: { en: 'Heritage', vi: 'Di sản' },
  city: { en: 'City', vi: 'Thành phố' },
}

export const VIETNAM_CENTER = { lat: 16.2, lng: 106.3 }

// "Phở Đà Lạt" -> "pho da lat": lets people search without typing Vietnamese accents.
export function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

export const title = (p, lang) => (lang === 'vi' ? p.nameVi : p.nameEn)
export const otherTitle = (p, lang) => (lang === 'vi' ? p.nameEn : p.nameVi)
export const desc = (p, lang) => (lang === 'vi' ? p.descVi : p.descEn)
export const tip = (p, lang) => (lang === 'vi' ? p.tipVi : p.tipEn) || ''

// Words a place can be found by: names, venue, address, area.
function searchWords(p) {
  const text = [p.nameEn, p.nameVi, p.venue, p.address, p.area].filter(Boolean).join(' ')
  return normalize(text).split(/[^a-z0-9]+/).filter(Boolean)
}

// Every query word must be the start of some word of the place ("da lat" -> "Đà Lạt").
export function filterPlaces(places, { category, query = '', region = 'all', tag = 'all', area = 'all' } = {}) {
  const terms = normalize(query).split(/[^a-z0-9]+/).filter(Boolean)
  return places.filter((p) => {
    if (category && p.category !== category) return false
    if (region !== 'all' && p.region !== region) return false
    if (tag !== 'all' && !(p.tags || []).includes(tag)) return false
    if (area !== 'all' && p.area !== area) return false
    if (!terms.length) return true
    const words = searchWords(p)
    return terms.every((term) => words.some((w) => w.startsWith(term)))
  })
}

/** Areas with the most places first: [["Hà Nội", 22], ["Hội An", 4], …]. */
export function areaCounts(places) {
  const counts = new Map()
  for (const p of places) counts.set(p.area, (counts.get(p.area) || 0) + 1)
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'vi'))
}

/** Great-circle distance in km. */
export function distanceKm(a, b) {
  const rad = Math.PI / 180
  const dLat = (b.lat - a.lat) * rad
  const dLng = (b.lng - a.lng) * rad
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(h))
}

/** Other places within `maxKm`, closest first, each with its `km`. */
export function nearby(places, place, { maxKm = 2, limit = 8 } = {}) {
  return places
    .filter((p) => p.id !== place.id)
    .map((p) => ({ place: p, km: distanceKm(place, p) }))
    .filter((x) => x.km <= maxKm)
    .sort((a, b) => a.km - b.km)
    .slice(0, limit)
}

/** 0.35 -> "350 m", 1.24 -> "1,2 km" (vi) / "1.2 km" (en). */
export function formatDistance(km, lang) {
  if (km < 1) return `${Math.max(10, Math.round((km * 1000) / 10) * 10)} m`
  const s = km.toFixed(1)
  return `${lang === 'vi' ? s.replace('.', ',') : s} km`
}

/** The places worth showing first: food by rating, travel in curated order; those with video/GIF lead. */
export function featured(places, limit = 8) {
  const score = (p) => (p.rating || 0) + (p.video?.url || p.animatedUrl ? 1 : 0)
  return [...places].sort((a, b) => score(b) - score(a)).slice(0, limit)
}

function searchText(p) {
  if (p.category === 'food') return [p.venue, p.address || p.area].filter(Boolean).join(', ')
  return `${p.nameVi}, ${p.area}, Vietnam`
}

export function googleMapsUrl(p) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchText(p))}`
}

export function directionsUrl(p) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchText(p))}`
}

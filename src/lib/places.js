// Pure helpers: search, filtering and Google Maps URLs.

export const REGIONS = {
  all: { en: 'All Vietnam', vi: 'Cả nước' },
  north: { en: 'North', vi: 'Miền Bắc' },
  central: { en: 'Central', vi: 'Miền Trung' },
  south: { en: 'South', vi: 'Miền Nam' },
}

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

// Words a place can be found by: names, dish, address, city/province.
function searchWords(place) {
  const text = [place.name, place.nameVi, place.dish, place.dishVi, place.place, place.address,
    place.province, place.city].filter(Boolean).join(' ')
  return normalize(text).split(/[^a-z0-9]+/).filter(Boolean)
}

// Every query word must be the start of some word of the place ("da lat" -> "Đà Lạt").
export function filterPlaces(places, { query = '', region = 'all', tag = 'all' } = {}) {
  const terms = normalize(query).split(/[^a-z0-9]+/).filter(Boolean)
  return places.filter((p) => {
    if (region !== 'all' && p.region !== region) return false
    if (tag !== 'all' && !(p.tags || []).includes(tag)) return false
    if (!terms.length) return true
    const words = searchWords(p)
    return terms.every((term) => words.some((w) => w.startsWith(term)))
  })
}

export function placeTitle(place, lang) {
  if (place.dish) return lang === 'vi' ? place.dishVi : place.dish
  return lang === 'vi' ? place.nameVi : place.name
}

function searchText(place) {
  if (place.address) return `${place.place}, ${place.address}`
  return `${place.nameVi}, ${place.province}, Vietnam`
}

export function googleMapsUrl(place) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(searchText(place))}`
}

export function directionsUrl(place) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(searchText(place))}`
}

export const VIETNAM_CENTER = { lat: 16.2, lng: 106.3 }

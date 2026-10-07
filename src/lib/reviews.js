// Personal ratings, notes and favourites, kept in this browser only.
const KEY = 'vietnam-explorer:my-reviews:v1'

export function loadReviews() {
  try {
    const raw = localStorage.getItem(KEY)
    const data = raw ? JSON.parse(raw) : {}
    return data && typeof data === 'object' ? data : {}
  } catch {
    return {}
  }
}

export function saveReviews(reviews) {
  try {
    localStorage.setItem(KEY, JSON.stringify(reviews))
    return true
  } catch {
    return false
  }
}

export function setReview(reviews, id, patch) {
  const current = reviews[id] || { rating: 0, note: '', favourite: false, visited: false }
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
  return { ...reviews, [id]: next }
}

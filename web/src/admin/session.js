const KEY = 'vietnam-explorer:admin'

export function loadSession() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || 'null')
    return s && new Date(s.expiresAt) > new Date() ? s : null
  } catch {
    return null
  }
}

export function saveSession(s) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* private mode: session lasts until reload */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}

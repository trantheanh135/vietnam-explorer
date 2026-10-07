import { useEffect, useState } from 'react'
import { API, cachedPlaces, fetchPlaces, seedPlaces } from './lib/api'

/**
 * Places to show: instantly from the last saved copy (or the built-in seed), then refreshed from
 * the server. `stale` is true when the server could not be reached.
 */
export function usePlaces() {
  const [state, setState] = useState(() => ({ places: cachedPlaces() || seedPlaces, stale: false }))
  useEffect(() => {
    if (!API) return
    let alive = true
    fetchPlaces()
      .then((places) => alive && setState({ places, stale: false }))
      .catch(() => alive && setState((s) => ({ ...s, stale: true })))
    return () => {
      alive = false
    }
  }, [])
  return state
}

export function useOnline() {
  const [online, setOnline] = useState(typeof navigator === 'undefined' ? true : navigator.onLine)
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

// Captures the browser's "install this app" prompt so we can show our own button.
export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState(null)
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    const installed = () => setPromptEvent(null)
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', installed)
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installed)
    }
  }, [])
  const install = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
  }
  return { canInstall: !!promptEvent, install }
}

export function usePersistentState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key)
      return raw === null ? initial : JSON.parse(raw)
    } catch {
      return initial
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      /* storage unavailable (private mode) — keep in memory only */
    }
  }, [key, value])
  return [value, setValue]
}

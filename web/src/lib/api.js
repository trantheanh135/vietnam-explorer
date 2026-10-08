// Talks to the Vietnam Explorer API on the k8s server (through ngrok).
// VITE_API_URL e.g. https://<ngrok-domain>/vietnam-explorer/api  (dev: http://localhost:8085/api)
import SEED from '../data/seed.json'
import { upload as blobUpload } from '@vercel/blob/client'

export const API = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// ngrok's free plan answers browsers with a warning page unless this header is sent.
const NGROK = { 'ngrok-skip-browser-warning': '1' }
const CACHE_KEY = 'vietnam-explorer:places:v2'

export class ApiError extends Error {
  constructor(message, status, fields) {
    super(message)
    this.status = status
    this.fields = fields || {}
  }
}

async function request(path, { method = 'GET', body, token, timeout = 15000, form } = {}) {
  if (!API) throw new ApiError('Chưa cấu hình máy chủ (VITE_API_URL).', 0)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeout)
  try {
    const headers = { ...NGROK }
    if (token) headers.Authorization = `Bearer ${token}`
    if (body !== undefined) headers['Content-Type'] = 'application/json'
    const res = await fetch(`${API}${path}`, {
      method,
      headers,
      body: form ?? (body !== undefined ? JSON.stringify(body) : undefined),
      signal: ctrl.signal,
    })
    if (res.status === 204) return null
    const data = await res.json().catch(() => null)
    if (!res.ok) throw new ApiError(data?.error || `Lỗi ${res.status}`, res.status, data?.fields)
    return data
  } catch (e) {
    if (e instanceof ApiError) throw e
    throw new ApiError(e.name === 'AbortError' ? 'Máy chủ không phản hồi.' : 'Không kết nối được máy chủ.', 0)
  } finally {
    clearTimeout(timer)
  }
}

// ---------- public ----------

export function cachedPlaces() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    const data = raw ? JSON.parse(raw) : null
    return Array.isArray(data) && data.length ? data : null
  } catch {
    return null
  }
}

export const seedPlaces = SEED

/** Live places from the server; remembered for offline use. */
export async function fetchPlaces() {
  const data = await request('/places', { timeout: 10000 })
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data))
  } catch {
    /* storage full or unavailable */
  }
  return data
}

/** Absolute URL for an image src ("uploads/…" lives on the API server). */
export function imageUrl(src) {
  if (!src) return null
  return /^https?:\/\//.test(src) ? src : `${API}/${src}`
}

export const isApiImage = (src) => !!src && !/^https?:\/\//.test(src)

/** Uploaded photos must be fetched with the ngrok header, then shown from a blob URL. */
const blobCache = new Map()
export function loadApiImage(src) {
  if (!blobCache.has(src)) {
    blobCache.set(src, fetch(imageUrl(src), { headers: NGROK })
      .then((r) => (r.ok ? r.blob() : Promise.reject(new Error(String(r.status)))))
      .then((b) => URL.createObjectURL(b))
      .catch((e) => {
        blobCache.delete(src)
        throw e
      }))
  }
  return blobCache.get(src)
}

// ---------- media (videos, animated images) ----------

/** "https://youtu.be/ID", "…watch?v=ID", "…/shorts/ID" → "ID" (or null). */
export function youtubeId(url) {
  const m = /^https:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/.exec(url || '')
  return m ? m[1] : null
}

/**
 * Uploads a video or animated image straight from the browser to Vercel Blob. The Vercel function
 * /api/media-upload checks the admin token and the file type/size before Blob accepts it.
 */
export async function uploadMedia(token, kind, file, slug, onProgress) {
  const ext = (file.name.split('.').pop() || '').toLowerCase()
  const safe = (slug || 'place').toLowerCase().replace(/[^a-z0-9-]+/g, '-').slice(0, 60) || 'place'
  const res = await blobUpload(`media/${kind}/${safe}.${ext}`, file, {
    access: 'public',
    handleUploadUrl: '/api/media-upload',
    clientPayload: JSON.stringify({ token }),
    multipart: file.size > 8 * 1024 * 1024,
    contentType: file.type,
    onUploadProgress: ({ percentage }) => onProgress?.(percentage),
  })
  return res.url
}

// ---------- admin ----------

export const admin = {
  login: (username, password) => request('/auth/login', { method: 'POST', body: { username, password } }),
  list: (token) => request('/admin/places', { token }),
  create: (token, place) => request('/admin/places', { method: 'POST', body: place, token }),
  update: (token, id, place) => request(`/admin/places/${encodeURIComponent(id)}`, { method: 'PUT', body: place, token }),
  remove: (token, id) => request(`/admin/places/${encodeURIComponent(id)}`, { method: 'DELETE', token }),
  get: (token, id) => request(`/admin/places/${encodeURIComponent(id)}`, { token }),
  videoConfig: (token) => request('/admin/video/config', { token }),
  generateVideo: (token, id, prompt) =>
    request(`/admin/places/${encodeURIComponent(id)}/video`, { method: 'POST', body: prompt ? { prompt } : {}, token, timeout: 90000 }),
  deleteVideo: (token, id) => request(`/admin/places/${encodeURIComponent(id)}/video`, { method: 'DELETE', token }),
  upload: (token, blob, name = 'photo.jpg') => {
    const form = new FormData()
    form.append('file', blob, name)
    return request('/admin/uploads', { method: 'POST', form, token, timeout: 60000 })
  },
}

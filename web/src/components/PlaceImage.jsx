import { Mountain, Utensils } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { imageUrl, isApiImage, loadApiImage } from '../lib/api'

// Four slow zoom/pan directions; each place always gets the same one.
function motionFor(id = '') {
  let h = 0
  for (const ch of id) h = (h * 31 + ch.charCodeAt(0)) | 0
  return `kb kb-${(Math.abs(h) % 4) + 1}`
}

/**
 * A place photo that fades in. Uploaded photos (on the ngrok-hosted API) are fetched with the
 * ngrok header and shown from a blob URL; places without a photo get a designed placeholder.
 * `animated` adds a slow Ken Burns zoom/pan (used for the cover on the detail page).
 */
export default function PlaceImage({ place, className = '', eager = false, animated = false }) {
  const src = place.image?.src
  const api = isApiImage(src)
  const [blob, setBlob] = useState({ src: null, url: null })
  const [loadedUrl, setLoadedUrl] = useState(null)
  const [failedUrl, setFailedUrl] = useState(null)
  const imgRef = useRef(null)

  const url = !src ? null : api ? (blob.src === src ? blob.url : null) : imageUrl(src)

  useEffect(() => {
    if (!api || !src) return undefined
    let alive = true
    loadApiImage(src)
      .then((u) => alive && setBlob({ src, url: u }))
      .catch(() => alive && setFailedUrl(src))
    return () => {
      alive = false
    }
  }, [api, src])

  // A cached photo can finish loading before React attaches onLoad; check it directly.
  useEffect(() => {
    const el = imgRef.current
    if (url && el?.complete && el.naturalWidth > 0) setLoadedUrl(url)
  }, [url])

  const loaded = url && loadedUrl === url
  const failed = failedUrl === src || failedUrl === url
  const Icon = place.category === 'food' ? Utensils : Mountain
  return (
    <div className={`pimg ${place.category} ${className} ${animated ? motionFor(place.id) : ''}`}>
      {(!loaded || failed) && (
        <div className="pimg-placeholder" aria-hidden="true">
          <Icon size={34} strokeWidth={1.5} />
        </div>
      )}
      {url && !failed && (
        <img
          ref={imgRef}
          src={url}
          alt=""
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          className={loaded ? 'is-loaded' : ''}
          onLoad={() => setLoadedUrl(url)}
          onError={() => setFailedUrl(url)}
        />
      )}
    </div>
  )
}

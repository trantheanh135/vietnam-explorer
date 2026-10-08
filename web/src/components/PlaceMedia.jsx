import { useEffect, useRef, useState } from 'react'
import PlaceImage from './PlaceImage'

/** The place's own video file (MP4/WebM), if it has one. YouTube links can't autoplay inline, so they don't count. */
export function playableVideo(place) {
  const url = place?.video?.url
  return url && /\.(mp4|webm)(\?|$)/i.test(url) ? url : null
}

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

/**
 * A silent looping clip laid over the photo. It only downloads and plays while it is on screen
 * (and `active`), and fades in once it is actually playing, so the photo shows until then.
 */
function LoopVideo({ src, active, restart }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return undefined
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: '100px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (active && visible && !reducedMotion()) {
      if (restart) v.currentTime = 0
      v.play().catch(() => {})
    } else {
      v.pause()
    }
  }, [active, visible, restart])

  return (
    <video
      ref={ref}
      className={`loop-video ${playing ? 'on' : ''}`}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      onPlaying={() => setPlaying(true)}
    />
  )
}

/** Photo, plus the place's clip on top when it has one. */
export default function PlaceMedia({ place, active = true, restart = false, eager = false, animated = false }) {
  const video = playableVideo(place)
  return (
    <>
      <PlaceImage place={place} eager={eager} animated={animated} />
      {video && <LoopVideo src={video} active={active} restart={restart} />}
    </>
  )
}

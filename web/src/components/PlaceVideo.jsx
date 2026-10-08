import { Play, Sparkles, Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { t } from '../i18n'

const reducedMotion = () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

/**
 * The place's AI video, layered over its photo: fades in once it actually plays, muted + looping
 * (browsers only autoplay muted video). Respects "reduce motion": then it waits for a tap.
 */
export default function PlaceVideo({ url, lang, ai = false }) {
  const ref = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(true)
  const [autoplay] = useState(() => !reducedMotion())

  useEffect(() => {
    setPlaying(false)
    setMuted(true)
  }, [url])

  const play = () => ref.current?.play().catch(() => {})
  const toggleSound = () => {
    const v = ref.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
    if (v.paused) play()
  }

  return (
    <>
      <video
        ref={ref}
        key={url}
        className={`place-video ${playing ? 'is-playing' : ''}`}
        src={url}
        autoPlay={autoplay}
        muted
        loop
        playsInline
        preload={autoplay ? 'auto' : 'metadata'}
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      {ai && <span className="ai-badge" title={t('aiVideo', lang)}><Sparkles size={12} /> AI</span>}
      {playing ? (
        <button type="button" className="round-btn sound" onClick={toggleSound} aria-label={t('sound', lang)} aria-pressed={!muted}>
          {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
        </button>
      ) : (
        !autoplay && (
          <button type="button" className="round-btn play" onClick={play} aria-label={t('play', lang)}>
            <Play size={20} fill="currentColor" />
          </button>
        )
      )}
    </>
  )
}

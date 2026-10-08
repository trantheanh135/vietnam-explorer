import { Film, ImageIcon, ImagePlay, Play } from 'lucide-react'
import { useEffect, useState } from 'react'
import { youtubeId } from '../lib/api'
import PlaceImage from './PlaceImage'
import PlaceVideo from './PlaceVideo'

const LABELS = {
  video: { vi: 'Video', en: 'Video', Icon: Film },
  animated: { vi: 'Ảnh động', en: 'Animated', Icon: ImagePlay },
  photo: { vi: 'Ảnh', en: 'Photo', Icon: ImageIcon },
}

/** YouTube: a thumbnail first; the (heavy) YouTube player loads only after a tap. */
function YoutubeCover({ id, lang }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => setPlaying(false), [id])
  if (playing) {
    return (
      <iframe
        className="hero-yt"
        src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0`}
        title="YouTube"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
    )
  }
  return (
    <>
      <img className="hero-fill" src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`} alt="" />
      <button type="button" className="round-btn play yt" onClick={() => setPlaying(true)} aria-label={lang === 'vi' ? 'Phát video' : 'Play video'}>
        <Play size={22} fill="currentColor" />
      </button>
    </>
  )
}

/**
 * The cover of a place: video → animated image → photo (which always animates slowly).
 * When more than one exists, visitors can switch between them.
 */
export default function HeroMedia({ place, lang }) {
  const videoUrl = place.video?.url
  const modes = [videoUrl && 'video', place.animatedUrl && 'animated', 'photo'].filter(Boolean)
  const [mode, setMode] = useState(modes[0])
  useEffect(() => setMode(modes[0]), [place.id, videoUrl, place.animatedUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  const yt = youtubeId(videoUrl)
  const isAi = (place.video?.model || '').startsWith('veo')

  return (
    <>
      <PlaceImage place={place} eager animated={mode === 'photo'} />
      {mode === 'animated' && <img className="hero-fill" src={place.animatedUrl} alt="" />}
      {mode === 'video' && (yt ? <YoutubeCover id={yt} lang={lang} /> : <PlaceVideo url={videoUrl} lang={lang} ai={isAi} />)}
      {modes.length > 1 && (
        <div className="media-switch" role="tablist" aria-label="Media">
          {modes.map((m) => {
            const { Icon } = LABELS[m]
            return (
              <button key={m} type="button" role="tab" aria-selected={mode === m} className={mode === m ? 'on' : ''} onClick={() => setMode(m)}>
                <Icon size={14} /> {LABELS[m][lang]}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}

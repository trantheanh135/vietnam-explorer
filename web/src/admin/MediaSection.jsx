import { Film, ImagePlay, Link2, Loader2, Sparkles, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { uploadMedia, youtubeId } from '../lib/api'

/**
 * Video (uploaded MP4/WebM or a YouTube link) and animated image (GIF / animated WebP) for a place.
 * Files upload straight to Vercel Blob; the URLs are saved with the place on "Lưu".
 * Without either, the cover photo still animates by itself (slow zoom/pan).
 */
export default function MediaSection({ token, slug, videoUrl, animatedUrl, onChange, errors }) {
  const [progress, setProgress] = useState({}) // { video: 42, animated: 10 }
  const [error, setError] = useState('')
  const [ytInput, setYtInput] = useState('')
  const videoFile = useRef(null)
  const gifFile = useRef(null)
  const yt = youtubeId(videoUrl)

  const pick = async (kind, file) => {
    if (!file) return
    const limits = { video: [/^video\/(mp4|webm)$/, 50, 'MP4 hoặc WebM'], animated: [/^image\/(gif|webp)$/, 15, 'GIF hoặc WebP'] }[kind]
    if (!limits[0].test(file.type)) return setError(`Chỉ nhận ${limits[2]}.`)
    if (file.size > limits[1] * 1024 * 1024) return setError(`Tệp quá lớn (tối đa ${limits[1]} MB).`)
    setError('')
    setProgress((p) => ({ ...p, [kind]: 0 }))
    try {
      const url = await uploadMedia(token, kind, file, slug, (pct) => setProgress((p) => ({ ...p, [kind]: Math.round(pct) })))
      onChange(kind === 'video' ? { videoUrl: url } : { animatedUrl: url })
    } catch (e) {
      setError(/fetch|network/i.test(e.message) ? 'Không tải lên được (mất mạng hoặc đang chạy ở máy cục bộ).' : e.message)
    } finally {
      setProgress((p) => ({ ...p, [kind]: undefined }))
      if (videoFile.current) videoFile.current.value = ''
      if (gifFile.current) gifFile.current.value = ''
    }
  }

  const useYoutube = () => {
    if (!youtubeId(ytInput.trim())) return setError('Link YouTube không hợp lệ.')
    setError('')
    onChange({ videoUrl: ytInput.trim() })
    setYtInput('')
  }

  const busy = progress.video !== undefined || progress.animated !== undefined

  return (
    <div className="media-box">
      <p className="video-note">
        <Sparkles size={15} /> Nếu không có video hoặc ảnh động, ảnh bìa vẫn <b>tự chuyển động</b> (zoom/lia chậm). Nếu có nhiều loại, người xem có thể chuyển qua lại.
      </p>

      <div className="media-grid">
        {/* ---------- animated image ---------- */}
        <div className="media-card">
          <h4><ImagePlay size={17} /> Ảnh động (GIF / WebP)</h4>
          <div className="video-preview">
            {animatedUrl ? <img src={animatedUrl} alt="" /> : <div className="video-empty"><ImagePlay size={28} strokeWidth={1.5} /><span>Chưa có ảnh động</span></div>}
            {progress.animated !== undefined && <Progress pct={progress.animated} />}
          </div>
          <input ref={gifFile} type="file" accept="image/gif,image/webp" hidden onChange={(e) => pick('animated', e.target.files?.[0])} />
          <div className="media-actions">
            <button type="button" className="btn small" disabled={busy} onClick={() => gifFile.current?.click()}><Upload size={15} /> Tải ảnh động lên</button>
            {animatedUrl && <button type="button" className="btn small danger" onClick={() => onChange({ animatedUrl: '' })}><Trash2 size={15} /> Bỏ</button>}
          </div>
          <p className="admin-muted small">Tối đa 15 MB.</p>
          {errors?.animatedUrl && <p className="form-error small">{errors.animatedUrl}</p>}
        </div>

        {/* ---------- video ---------- */}
        <div className="media-card">
          <h4><Film size={17} /> Video</h4>
          <div className="video-preview">
            {yt ? (
              <img src={`https://i.ytimg.com/vi/${yt}/hqdefault.jpg`} alt="" />
            ) : videoUrl ? (
              <video src={videoUrl} controls muted playsInline preload="metadata" />
            ) : (
              <div className="video-empty"><Film size={28} strokeWidth={1.5} /><span>Chưa có video</span></div>
            )}
            {yt && <span className="yt-chip">YouTube</span>}
            {progress.video !== undefined && <Progress pct={progress.video} />}
          </div>
          <input ref={videoFile} type="file" accept="video/mp4,video/webm" hidden onChange={(e) => pick('video', e.target.files?.[0])} />
          <div className="media-actions">
            <button type="button" className="btn small" disabled={busy} onClick={() => videoFile.current?.click()}><Upload size={15} /> Tải video lên</button>
            {videoUrl && <button type="button" className="btn small danger" onClick={() => onChange({ videoUrl: '' })}><Trash2 size={15} /> Bỏ</button>}
          </div>
          <div className="inline">
            <input value={ytInput} onChange={(e) => setYtInput(e.target.value)} placeholder="…hoặc dán link YouTube"
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), useYoutube())} />
            <button type="button" className="btn small" disabled={!ytInput.trim()} onClick={useYoutube}><Link2 size={15} /> Dùng</button>
          </div>
          <p className="admin-muted small">MP4/WebM tối đa 50 MB — nên dùng clip ngắn (10–30 giây). Bộ nhớ miễn phí tổng cộng 1 GB.</p>
          {errors?.videoUrl && <p className="form-error small">{errors.videoUrl}</p>}
        </div>
      </div>
      {error && <p className="form-error small">{error}</p>}
    </div>
  )
}

function Progress({ pct }) {
  return (
    <div className="video-progress">
      <Loader2 size={24} className="spin" />
      <b>Đang tải lên… {pct}%</b>
      <div className="bar"><span style={{ width: `${pct}%` }} /></div>
    </div>
  )
}

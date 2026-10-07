import { AlertTriangle, Clapperboard, Loader2, RefreshCw, Sparkles, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { admin } from '../lib/api'

const fmtUsd = (n) => `$${Number(n || 0).toFixed(2)}`

function useElapsed(since) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    if (!since) return undefined
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [since])
  if (!since) return ''
  const s = Math.max(0, Math.round((now - new Date(since).getTime()) / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

/**
 * AI video for a saved place: Google Veo animates the place's real photo into an 8-second clip.
 * While generating, the place is re-fetched every few seconds until the video is ready or fails.
 */
export default function VideoSection({ token, place, hasPhoto, photoChanged, onChange, onAuthError }) {
  const [config, setConfig] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [prompt, setPrompt] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const video = place?.video
  const generating = video?.status === 'generating'
  const elapsed = useElapsed(generating ? video.startedAt : null)
  const onChangeRef = useRef(onChange)
  onChangeRef.current = onChange

  const handle = (e) => (e.status === 401 ? onAuthError(e) : setError(e.message))

  useEffect(() => {
    admin.videoConfig(token).then(setConfig).catch(handle)
  }, [token, video?.status]) // eslint-disable-line react-hooks/exhaustive-deps

  // Follow a running generation until it finishes.
  useEffect(() => {
    if (!generating) return undefined
    const id = setInterval(() => {
      admin.get(token, place.id).then((p) => onChangeRef.current(p)).catch(() => {})
    }, 6000)
    return () => clearInterval(id)
  }, [generating, token, place?.id])

  if (!place) {
    return <p className="admin-muted small">Lưu địa điểm trước, sau đó có thể tạo video AI từ ảnh của địa điểm.</p>
  }

  const start = async () => {
    setBusy(true)
    setError('')
    try {
      onChange(await admin.generateVideo(token, place.id, showPrompt ? prompt.trim() : ''))
    } catch (e) {
      handle(e)
    } finally {
      setBusy(false)
    }
  }

  const remove = async () => {
    if (!window.confirm('Xoá video AI của địa điểm này?')) return
    setBusy(true)
    try {
      onChange(await admin.deleteVideo(token, place.id))
    } catch (e) {
      handle(e)
    } finally {
      setBusy(false)
    }
  }

  const limitReached = config && config.usedToday >= config.dailyLimit
  const canStart = config?.enabled && hasPhoto && !photoChanged && !generating && !busy && !limitReached

  return (
    <div className="video-box">
      {config && !config.enabled && (
        <p className="video-note warn"><AlertTriangle size={16} /> Tạo video AI chưa bật: thiếu {config.missing}. Xem hướng dẫn trong README.</p>
      )}
      {config?.enabled && (
        <p className="video-note">
          <Sparkles size={15} /> Google Veo ({config.model.replace('-generate-preview', '')}) · {config.durationSeconds} giây · {config.resolution}
          {' · '}≈ <b>{fmtUsd(config.costPerVideo)}</b>/video · hôm nay {config.usedToday}/{config.dailyLimit} · tổng đã dùng {fmtUsd(config.totalCost)}
        </p>
      )}

      <div className="video-row">
        <div className="video-preview">
          {video?.url ? (
            <video src={video.url} controls muted loop playsInline preload="metadata" />
          ) : (
            <div className="video-empty"><Clapperboard size={30} strokeWidth={1.5} /><span>Chưa có video</span></div>
          )}
          {generating && (
            <div className="video-progress">
              <Loader2 size={26} className="spin" />
              <b>Đang tạo video… {elapsed}</b>
              <span>Thường mất 1–3 phút (tối đa ~6 phút). Có thể đóng cửa sổ này.</span>
            </div>
          )}
        </div>

        <div className="video-actions">
          <button type="button" className="btn primary" onClick={start} disabled={!canStart}>
            {busy ? <Loader2 size={16} className="spin" /> : video?.url ? <RefreshCw size={16} /> : <Sparkles size={16} />}
            {video?.url ? 'Tạo lại video' : 'Tạo video AI'}{config?.enabled ? ` (≈ ${fmtUsd(config.costPerVideo)})` : ''}
          </button>
          {video?.url && !generating && (
            <button type="button" className="btn small danger" onClick={remove} disabled={busy}><Trash2 size={15} /> Xoá video</button>
          )}
          {!hasPhoto && <p className="admin-muted small">Cần ảnh trước: Veo làm chuyển động chính bức ảnh thật của địa điểm.</p>}
          {photoChanged && <p className="admin-muted small">Bạn vừa đổi ảnh — bấm “Lưu thay đổi” trước rồi mới tạo video.</p>}
          {limitReached && <p className="admin-muted small">Đã đạt giới hạn video hôm nay.</p>}
          {video?.status === 'failed' && video.error && <p className="form-error small">Lần trước thất bại: {video.error}</p>}
          {video?.status === 'ready' && video.error && <p className="form-error small">Lần tạo gần nhất thất bại ({video.error}); đang giữ video cũ.</p>}
          {error && <p className="form-error small">{error}</p>}

          <label className="checkline">
            <input type="checkbox" checked={showPrompt} onChange={(e) => setShowPrompt(e.target.checked)} /> Tự mô tả chuyển động (tiếng Anh)
          </label>
          {showPrompt && (
            <textarea rows={3} value={prompt} onChange={(e) => setPrompt(e.target.value)}
              placeholder="Slow drone shot gliding over the bay at sunrise, gentle waves…" />
          )}
          <p className="admin-muted small">Video được đánh dấu “AI” cho người xem. Google chỉ tính tiền khi tạo thành công.</p>
        </div>
      </div>
    </div>
  )
}

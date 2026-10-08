import { ImagePlus, Link2, Loader2, Mountain, Save, Trash2, Utensils, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import PlaceImage from '../components/PlaceImage'
import { admin } from '../lib/api'
import { resizeImage } from '../lib/image'
import { REGIONS, TRAVEL_TAGS } from '../lib/places'
import LocationPicker from './LocationPicker'
import MediaSection from './MediaSection'

const EMPTY = {
  region: 'north', nameEn: '', nameVi: '', venue: '', address: '', area: '', lat: null, lng: null,
  tags: [], descEn: '', descVi: '', tipEn: '', tipVi: '', rating: 4, price: '', image: null, published: true,
  videoUrl: '', animatedUrl: '',
}

function Field({ label, error, hint, children, wide }) {
  return (
    <label className={`field ${wide ? 'wide' : ''} ${error ? 'has-error' : ''}`}>
      <span>{label}</span>
      {children}
      {error ? <em className="form-error small">{error}</em> : hint ? <em className="admin-muted small">{hint}</em> : null}
    </label>
  )
}

export default function PlaceEditor({ token, initial, category: initialCategory, onCancel, onSaved, onAuthError }) {
  const isNew = !initial
  const [p, setP] = useState(() => ({
    ...EMPTY,
    ...(initial || {}),
    category: initialCategory,
    videoUrl: initial?.video?.url || '',
    animatedUrl: initial?.animatedUrl || '',
  }))
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imageUrlInput, setImageUrlInput] = useState('')
  const fileRef = useRef(null)
  const food = p.category === 'food'

  const set = (patch) => {
    setP((cur) => ({ ...cur, ...patch }))
    // Editing a field clears its error from the last save attempt.
    setErrors((cur) => {
      const next = { ...cur }
      Object.keys(patch).forEach((k) => {
        delete next[k]
        if (k === 'image') delete next['image.src']
      })
      return next
    })
  }
  const setImage = (patch) => set({ image: { ...(p.image || {}), ...patch } })

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !saving && onCancel()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel, saving])

  const upload = async (file) => {
    if (!file) return
    setUploading(true)
    setFormError('')
    try {
      const blob = await resizeImage(file)
      const { src } = await admin.upload(token, blob)
      set({ image: { src, author: '', license: '', page: '' } })
    } catch (e) {
      if (e.status === 401) onAuthError(e)
      else setFormError(e.message || 'Không tải được ảnh lên.')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setFormError('')
    const body = {
      ...p,
      tags: food ? [] : p.tags,
      rating: food ? Number(p.rating) : null,
      price: food ? p.price : null,
      venue: food ? p.venue : null,
      image: p.image?.src ? p.image : null,
    }
    delete body.createdAt
    delete body.updatedAt
    delete body.video
    if (isNew) delete body.id
    try {
      const saved = isNew ? await admin.create(token, body) : await admin.update(token, initial.id, body)
      onSaved(saved, isNew)
    } catch (err) {
      if (err.status === 401) return onAuthError(err)
      setErrors(err.fields || {})
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tag) => set({ tags: p.tags.includes(tag) ? p.tags.filter((x) => x !== tag) : [...p.tags, tag] })

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && !saving && onCancel()}>
      <form className={`modal theme-${p.category}`} onSubmit={save} noValidate>
        <header className="modal-head">
          <h2>{food ? <Utensils size={20} /> : <Mountain size={20} />} {isNew ? (food ? 'Thêm review món ăn' : 'Thêm địa điểm du lịch') : `Sửa: ${initial.nameVi}`}</h2>
          <button type="button" className="icon-close" onClick={onCancel} aria-label="Đóng"><X size={20} /></button>
        </header>

        <div className="modal-body">
          {formError && <p className="form-error" role="alert">{formError}</p>}

          <fieldset>
            <legend>Thông tin chính</legend>
            <div className="field-grid">
              <Field label={food ? 'Tên món (tiếng Việt) *' : 'Tên địa điểm (tiếng Việt) *'} error={errors.nameVi}>
                <input value={p.nameVi} onChange={(e) => set({ nameVi: e.target.value })} placeholder={food ? 'Bún chả' : 'Vịnh Hạ Long'} />
              </Field>
              <Field label={food ? 'Dish name (English) *' : 'Place name (English) *'} error={errors.nameEn}>
                <input value={p.nameEn} onChange={(e) => set({ nameEn: e.target.value })} placeholder={food ? 'Bun cha' : 'Ha Long Bay'} />
              </Field>
              {food && (
                <>
                  <Field label="Tên quán *" error={errors.venue}>
                    <input value={p.venue || ''} onChange={(e) => set({ venue: e.target.value })} placeholder="Bún chả Hương Liên" />
                  </Field>
                  <Field label="Địa chỉ" error={errors.address}>
                    <input value={p.address || ''} onChange={(e) => set({ address: e.target.value })} placeholder="24 Lê Văn Hưu, Hai Bà Trưng, Hà Nội" />
                  </Field>
                </>
              )}
              <Field label={food ? 'Thành phố *' : 'Tỉnh / thành phố *'} error={errors.area}>
                <input value={p.area} onChange={(e) => set({ area: e.target.value })} placeholder="Hà Nội" />
              </Field>
              <Field label="Miền *" error={errors.region}>
                <select value={p.region} onChange={(e) => set({ region: e.target.value })}>
                  {['north', 'central', 'south'].map((r) => <option key={r} value={r}>{REGIONS[r].vi}</option>)}
                </select>
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Vị trí trên bản đồ *</legend>
            <LocationPicker lat={p.lat} lng={p.lng} onChange={(lat, lng) => set({ lat, lng })} error={errors.lat || errors.lng} />
          </fieldset>

          <fieldset>
            <legend>{food ? 'Bài review' : 'Giới thiệu'}</legend>
            {food ? (
              <div className="field-grid">
                <Field label="Điểm đánh giá (1–5) *" error={errors.rating} hint="Làm tròn đến 0,5 sao">
                  <input type="number" min="1" max="5" step="0.5" value={p.rating ?? ''} onChange={(e) => set({ rating: e.target.value })} />
                </Field>
                <Field label="Giá" error={errors.price}>
                  <input value={p.price || ''} onChange={(e) => set({ price: e.target.value })} placeholder="50.000 – 90.000₫" />
                </Field>
              </div>
            ) : (
              <div className="tag-picks">
                {Object.entries(TRAVEL_TAGS).map(([key, label]) => (
                  <button type="button" key={key} className={`chip ${p.tags.includes(key) ? 'on' : ''}`} onClick={() => toggleTag(key)}>{label.vi}</button>
                ))}
              </div>
            )}
            <div className="field-grid">
              <Field label={food ? 'Nhận xét (tiếng Việt) *' : 'Mô tả (tiếng Việt) *'} error={errors.descVi} wide>
                <textarea rows={4} value={p.descVi} onChange={(e) => set({ descVi: e.target.value })} />
              </Field>
              <Field label={food ? 'Review (English) *' : 'Description (English) *'} error={errors.descEn} wide>
                <textarea rows={4} value={p.descEn} onChange={(e) => set({ descEn: e.target.value })} />
              </Field>
              <Field label={food ? 'Nên gọi món gì (tiếng Việt)' : 'Thời điểm đẹp nhất (tiếng Việt)'} error={errors.tipVi}>
                <input value={p.tipVi || ''} onChange={(e) => set({ tipVi: e.target.value })} placeholder={food ? 'Phở tái lăn' : 'Tháng 10 – 4'} />
              </Field>
              <Field label={food ? 'Must try (English)' : 'Best time (English)'} error={errors.tipEn}>
                <input value={p.tipEn || ''} onChange={(e) => set({ tipEn: e.target.value })} placeholder={food ? 'Wok-seared beef pho' : 'Oct – Apr'} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Ảnh</legend>
            <div className="photo-row">
              <PlaceImage place={{ category: p.category, image: p.image }} className="photo-preview" />
              <div className="photo-actions">
                <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => upload(e.target.files?.[0])} />
                <button type="button" className="btn" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 size={16} className="spin" /> : <ImagePlus size={16} />} {uploading ? 'Đang tải lên…' : 'Tải ảnh lên'}
                </button>
                <div className="inline">
                  <input value={imageUrlInput} onChange={(e) => setImageUrlInput(e.target.value)} placeholder="…hoặc dán link ảnh https://" />
                  <button type="button" className="btn small" disabled={!/^https:\/\/\S+$/.test(imageUrlInput.trim())}
                    onClick={() => { set({ image: { src: imageUrlInput.trim(), author: '', license: '', page: '' } }); setImageUrlInput('') }}>
                    <Link2 size={15} /> Dùng
                  </button>
                </div>
                {p.image?.src && (
                  <button type="button" className="btn small danger" onClick={() => set({ image: null })}><Trash2 size={15} /> Bỏ ảnh</button>
                )}
                <p className="admin-muted small">Ảnh từ điện thoại được tự động thu nhỏ trước khi tải lên. Chỉ dùng ảnh bạn có quyền sử dụng.</p>
                {errors['image.src'] && <p className="form-error small">{errors['image.src']}</p>}
              </div>
            </div>
            {p.image?.src && (
              <div className="field-grid three">
                <Field label="Tác giả ảnh"><input value={p.image.author || ''} onChange={(e) => setImage({ author: e.target.value })} /></Field>
                <Field label="Giấy phép"><input value={p.image.license || ''} onChange={(e) => setImage({ license: e.target.value })} placeholder="CC BY-SA 4.0" /></Field>
                <Field label="Link nguồn"><input value={p.image.page || ''} onChange={(e) => setImage({ page: e.target.value })} placeholder="https://…" /></Field>
              </div>
            )}
          </fieldset>

          <fieldset>
            <legend>Ảnh động & video</legend>
            <MediaSection
              token={token}
              slug={initial?.id || p.nameEn}
              videoUrl={p.videoUrl}
              animatedUrl={p.animatedUrl}
              onChange={set}
              errors={errors}
            />
          </fieldset>
        </div>

        <footer className="modal-foot">
          <label className="switch">
            <input type="checkbox" checked={p.published} onChange={(e) => set({ published: e.target.checked })} />
            <span /> {p.published ? 'Hiển thị công khai' : 'Đang ẩn (chỉ admin thấy)'}
          </label>
          <div className="foot-buttons">
            <button type="button" className="btn" onClick={onCancel} disabled={saving}>Huỷ</button>
            <button type="submit" className="btn primary" disabled={saving || uploading}>
              {saving ? <Loader2 size={16} className="spin" /> : <Save size={16} />} {isNew ? 'Thêm' : 'Lưu thay đổi'}
            </button>
          </div>
        </footer>
      </form>
    </div>
  )
}

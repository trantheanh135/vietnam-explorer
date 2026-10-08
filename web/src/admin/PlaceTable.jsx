import { Clapperboard, EyeOff, ImagePlay, Pencil, Search, Star, Trash2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import PlaceImage from '../components/PlaceImage'
import { filterPlaces, REGIONS } from '../lib/places'

const TABS = [
  ['all', 'Tất cả'],
  ['travel', 'Du lịch'],
  ['food', 'Ẩm thực'],
]

export default function PlaceTable({ places, onEdit, onDelete }) {
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const rows = useMemo(
    () => filterPlaces(places, { category: tab === 'all' ? undefined : tab, query }),
    [places, tab, query],
  )
  const count = (c) => places.filter((p) => c === 'all' || p.category === c).length

  return (
    <section>
      <div className="table-tools">
        <div className="seg">
          {TABS.map(([key, label]) => (
            <button key={key} type="button" className={tab === key ? 'on' : ''} onClick={() => setTab(key)}>
              {label} <span>{count(key)}</span>
            </button>
          ))}
        </div>
        <label className="search">
          <Search size={17} />
          <input type="search" placeholder="Tìm theo tên, quán, tỉnh…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>

      <div className="rows">
        {rows.map((p) => (
          <div key={p.id} className={`row ${p.published ? '' : 'is-hidden'}`}>
            <PlaceImage place={p} className="row-thumb" />
            <div className="row-main">
              <strong>
                {p.nameVi}
                {p.video?.url && <Clapperboard size={14} className="has-video" aria-label="có video" />}
                {p.animatedUrl && <ImagePlay size={14} className="has-video" aria-label="có ảnh động" />}
              </strong>
              <span>{p.category === 'food' ? `${p.venue} · ${p.area}` : `${p.nameEn} · ${p.area}`}</span>
            </div>
            <span className={`badge region-${p.region}`}>{REGIONS[p.region].vi}</span>
            <span className="row-meta">
              {p.category === 'food' ? <><Star size={13} fill="currentColor" strokeWidth={0} className="gold" /> {p.rating?.toFixed(1)}</> : 'Du lịch'}
            </span>
            <span className="row-meta">{p.published ? 'Đang hiện' : <><EyeOff size={13} /> Đang ẩn</>}</span>
            <span className="row-actions">
              <button type="button" className="btn small" onClick={() => onEdit(p)}><Pencil size={15} /> Sửa</button>
              <button type="button" className="btn small danger" onClick={() => onDelete(p)} aria-label={`Xoá ${p.nameVi}`}><Trash2 size={15} /></button>
            </span>
          </div>
        ))}
        {!rows.length && <p className="admin-muted">Không có mục nào.</p>}
      </div>
    </section>
  )
}

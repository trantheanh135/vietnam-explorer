import { ExternalLink, LogOut, Mountain, Plus, Utensils } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { admin, API } from '../lib/api'
import './admin.css'
import LoginCard from './LoginCard'
import PlaceEditor from './PlaceEditor'
import PlaceTable from './PlaceTable'
import { clearSession, loadSession, saveSession } from './session'

export default function AdminApp() {
  const [session, setSession] = useState(loadSession)
  const [places, setPlaces] = useState(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null) // null | { place } | { category }
  const [toast, setToast] = useState('')

  const logout = useCallback((message = '') => {
    clearSession()
    setSession(null)
    setPlaces(null)
    setEditing(null)
    setError(message)
  }, [])

  const handleError = useCallback((e) => {
    if (e.status === 401) logout(e.message)
    else setError(e.message)
  }, [logout])

  const reload = useCallback(() => {
    if (!session) return
    admin.list(session.token).then(setPlaces).catch(handleError)
  }, [session, handleError])

  useEffect(reload, [reload])

  useEffect(() => {
    document.title = 'Quản trị · Vietnam Explorer'
  }, [])

  useEffect(() => {
    if (!toast) return undefined
    const id = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(id)
  }, [toast])

  if (!API) {
    return <div className="admin-center"><div className="admin-card"><h1>Quản trị</h1><p>Chưa cấu hình máy chủ API (VITE_API_URL).</p></div></div>
  }

  if (!session) {
    return (
      <LoginCard
        message={error}
        onLogin={(s) => {
          saveSession(s)
          setError('')
          setSession(s)
        }}
      />
    )
  }

  const onSaved = (saved, isNew) => {
    setEditing(null)
    setToast(isNew ? `Đã thêm “${saved.nameVi}”` : `Đã lưu “${saved.nameVi}”`)
    reload()
  }

  const onDelete = async (p) => {
    if (!window.confirm(`Xoá “${p.nameVi}”? Không thể hoàn tác.`)) return
    try {
      await admin.remove(session.token, p.id)
      setToast(`Đã xoá “${p.nameVi}”`)
      reload()
    } catch (e) {
      handleError(e)
    }
  }

  return (
    <div className="admin">
      <header className="admin-bar">
        <a className="brand" href="/">
          <img src="/favicon.svg" alt="" width="30" height="30" />
          <span><strong>Quản trị</strong><small>Vietnam Explorer</small></span>
        </a>
        <div className="admin-bar-actions">
          <button type="button" className="btn primary" onClick={() => setEditing({ category: 'travel' })}><Plus size={17} /><Mountain size={16} /> Thêm địa điểm</button>
          <button type="button" className="btn primary food" onClick={() => setEditing({ category: 'food' })}><Plus size={17} /><Utensils size={16} /> Thêm review món ăn</button>
          <a className="btn" href="/" target="_blank" rel="noopener noreferrer"><ExternalLink size={16} /> Xem trang chính</a>
          <button type="button" className="btn" onClick={() => logout()}><LogOut size={16} /> Đăng xuất</button>
        </div>
      </header>

      {error && <div className="admin-error" role="alert">{error} <button type="button" onClick={() => setError('')}>×</button></div>}

      <main className="admin-main">
        {places === null ? <p className="admin-muted">Đang tải…</p> : (
          <PlaceTable places={places} onEdit={(place) => setEditing({ place })} onDelete={onDelete} />
        )}
      </main>

      {editing && (
        <PlaceEditor
          token={session.token}
          initial={editing.place}
          category={editing.place?.category || editing.category}
          onCancel={() => setEditing(null)}
          onSaved={onSaved}
          onAuthError={handleError}
          onVideoChange={(next) => setPlaces((list) => list?.map((x) => (x.id === next.id ? next : x)))}
        />
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  )
}

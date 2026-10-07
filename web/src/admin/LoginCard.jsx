import { Loader2, LogIn } from 'lucide-react'
import { useState } from 'react'
import { admin } from '../lib/api'

export default function LoginCard({ message, onLogin }) {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    try {
      onLogin(await admin.login(username, password))
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-center">
      <form className="admin-card login" onSubmit={submit}>
        <img src="/favicon.svg" alt="" width="48" height="48" />
        <h1>Quản trị Vietnam Explorer</h1>
        <p className="admin-muted">Đăng nhập để thêm địa điểm và bài review món ăn.</p>
        {(error || message) && <p className="form-error" role="alert">{error || message}</p>}
        <label className="field">
          <span>Tên đăng nhập</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required />
        </label>
        <label className="field">
          <span>Mật khẩu</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required autoFocus />
        </label>
        <button type="submit" className="btn primary wide" disabled={busy}>
          {busy ? <Loader2 size={17} className="spin" /> : <LogIn size={17} />} Đăng nhập
        </button>
      </form>
    </div>
  )
}

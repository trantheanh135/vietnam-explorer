// Rules for admin media uploads that go straight from the browser to Vercel Blob.
// (Files in api/ starting with "_" are helpers, not routes.)
import { createHash } from 'node:crypto'
import { jwtVerify } from 'jose'

export const MB = 1024 * 1024
export const RULES = {
  video: { types: ['video/mp4', 'video/webm'], max: 50 * MB },
  animated: { types: ['image/gif', 'image/webp'], max: 15 * MB },
}

/** Only media/video/<name>.(mp4|webm) and media/animated/<name>.(gif|webp). */
export function checkUpload(pathname) {
  const m = /^media\/(video|animated)\/[a-z0-9-]{1,80}\.(mp4|webm|gif|webp)$/.exec(pathname || '')
  if (!m) throw new Error('Tên tệp không hợp lệ')
  const kind = m[1]
  const ext = m[2]
  if ((kind === 'video') !== (ext === 'mp4' || ext === 'webm')) throw new Error('Sai loại tệp')
  return { allowedContentTypes: RULES[kind].types, maximumSizeInBytes: RULES[kind].max }
}

/**
 * The admin's login token from the Spring Boot API: HS256 signed with SHA-256(APP_JWT_SECRET)
 * (see AuthService.java), claim role = "admin". Throws if missing, forged or expired.
 */
export async function verifyAdmin(token, secret) {
  if (!secret) throw new Error('Máy chủ chưa cấu hình APP_JWT_SECRET')
  if (!token) throw new Error('Chưa đăng nhập')
  const key = createHash('sha256').update(secret, 'utf8').digest()
  const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
  if (payload.role !== 'admin') throw new Error('Không có quyền')
  return payload
}

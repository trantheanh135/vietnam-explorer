import { createHash } from 'node:crypto'
import { SignJWT } from 'jose'
import { describe, expect, it } from 'vitest'
import { checkUpload, MB, verifyAdmin } from './_media-policy.js'

const secret = 'test-secret'
const key = createHash('sha256').update(secret).digest()
const sign = (claims, exp = '1h') => new SignJWT(claims).setProtectedHeader({ alg: 'HS256' }).setSubject('admin').setIssuedAt().setExpirationTime(exp).sign(key)

describe('checkUpload', () => {
  it('allows videos and animated images with size limits', () => {
    expect(checkUpload('media/video/ha-long-bay.mp4')).toEqual({ allowedContentTypes: ['video/mp4', 'video/webm'], maximumSizeInBytes: 50 * MB })
    expect(checkUpload('media/animated/pho-thin.gif').maximumSizeInBytes).toBe(15 * MB)
  })
  it('rejects other paths and mismatched types', () => {
    for (const bad of ['media/video/x.gif', 'media/animated/x.mp4', 'videos/x.mp4', 'media/video/../x.mp4', 'media/video/X Y.mp4', '']) {
      expect(() => checkUpload(bad), bad).toThrow()
    }
  })
})

describe('verifyAdmin', () => {
  it('accepts a valid admin token', async () => {
    expect((await verifyAdmin(await sign({ role: 'admin' }), secret)).sub).toBe('admin')
  })
  it('rejects missing, forged, expired and non-admin tokens', async () => {
    await expect(verifyAdmin('', secret)).rejects.toThrow()
    await expect(verifyAdmin(await sign({ role: 'admin' }), 'other-secret')).rejects.toThrow()
    await expect(verifyAdmin(await sign({ role: 'admin' }, '-1m'), secret)).rejects.toThrow()
    await expect(verifyAdmin(await sign({ role: 'viewer' }), secret)).rejects.toThrow()
    await expect(verifyAdmin(await sign({ role: 'admin' }), '')).rejects.toThrow()
  })
})

// POST /api/media-upload — issues short-lived Vercel Blob client tokens to the logged-in admin, so
// videos and GIFs upload directly from the browser to Blob (never through ngrok or the home server).
import { handleUpload } from '@vercel/blob/client'
import { checkUpload, verifyAdmin } from './_media-policy.js'

export async function POST(request) {
  try {
    const body = await request.json()
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const { token } = JSON.parse(clientPayload || '{}')
        await verifyAdmin(token, process.env.APP_JWT_SECRET)
        return { ...checkUpload(pathname), addRandomSuffix: true, cacheControlMaxAge: 31536000 }
      },
    })
    return Response.json(result)
  } catch (e) {
    return Response.json({ error: e.message || 'Không thể tải lên' }, { status: 400 })
  }
}

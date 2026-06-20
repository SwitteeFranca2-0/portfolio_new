import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

// Not edge — needs to call DB when no photo param provided
export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url)
  const title    = searchParams.get('title') ?? 'Franca Uvere'
  const sub      = searchParams.get('sub')   ?? 'Software & Automation Engineer'

  // Use passed photo, or fetch from DB if not provided
  let photoUrl = searchParams.get('photo') ?? ''
  if (!photoUrl) {
    try {
      const { BioModel } = await import('@/lib/models/BioModel')
      const bio = await BioModel.get()
      photoUrl = bio?.photoUrl ?? ''
    } catch { /* fall through */ }
  }

  // Fetch photo as base64 for ImageResponse
  let photoData: string | null = null
  if (photoUrl) {
    try {
      const res = await fetch(photoUrl)
      if (res.ok) {
        const buf  = await res.arrayBuffer()
        const mime = res.headers.get('content-type') ?? 'image/jpeg'
        const b64  = Buffer.from(buf).toString('base64')
        photoData  = `data:${mime};base64,${b64}`
      }
    } catch { /* skip photo if fetch fails */ }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display: 'flex',
          alignItems: 'center',
          padding: '0 72px',
          background: 'linear-gradient(135deg, #060608 0%, #0d0f18 60%, #0a1020 100%)',
          fontFamily: 'system-ui, sans-serif',
          gap: '60px',
        }}
      >
        {/* Teal accent line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #3ECFCF, #7B5EA7)' }} />

        {/* Grid dots */}
        <div style={{
          position: 'absolute', inset: 0, opacity: .04,
          backgroundImage: 'radial-gradient(#3ECFCF 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />

        {/* Bottom-left glow */}
        <div style={{
          position: 'absolute', bottom: -120, left: -120,
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(62,207,207,0.1) 0%, transparent 70%)',
        }} />

        {/* Right glow (behind photo) */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,94,167,0.15) 0%, transparent 70%)',
        }} />

        {/* ── Left: text ── */}
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {/* Site name */}
          <div style={{ fontSize: 18, color: '#3ECFCF', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: 28, fontWeight: 400 }}>
            francauvere.dev
          </div>

          {/* Title */}
          <div style={{
            fontSize: title.length > 28 ? 50 : 66,
            fontWeight: 700, color: '#F0EEF8',
            lineHeight: 1.08, marginBottom: 18,
          }}>
            {title}
          </div>

          {/* Sub */}
          <div style={{ fontSize: 24, color: '#6B6880', fontWeight: 400 }}>
            {sub}
          </div>

          {/* Teal divider */}
          <div style={{ width: 64, height: 3, background: '#3ECFCF', marginTop: 32, borderRadius: 2 }} />
        </div>

        {/* ── Right: profile photo ── */}
        {photoData && (
          <div style={{
            position: 'relative',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Glow ring */}
            <div style={{
              position: 'absolute',
              width: 280, height: 280,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(62,207,207,0.2) 0%, transparent 70%)',
            }} />
            {/* Photo — clipped hexagon-ish via border-radius */}
            <img
              src={photoData}
              width={220}
              height={260}
              style={{
                objectFit: 'cover',
                borderRadius: '12px',
                border: '2px solid rgba(62,207,207,0.4)',
                boxShadow: '0 0 40px rgba(62,207,207,0.2)',
              }}
            />
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}

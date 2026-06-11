import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { SignJWT } from 'jose'

const BUCKET = process.env.NEXT_PUBLIC_UPLOAD_BUCKET ?? process.env.UPLOAD_BUCKET ?? 'local'

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null

    if (!file || !file.size) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const buffer   = Buffer.from(await file.arrayBuffer())
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || `${Date.now()}-upload`
    const folder   = (form.get('folder') as string | null)?.replace(/[^a-zA-Z0-9/_-]/g, '') ?? ''

    // Full storage key: folder/filename or just filename
    const key = folder ? `${folder}/${safeName}` : safeName

    if (BUCKET === 'online') {
      return uploadSupabaseStorage(buffer, key, file.type)
    }
    return uploadLocal(buffer, key)
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// ── Local ─────────────────────────────────────────────────────────────────────

async function uploadLocal(buffer: Buffer, filename: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)
  console.log('Local upload')
  return NextResponse.json({ url: `/uploads/${filename}` })
}

// ── Supabase Storage (direct service, JWT-signed) ─────────────────────────────

async function getServiceJwt(): Promise<string> {
  const jwtSecret = process.env.JWT_SECRET
  if (!jwtSecret) throw new Error('JWT_SECRET not set')

  const secret = new TextEncoder().encode(jwtSecret)
  return new SignJWT({ role: 'service_role', iss: 'supabase', iat: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)
}

async function uploadSupabaseStorage(buffer: Buffer, filename: string, contentType: string) {
  const storageUrl = process.env.S3_ENDPOINT?.replace(/\/$/, '')
  const bucketName = process.env.BUCKET_NAME ?? 'portfolio'

  if (!storageUrl) {
    return NextResponse.json({ error: 'S3_ENDPOINT not set' }, { status: 500 })
  }

  const token = await getServiceJwt()

  const res = await fetch(`${storageUrl}/object/${bucketName}/${filename}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey':        token,
      'Content-Type':  contentType,
      'x-upsert':      'true',
    },
    body: new Blob([new Uint8Array(buffer)], { type: contentType }),
  })
  console.log('Storage upload complete')

  if (!res.ok) {
    const err = await res.text()
    console.error('Storage upload failed:', err)
    return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 })
  }

  const publicUrl = `${storageUrl}/object/public/${bucketName}/${filename}`
  return NextResponse.json({ url: publicUrl })
}

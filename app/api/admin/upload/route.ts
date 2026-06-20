import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { SignJWT } from 'jose'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

// ── Storage mode detection ────────────────────────────────────────────────────
// IS_S3_ENDPOINT=true  → standard S3 (AWS, R2, MinIO, Spaces, Backblaze…)
// JWT_SECRET set       → Supabase Storage REST API
// neither              → local filesystem (public/uploads/)
function getMode(): 's3' | 'supabase' | 'local' {
  if (process.env.IS_S3_ENDPOINT) return 's3'
  if (process.env.JWT_SECRET)     return 'supabase'
  return 'local'
}

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
    const key      = folder ? `${folder}/${safeName}` : safeName

    const mode = getMode()
    if (mode === 's3')       return uploadS3(buffer, key, file.type)
    if (mode === 'supabase') return uploadSupabase(buffer, key, file.type)
    return uploadLocal(buffer, key)
  } catch (e) {
    console.error('Upload error:', e)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// ── Local filesystem ──────────────────────────────────────────────────────────

async function uploadLocal(buffer: Buffer, filename: string) {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await mkdir(uploadDir, { recursive: true })
  await writeFile(path.join(uploadDir, filename), buffer)
  return NextResponse.json({ url: `/uploads/${filename}` })
}

// ── Standard S3 (AWS / Cloudflare R2 / MinIO / DigitalOcean Spaces / etc.) ───
// Required env vars: S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME
// Optional: REGION (defaults to us-east-1)

function getS3Client() {
  const endpoint  = process.env.S3_ENDPOINT
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('S3 not configured — set S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY')
  }

  return new S3Client({
    endpoint,
    region:      process.env.REGION ?? 'us-east-1',
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true,   // required for MinIO and most non-AWS providers
  })
}

async function uploadS3(buffer: Buffer, key: string, contentType: string) {
  const bucketName = process.env.BUCKET_NAME
  if (!bucketName) {
    return NextResponse.json({ error: 'BUCKET_NAME not set' }, { status: 500 })
  }

  const client = getS3Client()
  await client.send(new PutObjectCommand({
    Bucket:      bucketName,
    Key:         key,
    Body:        buffer,
    ContentType: contentType,
  }))

  const endpoint  = process.env.S3_ENDPOINT!.replace(/\/$/, '')
  const publicUrl = `${endpoint}/${bucketName}/${key}`
  return NextResponse.json({ url: publicUrl })
}

// ── Supabase Storage (self-hosted, JWT-signed) ────────────────────────────────
// Required env vars: S3_ENDPOINT (storage service URL), JWT_SECRET, BUCKET_NAME

async function getServiceJwt(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  return new SignJWT({ role: 'service_role', iss: 'supabase', iat: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)
}

async function uploadSupabase(buffer: Buffer, key: string, contentType: string) {
  const storageUrl = process.env.S3_ENDPOINT?.replace(/\/$/, '')
  const bucketName = process.env.BUCKET_NAME ?? 'portfolio'

  if (!storageUrl) {
    return NextResponse.json({ error: 'S3_ENDPOINT not set' }, { status: 500 })
  }

  const token = await getServiceJwt()
  const res = await fetch(`${storageUrl}/object/${bucketName}/${key}`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'apikey':        token,
      'Content-Type':  contentType,
      'x-upsert':      'true',
    },
    body: new Blob([new Uint8Array(buffer)], { type: contentType }),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Supabase storage upload failed:', err)
    return NextResponse.json({ error: `Upload failed: ${err}` }, { status: 500 })
  }

  return NextResponse.json({ url: `${storageUrl}/object/public/${bucketName}/${key}` })
}

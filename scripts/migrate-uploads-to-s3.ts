/**
 * Migrates files from public/uploads/ to Supabase Storage.
 * Generates a service_role JWT from JWT_SECRET to bypass RLS.
 *
 * Usage: npx tsx scripts/migrate-uploads-to-s3.ts
 */
import 'dotenv/config'
import { readdir, readFile } from 'fs/promises'
import path from 'path'
import { SignJWT } from 'jose'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../lib/generated/prisma/client'

const STORAGE_URL = (process.env.S3_ENDPOINT ?? '').replace(/\/$/, '')
const BUCKET      = process.env.BUCKET_NAME ?? 'portfolio'
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

if (!STORAGE_URL || !process.env.JWT_SECRET) {
  console.error('Missing: S3_ENDPOINT, JWT_SECRET')
  process.exit(1)
}

async function getServiceJwt(): Promise<string> {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  return new SignJWT({ role: 'service_role', iss: 'supabase', iat: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(secret)
}

function mimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  return ({ pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', svg: 'image/svg+xml' } as Record<string, string>)[ext ?? ''] ?? 'application/octet-stream'
}

const pool    = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false })
const adapter = new PrismaPg(pool, { schema: 'portfolio' })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma  = new PrismaClient({ adapter } as any)

async function main() {
  let files: string[]
  try {
    files = (await readdir(UPLOADS_DIR)).filter(f => !f.startsWith('.'))
  } catch {
    console.log('No public/uploads/ — nothing to migrate.')
    return
  }

  if (!files.length) { console.log('public/uploads/ is empty.'); return }

  console.log(`\nFound ${files.length} file(s) — uploading to ${STORAGE_URL}/${BUCKET}/\n`)

  const token  = await getServiceJwt()
  const urlMap: Record<string, string> = {}

  for (const filename of files) {
    const oldUrl = `/uploads/${filename}`
    try {
      const buffer  = await readFile(path.join(UPLOADS_DIR, filename))
      const mime    = mimeType(filename)
      const res     = await fetch(`${STORAGE_URL}/object/${BUCKET}/${filename}`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}`, apikey: token, 'Content-Type': mime, 'x-upsert': 'true' },
        body: new Blob([new Uint8Array(buffer)], { type: mime }),
      })
      if (!res.ok) throw new Error(await res.text())
      const newUrl = `${STORAGE_URL}/object/public/${BUCKET}/${filename}`
      console.log(`  ✓  ${filename}\n     ${newUrl}`)
      urlMap[oldUrl] = newUrl
    } catch (e) {
      console.error(`  ✗  ${filename}: ${e}`)
    }
  }

  if (!Object.keys(urlMap).length) return

  console.log('\nUpdating database...\n')
  let updated = 0

  const bio = await prisma.bio.findUnique({ where: { id: 1 } })
  if (bio?.resumeUrl && urlMap[bio.resumeUrl]) {
    await prisma.bio.update({ where: { id: 1 }, data: { resumeUrl: urlMap[bio.resumeUrl] } })
    console.log('  ✓  Bio.resumeUrl'); updated++
  }
  if (bio?.photoUrl && urlMap[bio.photoUrl]) {
    await prisma.bio.update({ where: { id: 1 }, data: { photoUrl: urlMap[bio.photoUrl] } })
    console.log('  ✓  Bio.photoUrl'); updated++
  }

  for (const p of await prisma.project.findMany({ select: { id: true, imageUrl: true } })) {
    if (p.imageUrl && urlMap[p.imageUrl]) {
      await prisma.project.update({ where: { id: p.id }, data: { imageUrl: urlMap[p.imageUrl] } })
      console.log(`  ✓  Project #${p.id} imageUrl`); updated++
    }
  }

  for (const m of await prisma.projectMedia.findMany({ select: { id: true, url: true } })) {
    if (urlMap[m.url]) {
      await prisma.projectMedia.update({ where: { id: m.id }, data: { url: urlMap[m.url] } })
      console.log(`  ✓  ProjectMedia #${m.id}`); updated++
    }
  }

  console.log(`\n✅ Done — ${Object.keys(urlMap).length} file(s) uploaded, ${updated} DB record(s) updated.\n`)
}

main()
  .catch(e => { console.error('Failed:', e); process.exit(1) })
  .finally(() => prisma.$disconnect().then(() => pool.end()))

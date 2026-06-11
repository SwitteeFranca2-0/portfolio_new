/**
 * Auth utilities — JWT signing/verification for admin sessions.
 * Uses the auth.users table in Railway PostgreSQL (bcrypt passwords).
 * No dependency on Supabase API — connects directly to the DB.
 */
import { SignJWT, jwtVerify } from 'jose'
import { Pool } from 'pg'
import bcrypt from 'bcryptjs'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'portfolio-admin-secret-change-in-production'
)
const COOKIE_NAME = 'admin_session'
const MAX_AGE    = 60 * 60 * 24 * 7  // 7 days

export async function signAdminToken(userId: string, email: string) {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { sub: string; email: string }
  } catch {
    return null
  }
}

export async function verifyCredentials(email: string, password: string) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: false,
  })
  try {
    const { rows } = await pool.query<{ id: string; encrypted_password: string }>(
      'SELECT id, encrypted_password FROM auth.users WHERE email = $1 LIMIT 1',
      [email]
    )
    if (!rows.length) return null
    const match = await bcrypt.compare(password, rows[0].encrypted_password)
    return match ? { id: rows[0].id, email } : null
  } finally {
    await pool.end()
  }
}

export const cookieOptions = {
  name:     COOKIE_NAME,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
  maxAge:   MAX_AGE,
}

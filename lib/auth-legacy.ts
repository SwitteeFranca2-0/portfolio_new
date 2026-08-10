/**
 * Legacy auth utilities — JWT signing/verification for admin sessions.
 * Temporary transitional file used only by old /api/admin/auth/login and /logout routes.
 * DELETED in Task 4 of the NextAuth conversion plan once those routes are removed.
 * For new auth logic, see lib/auth.ts (NextAuth setup).
 */
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { AdminUserModel } from './models/AdminUserModel'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'portfolio-admin-secret-change-in-production'
)
const COOKIE_NAME = 'admin_session'
const MAX_AGE = 60 * 60 * 24 * 7  // 7 days

export async function verifyCredentials(email: string, password: string) {
  const user = await AdminUserModel.findByEmail(email)
  if (!user) return null
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return null
  return { id: user.id, email: user.email }
}

export async function signAdminToken(userId: string, email: string) {
  return new SignJWT({ sub: userId, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET)
}

export const cookieOptions = {
  name:     COOKIE_NAME,
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
  maxAge:   MAX_AGE,
}

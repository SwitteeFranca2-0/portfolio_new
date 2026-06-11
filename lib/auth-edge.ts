/**
 * Edge-runtime-safe auth utilities — only jose (no Node.js APIs).
 * Used by middleware.ts which runs in the Edge Runtime.
 * For full auth (bcrypt + pg), see lib/auth.ts.
 */
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'portfolio-admin-secret-change-in-production'
)

export const COOKIE_NAME = 'admin_session'

export async function verifyAdminToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET)
    return payload as { sub: string; email: string }
  } catch {
    return null
  }
}

import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { SignJWT } from 'jose'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { AdminUserModel } from './models/AdminUserModel'

// Legacy JWT secret for backward compatibility with old routes (will be removed in Task 3-4)
const SECRET = new TextEncoder().encode(
  process.env.ADMIN_JWT_SECRET ?? 'portfolio-admin-secret-change-in-production'
)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:    { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email    = credentials?.email as string | undefined
        const password = credentials?.password as string | undefined
        if (!email || !password) return null

        const user = await AdminUserModel.findByEmail(email)
        if (!user) return null

        const valid = await bcrypt.compare(password, user.password)
        if (!valid) return null

        return { id: user.id, email: user.email }
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user?.email) token.email = user.email
      return token
    },
    async session({ session, token }) {
      if (session.user && token.email) session.user.email = token.email as string
      return session
    },
  },
})

// Backward compatibility exports for old auth system (will be removed in Task 3-4)
// These are kept to support existing app/api/admin/auth/login and logout routes
// until they're migrated to NextAuth in later tasks.

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
  name:     'admin_session',
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
  maxAge:   60 * 60 * 24 * 7,
}

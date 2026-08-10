import type { NextAuthConfig } from 'next-auth'

// Edge-safe NextAuth config — no bcrypt/Prisma imports here (used by proxy.ts,
// which runs in the Edge runtime). The Credentials provider itself (which
// needs Node-only deps) is added on top of this in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
  },
  providers: [],
  callbacks: {
    authorized({ request, auth }) {
      const { pathname } = request.nextUrl
      const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
      if (!isAdminRoute) return true
      return !!auth?.user
    },
  },
}

import type { NextAuthConfig } from 'next-auth'

// Edge-safe NextAuth config — no bcrypt/Prisma imports here (used by proxy.ts,
// which runs in the Edge runtime). The Credentials provider itself (which
// needs Node-only deps) is added on top of this in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  // Railway (our deployment target) sets none of AUTH_URL, AUTH_TRUST_HOST,
  // VERCEL, or CF_PAGES, so NextAuth's production default of trustHost:
  // false would reject every /api/auth/* request with UntrustedHost. This
  // config is spread into both the Edge (proxy.ts) and full (lib/auth.ts)
  // NextAuth instances, so setting it here covers both.
  trustHost: true,
  // NextAuth v5 only auto-detects AUTH_SECRET. Fall back to NEXTAUTH_SECRET
  // (the v4 name, still used in our docs/Railway config) so either works.
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/admin/login',
  },
  session: {
    strategy: 'jwt',
    // Restores the 7-day session lifetime of the old JWT scheme (NextAuth
    // defaults to 30 days when maxAge is omitted).
    maxAge: 60 * 60 * 24 * 7,
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

# NextAuth Admin Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the hand-rolled JWT/`auth.users` admin login with NextAuth (Credentials provider), add a self-service Settings page for changing the admin password and email, and seed a default admin login.

**Architecture:** NextAuth v5 (`next-auth@beta`) with a Credentials provider backed by a new `AdminUser` Prisma model. Config is split into an Edge-safe `lib/auth.config.ts` (no Node-only imports — used by `proxy.ts`) and the full `lib/auth.ts` (adds the Credentials provider, which needs `bcryptjs` + Prisma). Session strategy is JWT, matching current behavior. `proxy.ts` swaps its manual token verification for NextAuth's `auth()` wrapper.

**Tech Stack:** Next.js 16 (App Router), NextAuth v5 beta, Prisma 7, bcryptjs, PostgreSQL.

## Global Constraints

- Single admin user only — no multi-user UI, no OAuth providers, no "forgot password" email flow (spec: `docs/superpowers/specs/2026-08-10-nextauth-admin-login-design.md`).
- Session strategy: JWT (no database session table), matching current behavior and keeping `proxy.ts` Edge-compatible.
- Env var: `NEXTAUTH_SECRET` (NextAuth v5 checks `AUTH_SECRET` first, falls back to `NEXTAUTH_SECRET` — confirmed by reading `next-auth`'s `lib/env.js`). This replaces the currently-unset `ADMIN_JWT_SECRET` fallback.
- No test framework exists in this repo (no Jest/Vitest/pytest configured) — verification in every task is via `npx tsc --noEmit` plus a concrete manual command (curl/script) with expected output, matching how every other feature in this codebase has been verified this session.
- This Next.js version renamed `middleware.ts` → `proxy.ts` (confirmed in `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md`). All route-protection code goes in `proxy.ts`, not `middleware.ts`.
- Follow the existing `lib/models/*Model.ts` convention: "No file outside `lib/models/` should ever import prisma directly" (see `lib/models/BaseModel.ts`). `prisma/seed.ts` is exempt (it's a standalone script with its own Prisma instantiation, already established pattern in this repo).

---

### Task 1: `AdminUser` model, migration, seed, and `AdminUserModel`

**Files:**
- Modify: `prisma/schema.prisma` (add `AdminUser` model)
- Create: `prisma/migrations/20260810040000_admin_user/migration.sql`
- Create: `lib/models/AdminUserModel.ts`
- Modify: `prisma/seed.ts` (add default admin upsert)

**Interfaces:**
- Produces: `AdminUserModel.findByEmail(email: string): Promise<{ id: string; email: string; password: string } | null>`, `AdminUserModel.updatePassword(id: string, passwordHash: string): Promise<void>`, `AdminUserModel.updateEmail(id: string, email: string): Promise<void>` — all consumed by Task 2 (Credentials `authorize()`) and Tasks 5–6 (Settings routes).

- [ ] **Step 1: Add the `AdminUser` model to the schema**

In `prisma/schema.prisma`, add this model (put it near the top, after the `Bio` model, since it's another singleton-ish identity concern):

```prisma
// ── Admin User (single admin — NextAuth Credentials) ────────────────────────

model AdminUser {
  id       String @id @default(cuid())
  email    String @unique
  password String   // bcrypt hash
}
```

- [ ] **Step 2: Write the migration**

Create `prisma/migrations/20260810040000_admin_user/migration.sql`:

```sql
-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
```

- [ ] **Step 3: Deploy the migration and regenerate the Prisma client**

Run:
```bash
set -a && source .env && set +a && npx prisma migrate deploy && npx prisma generate
```
Expected: `All migrations have been successfully applied.` and `✔ Generated Prisma Client`.

- [ ] **Step 4: Create `AdminUserModel`**

Create `lib/models/AdminUserModel.ts`:

```ts
import { BaseModel } from './BaseModel'

export class AdminUserModel extends BaseModel {
  static async findByEmail(email: string) {
    return this.db.adminUser.findUnique({ where: { email } })
  }

  static async updatePassword(id: string, passwordHash: string) {
    await this.db.adminUser.update({ where: { id }, data: { password: passwordHash } })
  }

  static async updateEmail(id: string, email: string) {
    await this.db.adminUser.update({ where: { id }, data: { email } })
  }
}
```

- [ ] **Step 5: Seed the default admin user**

In `prisma/seed.ts`, add `import bcrypt from 'bcryptjs'` to the top imports, and add this block inside `main()`, right after the `console.log('✓ Contact')` line (before the Skills section):

```ts
  // ── Admin User (default login — change via /admin/settings) ────────────────
  const defaultAdminPassword = await bcrypt.hash('ChangeMe124', 10)
  await prisma.adminUser.upsert({
    where: { email: 'temp@email.com' },
    update: {},
    create: { email: 'temp@email.com', password: defaultAdminPassword },
  })
  console.log('✓ Admin user (temp@email.com / ChangeMe124 — change this after first login)')
```

- [ ] **Step 6: Run the seed and verify**

Run:
```bash
set -a && source .env && set +a && npm run seed
```
Expected: seed completes, and the log line `✓ Admin user (temp@email.com / ChangeMe124 — change this after first login)` appears.

Then verify the row exists:
```bash
set -a && source .env && set +a && npx tsx -e "
import { PrismaModule } from './lib/prisma'
" 2>/dev/null; set -a && source .env && set +a && node -e "
const { Pool } = require('pg')
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: false })
pool.query('SELECT email FROM portfolio.\"AdminUser\"').then(r => { console.log(r.rows); pool.end() })
"
```
Expected output: `[ { email: 'temp@email.com' } ]`

- [ ] **Step 7: Typecheck and commit**

Run: `npx tsc --noEmit` — expected: no errors.

```bash
git add prisma/schema.prisma prisma/migrations/20260810040000_admin_user prisma/seed.ts lib/models/AdminUserModel.ts
git commit -m "feat: add AdminUser model, migration, and default seed for NextAuth conversion"
```

---

### Task 2: NextAuth core config and route handler

**Files:**
- Create: `lib/auth.config.ts`
- Create: `lib/auth.ts` (this REPLACES the current file — old content deleted, new content is NextAuth setup)
- Create: `app/api/auth/[...nextauth]/route.ts`
- Modify: `package.json` (add `next-auth` dependency)
- Modify: `.env` and `.env.example` (add `NEXTAUTH_SECRET`)

**Interfaces:**
- Consumes: `AdminUserModel.findByEmail` (Task 1)
- Produces: `auth()` (session check, used by Task 3's `proxy.ts` and Tasks 5–6's Settings routes), `signIn`/`signOut` (used by Task 4's login page and Sidebar), `handlers` (used by this task's route handler).

- [ ] **Step 1: Install `next-auth`**

Run: `npm install next-auth@beta`

This installs `next-auth@5.0.0-beta.32` (or newer beta) — confirmed compatible via its `peerDependencies`: `next: "^14.0.0-0 || ^15.0.0 || ^16.0.0"`, `react: "^18.2.0 || ^19.0.0"`. Verify it landed under `dependencies` (not `devDependencies`) in `package.json` — `next-auth` is a runtime dependency.

- [ ] **Step 2: Generate and add `NEXTAUTH_SECRET`**

Run:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add the output to `.env`:
```
NEXTAUTH_SECRET=<paste generated value here>
```

Add to `.env.example` (new section, near the top, replacing conceptually what `ADMIN_JWT_SECRET` was doing — but leave `ADMIN_JWT_SECRET` itself alone for now, it gets removed in Task 3 once `proxy.ts`/`lib/auth.ts` no longer reference it):

```
# ── Admin Auth (NextAuth) ──────────────────────────────────────────────────────
# Used to sign/encrypt admin session JWTs. Any long random string works.
NEXTAUTH_SECRET="your-super-secret-value-min-32-chars"
```

- [ ] **Step 3: Create the Edge-safe config**

Create `lib/auth.config.ts`:

```ts
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
```

- [ ] **Step 4: Replace `lib/auth.ts` with the full NextAuth setup**

Delete the current content of `lib/auth.ts` (the `signAdminToken`/`verifyAdminToken`/`verifyCredentials`/`cookieOptions` JWT logic) and replace the entire file with:

```ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from './auth.config'
import { AdminUserModel } from './models/AdminUserModel'

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
```

- [ ] **Step 5: Create the NextAuth route handler**

Create `app/api/auth/[...nextauth]/route.ts`:

```ts
import { handlers } from '@/lib/auth'

export const { GET, POST } = handlers
```

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors. (`proxy.ts` and the login page/Sidebar still reference the old auth system at this point — they get updated in Tasks 3–4 — so the app won't run correctly yet, but it must typecheck.)

- [ ] **Step 7: Commit**

```bash
git add lib/auth.config.ts lib/auth.ts app/api/auth package.json package-lock.json .env.example
git commit -m "feat: add NextAuth core config, Credentials provider, and route handler"
```

---

### Task 3: Swap `proxy.ts` to NextAuth-based protection

**Files:**
- Modify: `proxy.ts` (full replacement)
- Delete: `lib/auth-edge.ts`

**Interfaces:**
- Consumes: `authConfig` (Task 2)

- [ ] **Step 1: Replace `proxy.ts`**

Replace the entire content of `proxy.ts` with:

```ts
import NextAuth from 'next-auth'
import { authConfig } from '@/lib/auth.config'

export const { auth: proxy } = NextAuth(authConfig)

export const config = {
  matcher: ['/admin/:path*'],
}
```

This uses the Edge-safe `authConfig` directly (not `lib/auth.ts`, which pulls in `bcryptjs` + Prisma/`pg` — Node-only and not Edge-runtime-safe). The `authorized` callback inside `authConfig` (Task 2, Step 3) already excludes `/admin/login` from the protected-route check and returns `!!auth?.user` otherwise. When it returns `false`, NextAuth automatically redirects to `pages.signIn` (`/admin/login`) — confirmed via Auth.js's own middleware-protection docs, which show this exact `export { auth as proxy } from "@/auth"` pattern for this file-naming convention.

- [ ] **Step 2: Delete `lib/auth-edge.ts`**

Run: `rm lib/auth-edge.ts`

This file's only purpose was Edge-safe JWT verification for the old scheme's `proxy.ts` — fully superseded by `authConfig` + NextAuth's own `auth()`.

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors, and no remaining references to `lib/auth-edge`. Confirm with:
```bash
grep -rn "auth-edge" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
git add proxy.ts
git rm lib/auth-edge.ts
git commit -m "feat: protect /admin routes with NextAuth instead of manual JWT verification"
```

---

### Task 4: Login page, logout, and cleanup of the old auth API routes

**Files:**
- Modify: `app/admin/login/page.tsx`
- Modify: `components/admin/Sidebar.tsx`
- Delete: `app/api/admin/auth/login/route.ts`
- Delete: `app/api/admin/auth/login/Untitled` (stray leftover file, not real code)
- Delete: `app/api/admin/auth/logout/route.ts`

**Interfaces:**
- Consumes: `signIn`, `signOut` from `next-auth/react` (client-side wrappers around Task 2's `lib/auth.ts` exports — these work via fetch calls to `app/api/auth/[...nextauth]/route.ts`, no `SessionProvider` required since nothing here uses `useSession()`).

- [ ] **Step 1: Update the login page's submit handler**

In `app/admin/login/page.tsx`, add the import at the top:

```ts
import { signIn } from 'next-auth/react'
```

Replace the `handleLogin` function:

```ts
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setError('Invalid email or password')
      setLoading(false)
    } else {
      router.push('/admin')
      router.refresh()
    }
  }
```

- [ ] **Step 2: Update Sidebar sign-out**

In `components/admin/Sidebar.tsx`:

Replace:
```ts
'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
```
with:
```ts
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
```

Replace:
```ts
export default function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleSignOut = async () => {
    await fetch('/api/admin/auth/logout', { method: 'POST' })
    router.push('/admin/login')
  }
```
with:
```ts
export default function Sidebar() {
  const pathname = usePathname()

  const handleSignOut = () => signOut({ callbackUrl: '/admin/login' })
```

(The `onClick={handleSignOut}` call site further down the file is unchanged — it already just references the function.)

- [ ] **Step 3: Delete the old auth API routes**

Run:
```bash
rm -rf app/api/admin/auth
```

This removes `app/api/admin/auth/login/route.ts`, `app/api/admin/auth/login/Untitled`, and `app/api/admin/auth/logout/route.ts` in one go (the whole `app/api/admin/auth/` directory only contained these).

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`

Expected: no errors.

- [ ] **Step 5: Manual verification**

Start the dev server (`npm run dev`), then:

1. Visit `/admin` while logged out → expect redirect to `/admin/login`.
2. Log in with `temp@email.com` / `ChangeMe124` (seeded in Task 1) → expect redirect to `/admin`, sidebar visible.
3. Click "Sign out" in the sidebar → expect redirect to `/admin/login`.
4. Try logging in with a wrong password → expect the "Invalid email or password" error shown inline, no redirect.

- [ ] **Step 6: Commit**

```bash
git add app/admin/login/page.tsx components/admin/Sidebar.tsx
git rm -r app/api/admin/auth
git commit -m "feat: wire login page and sign-out to NextAuth, remove old auth API routes"
```

---

### Task 5: Admin Settings page — change password

**Files:**
- Create: `app/admin/settings/page.tsx`
- Create: `app/admin/settings/SettingsForm.tsx`
- Create: `app/api/admin/settings/password/route.ts`
- Modify: `components/admin/Sidebar.tsx` (add nav link)

**Interfaces:**
- Consumes: `auth()` (Task 2), `AdminUserModel.findByEmail`/`updatePassword` (Task 1)
- Produces: `SettingsForm` component (extended by Task 6 with the email form)

- [ ] **Step 1: Create the password-change API route**

Create `app/api/admin/settings/password/route.ts`:

```ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { AdminUserModel } from '@/lib/models/AdminUserModel'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { oldPassword, newPassword } = await req.json()
    if (!oldPassword || !newPassword) {
      return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
    }
    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    const user = await AdminUserModel.findByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 })
    }

    const newHash = await bcrypt.hash(newPassword, 10)
    await AdminUserModel.updatePassword(user.id, newHash)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Password change failed:', e)
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create the Settings page (server component)**

Create `app/admin/settings/page.tsx`:

```tsx
import { auth } from '@/lib/auth'
import SettingsForm from './SettingsForm'

export const dynamic = 'force-dynamic'

export default async function AdminSettingsPage() {
  const session = await auth()

  return (
    <div>
      <div className="ar-ph">
        <div>
          <div className="ar-title">Settings</div>
          <div className="ar-sub">{session?.user?.email}</div>
        </div>
      </div>
      <SettingsForm currentEmail={session?.user?.email ?? ''} />
    </div>
  )
}
```

- [ ] **Step 3: Create `SettingsForm` with the password form**

Create `app/admin/settings/SettingsForm.tsx`:

```tsx
'use client'
import { useState } from 'react'

export default function SettingsForm({ currentEmail }: { currentEmail: string }) {
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [pwStatus, setPwStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [pwError, setPwError] = useState('')

  const setPw = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPwForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwError('')

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError('New passwords do not match')
      setPwStatus('error')
      return
    }

    setPwStatus('saving')
    const res = await fetch('/api/admin/settings/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ oldPassword: pwForm.oldPassword, newPassword: pwForm.newPassword }),
    })
    if (res.ok) {
      setPwStatus('saved')
      setPwForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      setTimeout(() => setPwStatus('idle'), 3000)
    } else {
      const data = await res.json().catch(() => null)
      setPwError(data?.error ?? 'Failed to update password')
      setPwStatus('error')
      setTimeout(() => { setPwStatus('idle'); setPwError('') }, 6000)
    }
  }

  return (
    <>
      <div className="ar-card">
        <div className="ar-card-t">Change Password</div>
        {pwStatus === 'saved' && <div className="ar-ok">Password updated</div>}
        {pwStatus === 'error' && <div className="ar-er">{pwError || 'Save failed'}</div>}
        <form onSubmit={handlePasswordSubmit}>
          <div className="ar-field">
            <label className="ar-label">Current Password</label>
            <input
              name="oldPassword" type="password" className="ar-input"
              value={pwForm.oldPassword} onChange={setPw} required autoComplete="current-password"
            />
          </div>
          <div className="ar-g2">
            <div className="ar-field">
              <label className="ar-label">New Password</label>
              <input
                name="newPassword" type="password" className="ar-input"
                value={pwForm.newPassword} onChange={setPw} required minLength={8} autoComplete="new-password"
              />
            </div>
            <div className="ar-field">
              <label className="ar-label">Confirm New Password</label>
              <input
                name="confirmPassword" type="password" className="ar-input"
                value={pwForm.confirmPassword} onChange={setPw} required minLength={8} autoComplete="new-password"
              />
            </div>
          </div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={pwStatus === 'saving'}>
            {pwStatus === 'saving' ? 'Saving...' : 'Update Password'}
          </button>
        </form>
      </div>
    </>
  )
}
```

- [ ] **Step 4: Add the Settings link to the Sidebar**

In `components/admin/Sidebar.tsx`, add a new nav item after the `Contact` entry in the `navItems` array:

```ts
  { href: '/admin/contact',         label: 'Contact',        icon: '◎' },
  { section: 'Account' },
  { href: '/admin/settings',        label: 'Settings',       icon: '⚙' },
]
```

(This replaces just the closing `]` line and the line above it — insert the two new lines before the existing closing bracket.)

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 6: Manual verification**

With the dev server running and logged in as `temp@email.com` / `ChangeMe124`:

1. Visit `/admin/settings` → expect the page to load with "Change Password" card, current email shown in the page subtitle.
2. Submit with a wrong current password → expect inline error "Current password is incorrect".
3. Submit with mismatched new/confirm passwords → expect inline error "New passwords do not match" (no network request made).
4. Submit a valid change (old: `ChangeMe124`, new: `NewPass1234`) → expect "Password updated" success message.
5. Sign out, then log back in with the NEW password → expect success. Change it back to `ChangeMe124` afterward if you want to keep the documented default working for future fresh seeds (or just remember the new one).

- [ ] **Step 7: Commit**

```bash
git add app/admin/settings components/admin/Sidebar.tsx
git commit -m "feat: add admin settings page with change-password form"
```

---

### Task 6: Admin Settings page — change email

**Files:**
- Create: `app/api/admin/settings/email/route.ts`
- Modify: `app/admin/settings/SettingsForm.tsx` (add the email form)

**Interfaces:**
- Consumes: `auth()` (Task 2), `AdminUserModel.findByEmail`/`updateEmail` (Task 1), `signOut` from `next-auth/react` (Task 2, via the client package)

- [ ] **Step 1: Create the email-change API route**

Create `app/api/admin/settings/email/route.ts`:

```ts
import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { auth } from '@/lib/auth'
import { AdminUserModel } from '@/lib/models/AdminUserModel'

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { password, newEmail } = await req.json()
    if (!password || !newEmail) {
      return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
    }

    const user = await AdminUserModel.findByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 })
    }

    const existing = await AdminUserModel.findByEmail(newEmail)
    if (existing && existing.id !== user.id) {
      return NextResponse.json({ error: 'That email is already in use' }, { status: 400 })
    }

    await AdminUserModel.updateEmail(user.id, newEmail)

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('Email change failed:', e)
    return NextResponse.json({ error: 'Failed to update email' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Add the email form to `SettingsForm`**

In `app/admin/settings/SettingsForm.tsx`, add the import at the top:

```ts
import { signOut } from 'next-auth/react'
```

Add new state alongside the existing `pwForm`/`pwStatus`/`pwError` declarations:

```ts
  const [emailForm, setEmailForm] = useState({ password: '', newEmail: currentEmail })
  const [emailStatus, setEmailStatus] = useState<'idle'|'saving'|'saved'|'error'>('idle')
  const [emailError, setEmailError] = useState('')

  const setEmailField = (e: React.ChangeEvent<HTMLInputElement>) =>
    setEmailForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setEmailStatus('saving')
    setEmailError('')
    const res = await fetch('/api/admin/settings/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: emailForm.password, newEmail: emailForm.newEmail }),
    })
    if (res.ok) {
      // The current session JWT still carries the old email — force a fresh
      // sign-in so the next session reflects the change.
      await signOut({ callbackUrl: '/admin/login' })
    } else {
      const data = await res.json().catch(() => null)
      setEmailError(data?.error ?? 'Failed to update email')
      setEmailStatus('error')
      setTimeout(() => { setEmailStatus('idle'); setEmailError('') }, 6000)
    }
  }
```

Add the new card in the returned JSX, right after the closing `</div>` of the "Change Password" `ar-card` (still inside the surrounding `<>...</>` fragment):

```tsx
      <div className="ar-card">
        <div className="ar-card-t">Change Email</div>
        {emailStatus === 'error' && <div className="ar-er">{emailError || 'Save failed'}</div>}
        <form onSubmit={handleEmailSubmit}>
          <div className="ar-field">
            <label className="ar-label">Current Password</label>
            <input
              name="password" type="password" className="ar-input"
              value={emailForm.password} onChange={setEmailField} required autoComplete="current-password"
            />
          </div>
          <div className="ar-field">
            <label className="ar-label">New Email</label>
            <input
              name="newEmail" type="email" className="ar-input"
              value={emailForm.newEmail} onChange={setEmailField} required autoComplete="email"
            />
          </div>
          <button type="submit" className="ar-btn ar-btn-p" disabled={emailStatus === 'saving'}>
            {emailStatus === 'saving' ? 'Saving...' : 'Update Email'}
          </button>
          <p style={{ fontSize: '.75rem', color: '#6b6880', marginTop: '.5rem' }}>
            You'll be signed out after this to refresh your session with the new email.
          </p>
        </form>
      </div>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 4: Manual verification**

With the dev server running and logged in:

1. Visit `/admin/settings`, submit the email form with the wrong password → expect inline error "Password is incorrect", no sign-out.
2. Submit with the correct password and a new email (e.g. `admin2@example.com`) → expect an immediate redirect to `/admin/login` (the forced sign-out).
3. Log in with the NEW email + same password → expect success, landing on `/admin`.
4. Confirm the old email no longer works for login (expect "Invalid email or password").
5. If you want to keep `temp@email.com` working for future fresh seeds/testing, change the email back to `temp@email.com` afterward using the same flow.

- [ ] **Step 5: Commit**

```bash
git add app/admin/settings/SettingsForm.tsx app/api/admin/settings/email
git commit -m "feat: add change-email form with forced re-authentication"
```

---

### Task 7: Remove dead Supabase Auth code

**Files:**
- Delete: `lib/supabase.ts`
- Delete: `lib/supabase-client.ts`
- Modify: `package.json` (remove `@supabase/ssr`, `@supabase/supabase-js`)

**Interfaces:** None — this is pure dead-code removal, confirmed unused during the original NextAuth design exploration (`@supabase/ssr` is never imported anywhere; `lib/supabase.ts`/`lib/supabase-client.ts` are never imported anywhere).

- [ ] **Step 1: Confirm nothing imports these before deleting**

Run:
```bash
grep -rn "lib/supabase\|@supabase/ssr\|@supabase/supabase-js" --include="*.ts" --include="*.tsx" . | grep -v node_modules | grep -v "lib/supabase.ts:" | grep -v "lib/supabase-client.ts:"
```
Expected: no output (confirming no other file imports them).

- [ ] **Step 2: Delete the dead files**

Run:
```bash
rm lib/supabase.ts lib/supabase-client.ts
```

- [ ] **Step 3: Remove the unused packages**

Run:
```bash
npm uninstall @supabase/ssr @supabase/supabase-js
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit` — expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git rm lib/supabase.ts lib/supabase-client.ts
git commit -m "chore: remove unused Supabase Auth SDK and dead client files"
```

---

### Task 8: Drop the old `auth.users` dependency and final end-to-end verification

**Files:** None modified — this task is verification-only, confirming the `auth.users` table (Supabase-leftover) is no longer touched by any code path, and running the full login → settings → logout flow one more time end-to-end.

**Interfaces:** None.

- [ ] **Step 1: Confirm no code references `auth.users` anymore**

Run:
```bash
grep -rn "auth\.users\|encrypted_password" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```
Expected: no output. (The old `lib/auth.ts` query against `auth.users` was deleted in Task 2, Step 4; nothing else in the codebase referenced that table.)

- [ ] **Step 2: Confirm `ADMIN_JWT_SECRET` is no longer read anywhere**

Run:
```bash
grep -rn "ADMIN_JWT_SECRET" --include="*.ts" --include="*.tsx" . | grep -v node_modules
```
Expected: no output. (It was only read by the now-deleted `lib/auth.ts` JWT logic and `lib/auth-edge.ts`.) You can remove the `ADMIN_JWT_SECRET` line from `.env` and `.env.example` at this point — it's no longer used by anything.

- [ ] **Step 3: Full end-to-end manual verification**

With a fresh `npm run dev`:

1. `curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/admin` → expect `307` or `302` (redirect, logged out).
2. Log in via the browser at `/admin/login` with `temp@email.com` / `ChangeMe124` (or whatever you changed it to in Task 5/6's manual verification) → expect landing on `/admin` with the sidebar visible.
3. Navigate to every existing admin section (`/admin/projects`, `/admin/skills`, etc.) → expect all to load normally (proving the new `proxy.ts` protects the whole `/admin/:path*` tree, not just the dashboard).
4. Visit `/admin/settings` → change password → sign out → log back in with the new password.
5. Change email → confirm forced sign-out → log back in with the new email.
6. Sign out, then try visiting `/admin/settings` directly while logged out → expect redirect to `/admin/login`.

- [ ] **Step 4: Update the design spec's status (optional but recommended)**

Add a line at the very top of `docs/superpowers/specs/2026-08-10-nextauth-admin-login-design.md`, right after the `# NextAuth Admin Login — Design` heading:

```markdown
> **Status: Implemented.** See `docs/superpowers/plans/2026-08-10-nextauth-admin-login.md`.
```

- [ ] **Step 5: Commit**

```bash
git add .env.example docs/superpowers/specs/2026-08-10-nextauth-admin-login-design.md
git commit -m "docs: mark NextAuth admin login design as implemented"
```

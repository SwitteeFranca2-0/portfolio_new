# NextAuth Admin Login — Design

## Context

The admin panel (`/admin/**`) is currently protected by a hand-rolled JWT/cookie
scheme:

- `app/admin/login/page.tsx` posts credentials to `app/api/admin/auth/login/route.ts`.
- `lib/auth.ts` signs a JWT (`ADMIN_JWT_SECRET`, unset — falls back to a
  hardcoded secret) and checks credentials against a raw `auth.users` table
  (a leftover Supabase-provisioned table) via direct `pg` queries.
- `lib/auth-edge.ts` duplicates the JWT-verification logic for use in
  `proxy.ts` (this Next.js version's renamed `middleware.ts`), which protects
  the `/admin/:path*` route group.
- `@supabase/ssr` and `@supabase/supabase-js` are installed but unused —
  Supabase Auth was never actually wired up.

This is a single-admin portfolio site (one owner, no multi-user requirement).
Goal: replace the custom scheme with NextAuth, add self-service password and
email change, and seed a default admin login.

## Scope

- Single admin user only. No multi-user management UI, no OAuth providers,
  no password-reset-via-email flow (out of scope — this is a change-password
  form for an already-logged-in admin, not a "forgot password" flow).
- Fully replaces the existing custom JWT/cookie auth and the `auth.users`
  table dependency.

## Credential storage

New Prisma model in the `portfolio` schema:

```prisma
model AdminUser {
  id       String @id @default(cuid())
  email    String @unique
  password String   // bcrypt hash
}
```

## NextAuth configuration

- Credentials provider only, `authorize()` looks up `AdminUser` by email via
  Prisma and compares with `bcrypt.compare`.
- JWT session strategy (no database session table) — matches current
  behavior and keeps `proxy.ts` Edge-compatible.
- New `NEXTAUTH_SECRET` env var, replacing the unset `ADMIN_JWT_SECRET`
  fallback (closes a real security gap: the app currently runs on a
  hardcoded default secret).

## Route protection

`proxy.ts` swaps its manual `verifyAdminToken()` call for NextAuth's
Edge-safe `auth()` helper. Same `/admin/:path*` matcher and
redirect-to-login-on-no-session behavior as today.

## Login page

`app/admin/login/page.tsx` keeps its current form UI. Submit handler calls
NextAuth's `signIn('credentials', { email, password, redirect: false })`
instead of `fetch('/api/admin/auth/login')`. The custom
`/api/admin/auth/login` and `/api/admin/auth/logout` routes are deleted in
favor of NextAuth's `/api/auth/[...nextauth]` and `signOut()`.

## Admin Settings page (new)

New `app/admin/settings/page.tsx`, linked from the admin nav. Two independent
forms:

1. **Change password** — old password, new password, confirm new password
   (client-side match + minimum length check). `POST
   /api/admin/settings/password` re-verifies the old password via
   `bcrypt.compare` before updating the `AdminUser.password` hash.
2. **Change email** — current password, new email. `POST
   /api/admin/settings/email` re-verifies the current password the same way
   before updating `AdminUser.email`.

Both routes require an active NextAuth session (same `/admin/:path*` proxy
protection) and return an inline success/error message on the form.

Since NextAuth JWTs carry the email captured at sign-in, a successful email
change leaves the current session token showing the old email until the
next sign-in. Fix: force sign-out immediately after a successful email
change, so the user re-authenticates and gets a fresh token with the new
email. Password change needs no such handling since the JWT never embeds the
password.

## Seed data

`prisma/seed.ts` gets a new block that upserts (by known fixed `id`, or by
`email` as the unique key) a default `AdminUser`:

```
email:    "temp@email.com"
password: bcrypt.hash("ChangeMe124", <cost>)
```

so any fresh database has working login credentials out of the box. The
admin is expected to change both via the new Settings page after first
login.

## Cleanup

- Delete `lib/auth-edge.ts` and the old JWT logic in `lib/auth.ts`.
- Delete `lib/supabase.ts`, `lib/supabase-client.ts` (dead code, never
  imported).
- Remove `@supabase/ssr` and `@supabase/supabase-js` from `package.json`.
- Delete stray `app/api/admin/auth/login/Untitled`.
- Drop the `auth.users` table dependency — admin identity moves fully into
  Prisma (`AdminUser`).

## Out of scope

- Multi-user support / roles.
- "Forgot password" email-based reset flow.
- Email verification on email change.

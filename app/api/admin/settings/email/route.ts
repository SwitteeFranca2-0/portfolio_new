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
    const { password, newEmail: rawNewEmail } = await req.json()
    if (!password || !rawNewEmail) {
      return NextResponse.json({ error: 'Both fields are required' }, { status: 400 })
    }

    // Normalize so a stray case/whitespace difference at login time (an
    // exact-match lookup in authorize()) can never lock the admin out —
    // there is no forgot-password recovery path in this app.
    const newEmail = String(rawNewEmail).trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return NextResponse.json({ error: 'That does not look like a valid email address' }, { status: 400 })
    }

    const user = await AdminUserModel.findByEmail(session.user.email)
    if (!user) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return NextResponse.json({ error: 'Password is incorrect' }, { status: 400 })
    }

    // No-op: new email is the same as the current one — skip the update and
    // tell the client not to force a sign-out for a change that never
    // happened.
    if (newEmail === session.user.email.toLowerCase()) {
      return NextResponse.json({ ok: true, unchanged: true })
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

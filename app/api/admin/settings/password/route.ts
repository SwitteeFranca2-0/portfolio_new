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

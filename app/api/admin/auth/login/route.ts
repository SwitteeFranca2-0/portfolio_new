import { NextRequest, NextResponse } from 'next/server'
import { verifyCredentials, signAdminToken, cookieOptions } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    const user = await verifyCredentials(email, password)
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const token = await signAdminToken(user.id, user.email)

    const res = NextResponse.json({ ok: true })
    res.cookies.set(cookieOptions.name, token, cookieOptions)
    return res
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}

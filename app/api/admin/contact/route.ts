import { NextRequest, NextResponse } from 'next/server'
import { ContactModel } from '@/lib/models/ContactModel'

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const contact = await ContactModel.update(body)
    return NextResponse.json(contact)
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

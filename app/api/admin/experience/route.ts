import { NextRequest, NextResponse } from 'next/server'
import { ExperienceModel, ExperienceValidationError } from '@/lib/models/ExperienceModel'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await ExperienceModel.create(body)
    return NextResponse.json(created)
  } catch (e) {
    console.error(e)
    if (e instanceof ExperienceValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

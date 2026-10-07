import { NextRequest, NextResponse } from 'next/server'
import { SkillModel, SkillValidationError } from '@/lib/models/SkillModel'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const created = await SkillModel.create(body)
    return NextResponse.json(created)
  } catch (e) {
    console.error(e)
    if (e instanceof SkillValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

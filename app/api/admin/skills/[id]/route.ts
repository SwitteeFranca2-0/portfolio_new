import { NextRequest, NextResponse } from 'next/server'
import { SkillModel, SkillValidationError } from '@/lib/models/SkillModel'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const skill = await SkillModel.update(Number(id), body)
    return NextResponse.json(skill)
  } catch (e) {
    console.error(e)
    if (e instanceof SkillValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await SkillModel.delete(Number(id))
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

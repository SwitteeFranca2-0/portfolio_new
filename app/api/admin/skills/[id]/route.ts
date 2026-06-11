import { NextRequest, NextResponse } from 'next/server'
import { SkillModel } from '@/lib/models/SkillModel'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const skill = await SkillModel.update(Number(id), body)
    return NextResponse.json(skill)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

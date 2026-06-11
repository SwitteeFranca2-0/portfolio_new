import { NextRequest, NextResponse } from 'next/server'
import { ExperienceModel } from '@/lib/models/ExperienceModel'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const exp = await ExperienceModel.update(Number(id), body)
    return NextResponse.json(exp)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

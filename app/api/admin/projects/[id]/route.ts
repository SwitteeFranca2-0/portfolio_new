import { NextRequest, NextResponse } from 'next/server'
import { ProjectModel, ProjectValidationError } from '@/lib/models/ProjectModel'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const project = await ProjectModel.update(Number(id), body)
    return NextResponse.json(project)
  } catch (e) {
    console.error(e)
    if (e instanceof ProjectValidationError) {
      return NextResponse.json({ error: e.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    await ProjectModel.delete(Number(id))
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}

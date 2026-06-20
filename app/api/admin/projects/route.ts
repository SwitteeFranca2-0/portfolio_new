import { NextRequest, NextResponse } from 'next/server'
import { ProjectModel } from '@/lib/models/ProjectModel'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const project = await ProjectModel.create(body)
    if (body.media?.length) {
      await ProjectModel.createMedia(project.id, body.media)
    }
    return NextResponse.json(project)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 })
  }
}

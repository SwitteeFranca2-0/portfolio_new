import { NextRequest, NextResponse } from 'next/server'
import { EducationModel } from '@/lib/models/EducationModel'
export async function GET() {
  const items = await EducationModel.findAll()
  return NextResponse.json(items)
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await EducationModel.create(body)
    return NextResponse.json(item)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

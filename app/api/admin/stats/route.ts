import { NextRequest, NextResponse } from 'next/server'
import { StatModel } from '@/lib/models/StatModel'
export async function GET() {
  const items = await StatModel.findAll()
  return NextResponse.json(items)
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await StatModel.create(body)
    return NextResponse.json(item)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

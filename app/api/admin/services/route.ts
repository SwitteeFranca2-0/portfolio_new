import { NextRequest, NextResponse } from 'next/server'
import { ServiceModel } from '@/lib/models/ServiceModel'
export async function GET() {
  const items = await ServiceModel.findAll()
  return NextResponse.json(items)
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await ServiceModel.create(body)
    return NextResponse.json(item)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

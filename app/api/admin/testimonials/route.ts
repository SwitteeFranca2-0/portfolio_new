import { NextRequest, NextResponse } from 'next/server'
import { TestimonialModel } from '@/lib/models/TestimonialModel'
export async function GET() {
  const items = await TestimonialModel.findAll()
  return NextResponse.json(items)
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await TestimonialModel.create(body)
    return NextResponse.json(item)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

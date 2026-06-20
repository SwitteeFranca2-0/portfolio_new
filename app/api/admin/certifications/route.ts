import { NextRequest, NextResponse } from 'next/server'
import { CertificationModel } from '@/lib/models/CertificationModel'
export async function GET() {
  const items = await CertificationModel.findAll()
  return NextResponse.json(items)
}
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const item = await CertificationModel.create(body)
    return NextResponse.json(item)
  } catch (e) { console.error(e); return NextResponse.json({ error: 'Failed' }, { status: 500 }) }
}

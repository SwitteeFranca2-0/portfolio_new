import { NextRequest, NextResponse } from 'next/server'
import { BioModel } from '@/lib/models/BioModel'

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const bio = await BioModel.update(body)
    return NextResponse.json(bio)
  } catch {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}

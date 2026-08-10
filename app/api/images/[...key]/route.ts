import { NextRequest, NextResponse } from 'next/server'
import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getS3Client, getS3Bucket } from '@/lib/s3'

// Streams objects from a private S3-compatible bucket through the app, so
// images work without the bucket itself needing to be publicly readable.

export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params

  try {
    const client = getS3Client()
    const object = await client.send(new GetObjectCommand({
      Bucket: getS3Bucket(),
      Key:    key.join('/'),
    }))

    const body = await object.Body?.transformToByteArray()
    if (!body) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return new NextResponse(Buffer.from(body), {
      headers: {
        'Content-Type':  object.ContentType ?? 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (e) {
    console.error('Image proxy error:', e)
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
}

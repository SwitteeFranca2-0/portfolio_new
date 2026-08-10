import { S3Client } from '@aws-sdk/client-s3'

// Required env vars: S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME
// Optional: REGION (defaults to us-east-1)

export function getS3Client() {
  const endpoint  = process.env.S3_ENDPOINT
  const accessKey = process.env.AWS_ACCESS_KEY_ID
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY

  if (!endpoint || !accessKey || !secretKey) {
    throw new Error('S3 not configured — set S3_ENDPOINT, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY')
  }

  return new S3Client({
    endpoint,
    region:      process.env.REGION ?? 'us-east-1',
    credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
    forcePathStyle: true,   // required for MinIO and most non-AWS providers
  })
}

export function getS3Bucket() {
  const bucketName = process.env.BUCKET_NAME
  if (!bucketName) throw new Error('BUCKET_NAME not set')
  return bucketName
}

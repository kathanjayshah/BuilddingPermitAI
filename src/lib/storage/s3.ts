import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and start LocalStack (npm run docker:up).`,
    );
  }
  return value;
}

export function getS3Config() {
  return {
    endpoint: requiredEnv("S3_ENDPOINT"),
    region: process.env.S3_REGION ?? "us-east-1",
    accessKeyId: requiredEnv("S3_ACCESS_KEY_ID"),
    secretAccessKey: requiredEnv("S3_SECRET_ACCESS_KEY"),
    bucket: requiredEnv("S3_BUCKET"),
    publicUrl: (process.env.S3_PUBLIC_URL ?? requiredEnv("S3_ENDPOINT")).replace(
      /\/$/,
      "",
    ),
  };
}

let client: S3Client | null = null;
let bucketReady: Promise<void> | null = null;

export function getS3Client(): S3Client {
  if (!client) {
    const config = getS3Config();
    client = new S3Client({
      region: config.region,
      endpoint: config.endpoint,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }
  return client;
}

async function ensureBucket(): Promise<void> {
  if (!bucketReady) {
    bucketReady = (async () => {
      const config = getS3Config();
      const s3 = getS3Client();
      try {
        await s3.send(new HeadBucketCommand({ Bucket: config.bucket }));
      } catch {
        await s3.send(new CreateBucketCommand({ Bucket: config.bucket }));
      }
    })();
  }
  await bucketReady;
}

export function buildObjectUrl(storageKey: string): string {
  const config = getS3Config();
  return `${config.publicUrl}/${config.bucket}/${storageKey
    .split("/")
    .map(encodeURIComponent)
    .join("/")}`;
}

export async function uploadPermitPdf(options: {
  storageKey: string;
  bytes: Buffer;
  contentType: string;
  fileName: string;
}): Promise<{ storageKey: string; fileUrl: string }> {
  await ensureBucket();
  const config = getS3Config();
  const s3 = getS3Client();

  await s3.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: options.storageKey,
      Body: options.bytes,
      ContentType: options.contentType,
      ContentDisposition: `inline; filename="${options.fileName.replace(/"/g, "")}"`,
    }),
  );

  return {
    storageKey: options.storageKey,
    fileUrl: buildObjectUrl(options.storageKey),
  };
}

/** Server-side read for same-origin PDF proxy (avoids browser CORS / blank canvas). */
export async function getPermitPdfObject(storageKey: string): Promise<{
  bytes: Buffer;
  contentType: string;
}> {
  const config = getS3Config();
  const s3 = getS3Client();
  const result = await s3.send(
    new GetObjectCommand({
      Bucket: config.bucket,
      Key: storageKey,
    }),
  );

  if (!result.Body) {
    throw new Error(`Object missing body for key ${storageKey}`);
  }

  const bytes = Buffer.from(await result.Body.transformToByteArray());
  return {
    bytes,
    contentType: result.ContentType ?? "application/pdf",
  };
}
